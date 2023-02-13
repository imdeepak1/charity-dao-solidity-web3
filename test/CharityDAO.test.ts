import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";

describe("Charity DAO Contract Test Cases", function () {
  let CharityDaoInstance: Contract,
    abiCode: any,
    ownerOne: any,
    ownerTwo: any,
    ownerThree: any,
    receiver: any,
    CharityDaoInstanceTwo: any,
    contractAddress:any;
  const addrZero = "0x0000000000000000000000000000000000000000";
  const name = "SampleCoin";
  const symbol = "P0P";
  const decimals = 8;
  const totalSupply: any = 15000;
  const allowanceIs = 30;



  async function deployERC20Fixture() {
    const ONE_GWEI = 1_000_000_000;
    const amount = ONE_GWEI;
    [ownerOne, ownerTwo, ownerThree, receiver] = await ethers.getSigners();
    abiCode = await ethers.getContractFactory("CharityDAO");
    CharityDaoInstance = await abiCode.deploy(
      [ownerOne.address, ownerTwo.address, ownerThree.address],
      2,
      { value: amount }
    );
    contractAddress = CharityDaoInstance.address;
    return { CharityDaoInstance, ownerOne, ownerTwo, receiver};
  }





  describe("Contract Deployment", async function () {
    it("Return Error if Owners not provided at contract deloyment", async function () {
      async function deployERC20Fixture() {
        abiCode = await ethers.getContractFactory("CharityDAO");
        await abiCode.deploy([], 0);
      }
      await expect(loadFixture(deployERC20Fixture)).to.be.revertedWith(
        "Minimum One Owners required"
      );
    });
    it("Return Error if Invalid required numbers of owners is given", async function () {
      async function deployERC20Fixture() {
        [ownerOne, ownerTwo] = await ethers.getSigners();
        abiCode = await ethers.getContractFactory("CharityDAO");
        const av = await abiCode.deploy(
          [ownerOne.address, ownerTwo.address],
          0
        );
      }
      await expect(loadFixture(deployERC20Fixture)).to.be.revertedWith(
        "Invalid required numbers of owners"
      );
    });
    it("Return Error if invaild owner", async function () {
      async function deployERC20Fixture3() {
        [ownerOne, ownerTwo] = await ethers.getSigners();
        abiCode = await ethers.getContractFactory("CharityDAO");
        await abiCode.deploy([addrZero, ownerTwo.address], 2);
      }
      await expect(loadFixture(deployERC20Fixture3)).to.be.revertedWith(
        "invaild owner"
      );
    });

    it("Return Error if owner is not unique", async function () {
      async function deployERC20Fixture() {
        [ownerOne, ownerTwo] = await ethers.getSigners();
        abiCode = await ethers.getContractFactory("CharityDAO");
        await abiCode.deploy([ownerOne.address, ownerOne.address], 2);
      }
      await expect(loadFixture(deployERC20Fixture)).to.be.revertedWith(
        "owner is not unique"
      );
    });
    it("Address of Owner should be set correctly", async function () {
      const { CharityDaoInstance } = await loadFixture(deployERC20Fixture);
      expect(await CharityDaoInstance.isOwners(ownerOne.address)).to.equal(
        true
      );
      expect(await CharityDaoInstance.isOwners(ownerTwo.address)).to.equal(
        true
      );
      expect(await CharityDaoInstance.isOwners(ownerThree.address)).to.equal(
        true
      );
    });

    it("Required Approval should be equal to Owner array length", async function () {
      expect(await CharityDaoInstance.required.call()).to.equal(2);
    });
    it("Balance of Contract should be add successfully", async function () {
      expect(await CharityDaoInstance.getBalance()).to.equal(1000000000);
    });
  
    it("Should be receive invoke", async () => {
      const response = await ownerOne.sendTransaction({
        to: CharityDaoInstance.address,
        value: ethers.utils.parseEther("1"),
      });
      await expect(response)
        .to.emit(CharityDaoInstance, "DepositFunds")
        .withArgs(ownerOne.address, ethers.utils.parseEther("1"));
    });




    describe("Transfer Token to Stack Holders", function () {
      it("Return Error if caller is not owner", async function () {
        await expect(
          CharityDaoInstance.connect(receiver).transferTokenToStackHolders(receiver.address, 500)
        ).to.be.revertedWith("caller is not owner");
      });
      it("Return Error If Given address is not stack holder of the contract", async function () {
        await expect(
          CharityDaoInstance.transferTokenToStackHolders(receiver.address, 500)
        ).to.be.revertedWith(
          "Given address is not stack holder of the contract"
        );
      });
      it("Token should be transfer successfully", async function () {
        await CharityDaoInstance.connect(
          ownerThree
        ).transferTokenToStackHolders(ownerOne.address, "1000");
        const tx = await CharityDaoInstance.stackHolders(ownerOne.address);
        expect(tx.token).to.equal(2500);
      });
    });




    describe("Submiting Transaction", function () {
      it("Transaction should be submit successfully", async function () {
        await CharityDaoInstance.connect(receiver).submitProposal(
          receiver.address,
          "10000",
          "reason of taking funds",
          "120",
          "0x00"
        );
        const tx = await CharityDaoInstance.proposals(0);
        expect(tx.to).to.equal(receiver.address);
      });

      it("Submit event should be emit successfully", async function () {
        await expect(
          CharityDaoInstance.submitProposal(
            receiver.address,
            "1200000",
            "reason of taking funds",
            "0",
            "0x00",
            {
              from: ownerOne.address,
            }
          )
        )
          .to.emit(CharityDaoInstance, "SubmitProposal")
          .withArgs("1");
      });
    });




    describe("Approve Transaction", function () {
      it("Return Error if Share holder dosen't have efficient share amount to do vote", async function () {
        await expect(CharityDaoInstance.connect(ownerThree).approveProposal(0)).to.be.revertedWith("Share holder dosen't have efficient share amount to do vote");
        await CharityDaoInstance.connect(ownerThree).transferTokenToStackHolders(ownerTwo.address, "500");
        const tx = await CharityDaoInstance.stackHolders(ownerTwo.address);
        expect(tx.token).to.equal(2000);
        await CharityDaoInstance.transferTokenToStackHolders(ownerTwo.address,"500");
        await CharityDaoInstance.connect(ownerTwo).transferTokenToStackHolders(ownerThree.address, "1000");
        const tx1 = await CharityDaoInstance.stackHolders(ownerThree.address);
        expect(tx1.token).to.equal(1000);
        await CharityDaoInstance.connect(ownerOne).transferTokenToStackHolders(ownerTwo.address,"500");
        await CharityDaoInstance.connect(ownerThree).transferTokenToStackHolders(ownerTwo.address,"1000");
      });
      it("Approve should be successfully", async function () {
        await CharityDaoInstance.connect(ownerOne).approveProposal("0");
        await CharityDaoInstance.connect(ownerTwo).approveProposal("0");
        const tx = await CharityDaoInstance.approved("0", ownerOne.address);
        expect(tx).to.equal(true);
        const tx1 = await CharityDaoInstance.approved("0", ownerThree.address);
        expect(tx1).to.equal(false);
        const tx2 = await CharityDaoInstance.approved("0", ownerTwo.address);
        expect(tx2).to.equal(true);
      });

      it("Approve event should be emit successfully", async function () {
        expect(CharityDaoInstance.connect(ownerOne).approveProposal(0))
          .to.emit(CharityDaoInstance, "ApproveProposal")
          .withArgs(ownerOne.address, "0");
      });
      it("Return Error if Voting time limit is exceed", async function () {
        await expect(
          CharityDaoInstance.connect(ownerOne).approveProposal(1)
        ).to.be.revertedWith("Voting time limit is exceed");
      });
      it("Return Error if caller is not owner", async function () {
        await expect(
          CharityDaoInstance.connect(receiver).approveProposal(0)
        ).to.be.revertedWith("caller is not owner");
      });

      it("Return Error if Transaction is not exist", async function () {
        await expect(
          CharityDaoInstance.approveProposal(3, { from: ownerOne.address })
        ).to.be.revertedWith("Transaction is not exist");
      });

      it("Return Error if Transaction is already approved", async function () {
        await expect(
          CharityDaoInstance.approveProposal(0, { from: ownerOne.address })
        ).to.be.revertedWith("Transaction is already approved");
      });
    });




    describe("Execute Transaction", function () {
      it("Return Error if Proposal Approvals are less than the required", async function () {
        await expect(CharityDaoInstance.executeProposal(1)).to.be.revertedWith(
          "Approvals are less then the required"
        );
      });
      it("Return Error if Transaction is not exist", async function () {
        await expect(CharityDaoInstance.executeProposal(4)).to.be.revertedWith(
          "Transaction is not exist"
        );
      });
      it("Execute function should be run successfully", async function () {
        const ab = await CharityDaoInstance.executeProposal(0);
        const tx = await CharityDaoInstance.proposals(0);
        expect(tx.executed).to.equal(true);
      });
      it("Return Error if Transaction is already executed", async function () {
        await expect(
          CharityDaoInstance.executeProposal(0, { from: ownerOne.address })
        ).to.be.revertedWith("Transaction is already executed");
      });
      it("Execute event should be emit successfully", async function () {
        expect(
          CharityDaoInstance.executeProposal(0, { from: ownerOne.address })
        )
          .to.emit(CharityDaoInstance, "ExecuteProposal")
          .withArgs(1);
      });
      it("Return Error if Transaction is already executed(From Approve Function)", async function () {
        await expect(
          CharityDaoInstance.approveProposal(0, { from: ownerOne.address })
        ).to.be.revertedWith("Transaction is already executed");
      });
      async function deployERC20Fixture2() {
        [ownerOne, ownerTwo, receiver] = await ethers.getSigners();
        abiCode = await ethers.getContractFactory("CharityDAO");
        CharityDaoInstanceTwo = await abiCode.deploy(
          [ownerOne.address, ownerTwo.address],
          1
        );
        return { CharityDaoInstanceTwo, ownerOne, ownerTwo, receiver };
      }
      it("Return Error if transaction failled because of insufficient fund", async function () {
        const { CharityDaoInstanceTwo } = await loadFixture(
          deployERC20Fixture2
        );
        await CharityDaoInstanceTwo.submitProposal(
          receiver.address,
          "1200000",
          "reason of taking funds",
          "120",
          "0x00",
          {
            from: ownerOne.address,
          }
        );
        await CharityDaoInstanceTwo.connect(ownerOne).approveProposal("0");
        await CharityDaoInstanceTwo.connect(ownerTwo).approveProposal("0");
        await expect(
          CharityDaoInstanceTwo.executeProposal("0")
        ).to.be.revertedWith("transaction failled");
      });
    });
  });





  describe("ERC20 TESTCASE", function () {
    describe("Contract Deployment", function () {
      it("Name of contract should be set correctly", async function () {
        const { CharityDaoInstance } = await loadFixture(deployERC20Fixture);
        const nameIs = await CharityDaoInstance.name.call();
        expect(nameIs).to.equal(name);
      });
      it("Symbol of contract should be set correctly", async function () {
        const symbolIs = await CharityDaoInstance.symbol.call();
        expect(symbolIs).to.equal(symbol);
      });
      it("Decimals of contract should be set correctly", async function () {
        const decimalIs = await CharityDaoInstance.decimals.call();
        expect(decimalIs).to.equal(decimals);
      });
      it("Check the the toatal supply of contract", async function () {
        const totalSupplyIs = await CharityDaoInstance.totalSupply.call();
        expect(totalSupplyIs).to.equal(totalSupply);
      });
    });

    describe("BalanceOf function test-cases", function () {
      it("Return error if caller is not owner of token", async function () {
        await expect(
          CharityDaoInstance.connect(ownerOne).balanceOf(ownerTwo.address)
        ).to.be.revertedWith("Caller should be owner of token");
      });
      it("Check the the balance of owner", async function () {
        const balanceOf = await CharityDaoInstance.balanceOf(ownerOne.address, {
          from: ownerOne.address,
        });
        expect(balanceOf).to.equal(12000);
      });
    });





    describe("Transfer frunction test-cases", function () {
      it("Should be transfer token correctly", async function () {
        const transferToken = await CharityDaoInstance.transfer(
          receiver.address,
          500,
          { from: ownerOne.address }
        );
        expect(transferToken.confirmations).to.equal(1);
        const balanceOf = await CharityDaoInstance.connect(
          ownerOne.address
        ).balanceOf(ownerOne.address);
        expect(balanceOf).to.equal("11500");
      });
      it("Transfer function emits event", async () => {
        await expect(CharityDaoInstance.transfer(receiver.address, 5))
          .to.emit(CharityDaoInstance, "Transfer")
          .withArgs(ownerOne.address, receiver.address, 5);
      });
      it("Return Error If Owner balance is low for transaction", async function () {
        await expect(
          CharityDaoInstance.transfer(receiver.address, "16100")
        ).to.be.revertedWith("Owner Account blanace is Low");
      });
    });



    describe("Approve function test-cases", function () {
      it("Return Error If Owner balance is low for transaction", async function () {
        await expect(
          CharityDaoInstance.connect(ownerThree).approve(
            ownerTwo.address,
            156000
          )
        ).to.be.revertedWith("Owner Accoun balance is low");
      });
      it("Return error if owner perform self-delegation", async function () {
        await expect(
          CharityDaoInstance.approve(ownerOne.address, allowanceIs, {
            from: ownerOne.address,
          })
        ).to.be.revertedWith("Self-delegation is disallowed");
      });
      it("Approve should be done for token to delegate", async function () {
        await CharityDaoInstance.approve(ownerThree.address, allowanceIs, {
          from: ownerOne.address,
        });
        const tokenBalance = await CharityDaoInstance.allowance(
          ownerOne.address,
          ownerThree.address
        );
        expect(tokenBalance).to.equal(allowanceIs);
      });
      it("Transfer emits event", async () => {
        await expect(
          CharityDaoInstance.approve(ownerThree.address, allowanceIs)
        )
          .to.emit(CharityDaoInstance, "Approval")
          .withArgs(ownerOne.address, ownerThree.address, allowanceIs);
      });
    });



    describe("Allowance Function Test-Cases", function () {
      it("Check the allowance of tokens to the delegate", async function () {
        const allowanceOfSpender = await CharityDaoInstance.allowance(
          ownerOne.address,
          ownerThree.address
        );
        expect(allowanceOfSpender).to.equal(allowanceIs);
      });
    });



    describe("TransferFrom Function Test-Cases", function () {
      it("Check the tranfer of token(transferFrom) is done or not", async function () {
        const balanceOf = await CharityDaoInstance.balanceOf(ownerOne.address);
        expect(allowanceIs).to.be.lte(balanceOf);
        const allowanceOfSpender = await CharityDaoInstance.allowance(
          ownerOne.address,
          ownerThree.address
        );
        expect(allowanceIs).to.be.lte(allowanceOfSpender);
        const transferOfToken = await CharityDaoInstance.connect(
          ownerThree
        ).transferFrom(ownerOne.address, ownerTwo.address, allowanceIs);
        const tokenBalance = await CharityDaoInstance.allowance(
          ownerOne.address,
          ownerThree.address
        );
        expect(tokenBalance).to.equal(0);
      });
      it("Return error if spender is buyer ", async function () {
        await expect(
          CharityDaoInstance.connect(ownerThree).transferFrom(
            ownerOne.address,
            ownerThree.address,
            allowanceIs
          )
        ).to.be.revertedWith("spender can not be buyer");
      });
      it("Return Error If Owner balance is low for transaction", async function () {
        await expect(
          CharityDaoInstance.connect(ownerThree).transferFrom(
            ownerOne.address,
            ownerTwo.address,
            190000
          )
        ).to.be.revertedWith("Blanace of Account is Low");
      });
      it("Return Error if Spender not delegated by Owner or Delegator Account balance is too low", async function () {
        await expect(
          CharityDaoInstance.connect(ownerThree).transferFrom(
            ownerOne.address,
            ownerTwo.address,
            allowanceIs
          )
        ).to.be.revertedWith(
          "Not delegated by Owner or Spender approved balance is low"
        );
      });
      it("Transfer emits event", async () => {
        await expect(CharityDaoInstance.transfer(ownerThree.address, 5))
          .to.emit(CharityDaoInstance, "Transfer")
          .withArgs(ownerOne.address, ownerThree.address, 5);
      });
    });
  });
});
