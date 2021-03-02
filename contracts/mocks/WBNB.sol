// contracts/mocks/WBNB.sol
// SPDX-License-Identifier: MIT
pragma solidity 0.7.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract WBNB is ERC20 {

    constructor() ERC20("Wrapped BNB", "WBNB") {
        _mint(msg.sender, 100 * (10 ** uint256(decimals())));
    }

}
