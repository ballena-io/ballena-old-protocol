// contracts/governance/ExtraRewardPool.sol
// SPDX-License-Identifier: MIT
pragma solidity 0.7.4;

import "@openzeppelin/contracts/GSN/Context.sol";
import "@openzeppelin/contracts/math/Math.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @dev This contract holds the BALLE supply that will be rewarded to holders in governance pools.
 */
contract ExtraRewardPool is Ownable {
    using SafeMath for uint256;

    IERC20 public immutable balle;

    mapping(address => uint16) public rewardedPools;

    /**
     * @dev Sets the value of {balle} to the BALLE token that the vault will hold and distribute.
     * @param _balle the BALLE token.
     */
    constructor(address _balle) {
        balle = IERC20(_balle);
    }

    function activatePool(address _pool, uint16 _multiplier) external onlyOwner {
        require(_multiplier <= 10000, "Multiplier too high");
        rewardedPools[_pool] = _multiplier;
    }

    function getExtraReward(uint256 _amount) public returns (uint256) {
        uint256 extraReward = _amount.mul(rewardedPools[msg.sender]);
        if (extraReward > 0) {
            uint256 balance = balle.balanceOf(address(this));
            if (balance < extraReward) {
                extraReward = balance;
            }
            if (extraReward > 0) {
                balle.transfer(msg.sender, extraReward);
            }
        }
        return extraReward;
    }

}
