import { ethers } from "hardhat";

async function main() {
  const lockedAmount = ethers.utils.parseEther("0.1");  
  const CharityDAO = await ethers.getContractFactory("CharityDAO");
  const DeployCharityDAO = await CharityDAO.deploy(["0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2","0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db","0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB"],2,{ value: lockedAmount });

  const contract = await DeployCharityDAO.deployed();

  console.log(`Voting DAO successfully delpoyed at ${contract.address} `);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// 0xD7aB6Eb2D59a400994C2C269C9a5C974B1655580
// 0xd43C0a135F36A8D8a3961d3d56BdCccD47CBD319