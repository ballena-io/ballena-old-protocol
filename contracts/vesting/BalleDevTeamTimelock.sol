// contracts/vesting/BalleDevTeamTimelock.sol
// SPDX-License-Identifier: MIT
pragma solidity 0.7.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";

/**
 * @dev A token holder contract that will allow a beneficiary to extract the
 * tokens after a given release time.
 *
 * Useful for simple vesting schedules, all token released after the release time set
 *
 * For a more complete vesting schedule, see {BalleDevTeamVesting}.
 */
contract BalleDevTeamTimelock {
    using SafeERC20 for IERC20;

    // Address of BALLE token
    IERC20 public balle;

    // Address for receiving tokens
    address public destinationAddress;

    // timestamp when token release is enabled
    uint256 public releaseTime;

    // Event raised on withdraw
    event Withdraw(uint256 amount, uint256 timestamp);

    constructor(
        address _balle, 
        address _destinationAddress,
        uint256 _releaseTime
    ) {
        // solhint-disable-next-line not-rely-on-time
        require(
            _releaseTime > block.timestamp,
            "BalleDevTeamTimelock: release time is before current time"
        );
        require(_balle != address(0), "Illegal address");
        require(_destinationAddress != address(0), "Illegal address");

        balle = IERC20(_balle);
        destinationAddress = _destinationAddress;
        releaseTime = _releaseTime;
    }

    /**
     * @notice Transfers tokens held by timelock to beneficiary.
     */
    function release() external {
        // solhint-disable-next-line not-rely-on-time
        require(
            block.timestamp >= releaseTime,
            "BalleDevTeamTimelock: current time is before release time"
        );

        uint256 amount = balle.balanceOf(address(this));
        require(amount > 0, "BalleDevTeamTimelock: no tokens to release");

        balle.safeTransfer(destinationAddress, amount);

        // Raising event
        emit Withdraw(amount, block.timestamp);
    }
}
