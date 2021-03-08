// contracts/governance/VaultRewardPool.sol
// SPDX-License-Identifier: MIT
pragma solidity 0.7.4;

import "@openzeppelin/contracts/GSN/Context.sol";
import "@openzeppelin/contracts/math/Math.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract VaultRewardPool is Ownable {
    using SafeMath for uint256;

    IERC20 public immutable balle;
    uint256 public constant BALLE_PER_BLOCK = 2283105022831050;
    uint256 public startRewardBlock;

    struct VaultReward {
        uint16 multiplier; // multiplicador x 100
        uint256 rewardRate;
        uint256 lastPaidBlock;
    }
    mapping(address => VaultReward) public vaultReward;
    address[] public activeVaults;

    event ActivateVault(address vault, uint16 multiplier);
    event RetireVault(address vault);
    event UpdateMultiplier(address vault, uint16 multiplier);

    /**
     * @dev Sets the value of {balle} to the BALLE token that the vault will hold and distribute.
     * @param _balle the BALLE token.
     */
    constructor(address _balle) {
        require(_balle != address(0), "Illegal address");
        
        balle = IERC20(_balle);
    }

    function activateVault(address _vault, uint16 _multiplier) external onlyOwner {
        require(_vault != address(0), "Illegal address");
        require(_multiplier <= 10000, "Multiplier too high");
        require(_multiplier > 0, "Multiplier too low");

        uint8 numActiveVaults = uint8(activeVaults.length);
        // add pending rewards
        if (numActiveVaults > 0) {
            addVaultRewards();
        }
        uint16 totalParts;
        for (uint16 i=0; i < numActiveVaults; i++) {
            totalParts = totalParts + vaultReward[activeVaults[i]].multiplier;
        }
        totalParts = totalParts + _multiplier;
        if (startRewardBlock == 0) {
            startRewardBlock = block.number;
        }
        activeVaults.push(_vault);
        numActiveVaults++;
        vaultReward[_vault].lastPaidBlock = block.number;
        vaultReward[_vault].rewardRate = 0;
        vaultReward[_vault].multiplier = _multiplier;
        // activate rewards rate
        for (uint16 i=0; i < numActiveVaults; i++) {
            vaultReward[activeVaults[i]].rewardRate = uint256(1e18).mul(vaultReward[activeVaults[i]].multiplier).div(totalParts);
        }

        emit ActivateVault(_vault, _multiplier);
    }

    function retireVault(address _vault) external onlyOwner {
        require(_vault != address(0), "Illegal address");
        
        // add pending rewards
        addVaultRewards();
        // deactivate vault
        vaultReward[_vault].rewardRate = 0;
        vaultReward[_vault].multiplier = 0;
        // update activeVaults index
        uint16 indexToBeDeleted;
        uint16 totalParts = 0;
        uint8 numActiveVaults = uint8(activeVaults.length);
        for (uint16 i=0; i < numActiveVaults; i++) {
            if (activeVaults[i] == _vault) {
                indexToBeDeleted = i;
            } else {
                totalParts = totalParts + vaultReward[activeVaults[i]].multiplier;
            }
        }
        if (indexToBeDeleted < numActiveVaults-1) {
            activeVaults[indexToBeDeleted] = activeVaults[numActiveVaults-1];
        }
        activeVaults.pop();
        numActiveVaults--;
        // activate rewards rate
        for (uint16 i=0; i < numActiveVaults; i++) {
            vaultReward[activeVaults[i]].rewardRate = uint256(1e18).mul(vaultReward[activeVaults[i]].multiplier).div(totalParts);
        }

        emit RetireVault(_vault);
    }

    function updateMultiplier(address _vault, uint16 _multiplier) external onlyOwner {
        require(_vault != address(0), "Illegal address");
        require(_multiplier <= 10000, "Multiplier too high");
        require(_multiplier > 0, "Multiplier too low");
        
        // add pending rewards
        addVaultRewards();
        vaultReward[_vault].multiplier = _multiplier;
        uint16 totalParts;
        uint8 numActiveVaults = uint8(activeVaults.length);
        for (uint16 i=0; i < numActiveVaults; i++) {
            totalParts = totalParts + vaultReward[activeVaults[i]].multiplier;
        }
        for (uint16 i=0; i < numActiveVaults; i++) {
            vaultReward[activeVaults[i]].rewardRate = uint256(1e18).mul(vaultReward[activeVaults[i]].multiplier).div(totalParts);
        }

        emit UpdateMultiplier(_vault, _multiplier);
    }

    function addVaultRewards() internal {
        require(activeVaults.length > 0, "No active vaults found");
        require(startRewardBlock > 0, "No started");
        uint8 numActiveVaults = uint8(activeVaults.length);
        for (uint8 i=0; i < numActiveVaults; i++) {
            uint256 blocks = uint256(block.number).sub(vaultReward[activeVaults[i]].lastPaidBlock);
            uint256 reward = blocks.mul(BALLE_PER_BLOCK).mul(vaultReward[activeVaults[i]].rewardRate).div(1e18);
            vaultReward[activeVaults[i]].lastPaidBlock = block.number;
            if (balle.balanceOf(address(this)) < reward) {
                reward = balle.balanceOf(address(this));
            }
            balle.transfer(activeVaults[i], reward);
        }
    }

    /*
    * @dev This function allows a single vault to get his rewards
    */
    function getVaultRewards() external {
        if (vaultReward[msg.sender].multiplier > 0 && startRewardBlock > 0) {
            uint256 blocks = uint256(block.number).sub(vaultReward[msg.sender].lastPaidBlock);
            uint256 reward = blocks.mul(BALLE_PER_BLOCK).mul(vaultReward[msg.sender].rewardRate).div(1e18);
            vaultReward[msg.sender].lastPaidBlock = block.number;
            if (reward > 0) {
                if (balle.balanceOf(address(this)) < reward) {
                    reward = balle.balanceOf(address(this));
                }
                balle.transfer(msg.sender, reward);
            }
        }
    }

}
