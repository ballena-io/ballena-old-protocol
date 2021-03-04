// contracts/mocks/ERC20Token.sol
// SPDX-License-Identifier: MIT
pragma solidity 0.7.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ERC20Token is ERC20 {

    constructor(string memory _name, string memory _symbol) ERC20(string(_name), string(_symbol)) {
        _mint(msg.sender, 100 * (10 ** uint256(decimals())));
    }

}
