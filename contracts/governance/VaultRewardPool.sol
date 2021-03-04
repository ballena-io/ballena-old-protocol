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
import "../interfaces/IRewardedVault.sol";

contract VaultRewardPool is Ownable {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    IERC20 public immutable balle;
    uint256 public constant BALLE_PER_BLOCK = 2283105022831050;
    uint256 public startRewardBlock;
    uint256 public lastRewardBlock;

    struct VaultReward {
        uint16 multiplier; // multiplicador x 100
        uint256 rewardRate;
    }
    mapping(address => VaultReward) public vaultReward;
    address[] public activeVaults;
    mapping(address => bool) public allVaults;

    /**
     * @dev Sets the value of {balle} to the BALLE token that the vault will hold and distribute.
     * @param _balle the BALLE token.
     */
    constructor(address _balle) {
        balle = IERC20(_balle);
    }

    modifier onlyValidVault(address _vault) {
        require(allVaults[_vault]==true, "!vault");
        _;
    }

    function activateVault(address _vault) external onlyOwner {
        uint8 numActiveVaults = uint8(activeVaults.length);
        // add pending rewards
        if (numActiveVaults > 0) {
            addVaultRewards();
        }
        uint16 totalParts;
        for (uint16 i=0; i < numActiveVaults; i++) {
            totalParts = totalParts + vaultReward[activeVaults[i]].multiplier;
        }
        totalParts = totalParts + IRewardedVault(_vault).multiplier();
        if (startRewardBlock == 0) {
            startRewardBlock = block.number;
            lastRewardBlock = block.number;
        }
        activeVaults.push(_vault);
        numActiveVaults++;
        allVaults[_vault] = true;
        vaultReward[_vault].rewardRate = 0;
        vaultReward[_vault].multiplier = IRewardedVault(_vault).multiplier();
        for (uint16 i=0; i < numActiveVaults; i++) {
            vaultReward[activeVaults[i]].rewardRate = uint256(1e18).mul(vaultReward[activeVaults[i]].multiplier).div(totalParts);
        }
    }

    function retireVault(address _vault) external onlyOwner onlyValidVault(address(_vault)) {
        // add pending rewards
        addVaultRewards();
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
        for (uint16 i=0; i < numActiveVaults; i++) {
            vaultReward[activeVaults[i]].rewardRate = uint256(1e18).mul(vaultReward[activeVaults[i]].multiplier).div(totalParts);
        }
    }

    function updateMultiplier(address _vault) external onlyOwner onlyValidVault(address(_vault)) {
        // add pending rewards
        addVaultRewards();
        vaultReward[_vault].multiplier = IRewardedVault(_vault).multiplier();
        uint16 totalParts;
        uint8 numActiveVaults = uint8(activeVaults.length);
        for (uint16 i=0; i < numActiveVaults; i++) {
            totalParts = totalParts + vaultReward[activeVaults[i]].multiplier;
        }
        for (uint16 i=0; i < numActiveVaults; i++) {
            vaultReward[activeVaults[i]].rewardRate = uint256(1e18).mul(vaultReward[activeVaults[i]].multiplier).div(totalParts);
        }
    }

    function addVaultRewards() public {
        require(activeVaults.length > 0, "!activeVault");
        require(startRewardBlock > 0, "!started");
        uint256 blocks = uint256(block.number).sub(lastRewardBlock);
        uint256 reward = blocks.mul(BALLE_PER_BLOCK);
        if (balle.balanceOf(address(this)) < reward) {
            reward = balle.balanceOf(address(this));
        }
        if (reward > 0) {
            lastRewardBlock = block.number;
            uint8 numActiveVaults = uint8(activeVaults.length);
            for (uint16 i=0; i < numActiveVaults; i++) {
                uint256 amount = reward.mul(vaultReward[activeVaults[i]].rewardRate).div(1e18);
                balle.safeTransfer(activeVaults[i], amount);
            }
        }
    }

}
