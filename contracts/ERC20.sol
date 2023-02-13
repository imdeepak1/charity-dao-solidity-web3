// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

contract ERC20 {
    event Transfer(address indexed from, address indexed to, uint tokens);
    event Approval(address indexed ownerOfToken, address indexed spender, uint tokens);

    string public name = "SampleCoin";
    string public symbol = "P0P";
    uint8 public decimals = 8;

    mapping(address => uint256) isBalanceOf;

    mapping(address => mapping(address => uint256)) allowed;

    uint256 totalSupplyIs;
    
    constructor() {
        totalSupplyIs = 15000;
        isBalanceOf[msg.sender] = totalSupplyIs;
    }
  
    function totalSupply() public view returns (uint256) {
        return totalSupplyIs;
    }

    function balanceOf(address ownerOfToken) public view returns (uint) {
        require(msg.sender == ownerOfToken,"Caller should be owner of token");
        return isBalanceOf[ownerOfToken];
    }

    function transfer(address receiver, uint tokenIs) public returns (bool) {
        require(tokenIs <= isBalanceOf[msg.sender],"Owner Account blanace is Low");
        isBalanceOf[msg.sender] -= tokenIs;
        isBalanceOf[receiver] += tokenIs;
        emit Transfer(msg.sender, receiver, tokenIs);
        return true;
    }

    function approve(address delegate, uint tokenIs) public returns (bool) {
        require(tokenIs <= isBalanceOf[msg.sender],"Owner Accoun balance is low");
        require(delegate != msg.sender, "Self-delegation is disallowed");
        allowed[msg.sender][delegate] = tokenIs;
        emit Approval(msg.sender, delegate, tokenIs);
        return true;
    }

    function allowance(address owner, address delegate) public view returns (uint) {
        return allowed[owner][delegate];
    }

    function transferFrom(address owner, address buyer, uint tokenIs) public returns (bool) {
        require(buyer != msg.sender,"spender can not be buyer");
        require(tokenIs <= isBalanceOf[owner],"Blanace of Account is Low");
        require(tokenIs <= allowed[owner][msg.sender],"Not delegated by Owner or Spender approved balance is low");
        isBalanceOf[owner] -= tokenIs;
        allowed[owner][msg.sender] -= tokenIs;
        isBalanceOf[buyer] += tokenIs;
        emit Transfer(owner, buyer, tokenIs);
        return true;
    }
}
