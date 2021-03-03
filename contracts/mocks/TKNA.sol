// contracts/mocks/TKNA.sol
// SPDX-License-Identifier: MIT
pragma solidity 0.7.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TKNA is ERC20 {

    constructor() ERC20("Token A", "TKNA") {
        _mint(msg.sender, 100 * (10 ** uint256(decimals())));
    }

}
