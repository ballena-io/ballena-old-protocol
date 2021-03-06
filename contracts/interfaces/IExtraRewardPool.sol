// contracts/interfaces/IExtraRewardPool.sol
// SPDX-License-Identifier: MIT
pragma solidity 0.7.4;

interface IExtraRewardPool {
    function getExtraReward(uint256 _amount) external returns (uint256);
}
