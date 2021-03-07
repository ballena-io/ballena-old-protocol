// contracts/interfaces/IRewardedVault.sol
// SPDX-License-Identifier: MIT
pragma solidity 0.7.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IVaultRewardPool.sol";

abstract contract IRewardedVault is Ownable {
    uint16 public multiplier;
    address public immutable vaultRewardPool;

    event ActivateVault();
    event RetireVault();
    event UpdateMultiplier(uint16 multiplier);

    /**
     * @dev Adds the BALLE token distribution as rewards to the Vault.
     * @param _vaultRewardPool the address of the reward pool for the vault.
     * @param _multiplier the reward multiplier for the vault (100 = x1).
     */
    constructor (address _vaultRewardPool, uint16 _multiplier) {
        require(_vaultRewardPool != address(0), "Illegal address");
        
        vaultRewardPool = _vaultRewardPool;
        multiplier = _multiplier;
    }

    /**
     * @dev Function to activate the vault so it can start to receive rewards from VaultRewardPool.
     */
    function activateVault() external onlyOwner {
        IVaultRewardPool(vaultRewardPool).activateVault(address(this));

        emit ActivateVault();
    }

    /**
     * @dev Function to retire the vault so it stops receiving rewards from VaultRewardPool.
     */
    function retireVault() external onlyOwner {
        IVaultRewardPool(vaultRewardPool).retireVault(address(this));

        emit RetireVault();
    }

    /**
     * @dev Function to modify the multiplier of rewards received from VaultRewardPool.
     */
    function updateMultiplier(uint16 _multiplier) external onlyOwner {
        require(_multiplier <= 10000, "Multiplier too high");
        require(_multiplier > 0, "Multiplier too low");
        multiplier = _multiplier;
        IVaultRewardPool(vaultRewardPool).updateMultiplier(address(this));

        emit UpdateMultiplier(_multiplier);
    }

    /**
     * @dev Function for various UIs to display the current BALLE reward per share.
     * Returns an uint256 with 18 decimals of how much BALLE one vault share represents.
     */
    function getRewardPerFullShare() virtual external view returns (uint256);


    /**
     * @dev Function to add pending rewards to vaults.
     */
    function addVaultRewards() public {
        IVaultRewardPool(vaultRewardPool).addVaultRewards();
    }
}
