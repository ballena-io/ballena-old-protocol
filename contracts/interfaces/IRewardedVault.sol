// contracts/interfaces/IRewardedVault.sol
// SPDX-License-Identifier: MIT
pragma solidity 0.7.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IVaultRewardPool.sol";

abstract contract IRewardedVault is Ownable {
    uint16 public multiplier;
    address vaultRewardPool;
    bool public active;

    event ActivateVault();
    event RetireVault();
    event UpdateMultiplier(uint16 multiplier);

    /**
     * @dev Adds the BALLE token distribution as rewards to the Vault.
     * @param _vaultRewardPool the address of the reward pool for the vault.
     * @param _multiplier the reward multiplier for the vault (100 = x1).
     */
    constructor (address _vaultRewardPool, uint16 _multiplier) {
        vaultRewardPool = _vaultRewardPool;
        multiplier = _multiplier;
    }

    function activateVault() external onlyOwner {
        IVaultRewardPool(vaultRewardPool).activateVault(address(this));

        emit ActivateVault();
    }

    function retireVault() external onlyOwner {
        IVaultRewardPool(vaultRewardPool).retireVault(address(this));

        emit RetireVault();
    }

    function updateMultiplier(uint16 _multiplier) external onlyOwner {
        require(_multiplier <= 10000, "Multiplier too high");
        require(_multiplier > 0, "Multiplier too low");
        multiplier = _multiplier;
        IVaultRewardPool(vaultRewardPool).updateMultiplier(address(this));

        emit UpdateMultiplier(_multiplier);
    }

    function updateShares() internal {
        IVaultRewardPool(vaultRewardPool).updateShares(address(this));
    }

    function getReward() public {
        IVaultRewardPool(vaultRewardPool).getReward(address(this));
    }
}
