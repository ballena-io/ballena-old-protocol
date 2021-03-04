// contracts/mocks/ERC20Token.sol
// SPDX-License-Identifier: MIT
pragma solidity 0.7.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ERC20Token is ERC20 {

    constructor() ERC20(string memory name_, string memory symbol_) {
        _mint(msg.sender, 100 * (10 ** uint256(decimals())));
    }

}
