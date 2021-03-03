// contracts/mocks/TKNB.sol
// SPDX-License-Identifier: MIT
pragma solidity 0.7.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TKNB is ERC20 {

    constructor() ERC20("Token B", "TKNB") {
        _mint(msg.sender, 100 * (10 ** uint256(decimals())));
    }

}
