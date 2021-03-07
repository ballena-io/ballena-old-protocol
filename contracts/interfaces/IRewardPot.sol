// contracts/interfaces/IRewardPot.sol
// SPDX-License-Identifier: MIT
pragma solidity 0.7.4;

interface IRewardPot {
    function getReward(uint256 _amount) external returns (uint256);
}
