// contracts/governance/RewardPot.sol
// SPDX-License-Identifier: MIT
pragma solidity 0.7.4;

import "@openzeppelin/contracts/GSN/Context.sol";
import "@openzeppelin/contracts/math/Math.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IRewardPot.sol";

/**
 * @dev This contract holds the BALLE commisions from vaults that will be 
 * rewarded to holders in governance pools.
 */
contract RewardPot is Ownable, IRewardPot {
    using SafeMath for uint256;

    IERC20 public immutable balle;

    mapping(address => bool) public rewardedPools;

    /**
     * @dev Sets the value of {balle} to the BALLE token that the vault will hold and distribute.
     * @param _balle the BALLE token.
     */
    constructor(address _balle) {
        balle = IERC20(_balle);
    }

    function activatePool(address _pool, bool _state) external onlyOwner {
        rewardedPools[_pool] = _state;
    }

    function getReward(uint256 _amount) override external returns (uint256) {
        require(rewardedPools[msg.sender] = true, "!authorized");

        uint256 reward = _amount;
        if (reward > 0) {
            uint256 balance = balle.balanceOf(address(this));
            if (balance < reward) {
                reward = balance;
            }
            if (reward > 0) {
                balle.transfer(msg.sender, reward);
            }
        }
        return reward;
    }

}
