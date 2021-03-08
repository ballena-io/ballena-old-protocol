// contracts/mocks/RewardedVaultMock1.sol
// SPDX-License-Identifier: MIT
pragma solidity 0.7.4;

import "../interfaces/IVaultRewardPool.sol";

contract RewardedVaultMock1 {

    IVaultRewardPool vaultRewardPool;

    constructor (
        address _vaultRewardPool
    ){
        vaultRewardPool = IVaultRewardPool(_vaultRewardPool);
    }

    function getRewards() public {
        // get vault pending BALLE rewards
        vaultRewardPool.getVaultRewards();
    }
    
}
