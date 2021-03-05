// contracts/interfaces/IActionable.sol
// SPDX-License-Identifier: MIT
pragma solidity 0.7.4;

import "@openzeppelin/contracts/access/Ownable.sol";

abstract contract IActionable is Ownable {
    address public actionAllowed;

    modifier onlyActionAllowed() {
        require(
            _msgSender() == actionAllowed,
            "Caller is not allowed to launch this action"
        );
        _;
    }

    function setActionAllowed(address _actionAllowed) external onlyOwner {
        actionAllowed = _actionAllowed;
    }
}
