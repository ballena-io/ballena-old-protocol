// contracts/interfaces/IVaultRewardPool.sol
// SPDX-License-Identifier: MIT
pragma solidity 0.7.4;

interface IVaultRewardPool {
    function activateVault(address _vault) external;
    function retireVault(address _vault) external;
    function updateMultiplier(address _vault) external;
    function updateShares(address _vault) external;
    function getReward(address _vault) external;
}
