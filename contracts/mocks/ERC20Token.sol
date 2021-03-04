// contracts/mocks/ERC20Token.sol
// SPDX-License-Identifier: MIT
pragma solidity 0.7.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./IMintableERC20.sol";

contract ERC20Token is ERC20, IMintableERC20 {

    constructor(string memory _name, string memory _symbol) ERC20(string(_name), string(_symbol)) {
        _mint(msg.sender, 100 * (10 ** uint256(decimals())));
    }

    function mint(address _to, uint256 _amount) public override {
        _mint(_to, _amount);
    }
    
    function burn(address _from ,uint256 _amount) public override {
        _burn(_from, _amount);
    }
}
