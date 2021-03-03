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

    IERC20 public balle;
    uint256 public startTime;
    uint256 public endTime;
    uint256 public constant DURATION = 365 days;

    uint256 lastRewardAddedTime;

    struct VaultReward {
        uint16 multiplier; // multiplicador x 100
        uint256 rewardRate;
    }
    mapping(address => VaultReward) public vaultReward;
    address[] public activeVaults;
    mapping(address => bool) public allVaults;

    event RewardAdded(address vault, uint256 reward);

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
        // add pending rewards
        if (activeVaults.length > 0) {
            addVaultRewards();
        }
        uint16 totalParts;
        for (uint16 i=0; i<activeVaults.length; i++) {
            totalParts = totalParts + vaultReward[activeVaults[i]].multiplier;
        }
        totalParts = totalParts + IRewardedVault(_vault).multiplier();
        if (startTime == 0) {
            startTime = block.timestamp;
            endTime = startTime + DURATION;
        }
        activeVaults.push(_vault);
        allVaults[_vault] = true;
        vaultReward[_vault].rewardRate = 0;
        vaultReward[_vault].multiplier = IRewardedVault(_vault).multiplier();
        for (uint16 i=0; i<activeVaults.length; i++) {
            vaultReward[activeVaults[i]].rewardRate = uint256(1e18).mul(vaultReward[activeVaults[i]].multiplier).div(totalParts);
        }
    }

    function retireVault(address _vault) external onlyOwner onlyValidVault(address(_vault)) {
        // add pending rewards
        addVaultRewards();
        uint16 indexToBeDeleted;
        uint16 totalParts = 0;
        for (uint16 i=0; i<activeVaults.length; i++) {
            if (activeVaults[i] == _vault) {
                indexToBeDeleted = i;
            } else {
                totalParts = totalParts + vaultReward[activeVaults[i]].multiplier;
            }
        }
        if (indexToBeDeleted < activeVaults.length-1) {
            activeVaults[indexToBeDeleted] = activeVaults[activeVaults.length-1];
        }
        activeVaults.pop();
        for (uint16 i=0; i<activeVaults.length; i++) {
            vaultReward[activeVaults[i]].rewardRate = uint256(1e18).mul(vaultReward[activeVaults[i]].multiplier).div(totalParts);
        }
    }

    function updateMultiplier(address _vault) external onlyOwner onlyValidVault(address(_vault)) {
        // add pending rewards
        addVaultRewards();
        vaultReward[_vault].multiplier = IRewardedVault(_vault).multiplier();
        uint16 totalParts;
        for (uint16 i=0; i<activeVaults.length; i++) {
            totalParts = totalParts + vaultReward[activeVaults[i]].multiplier;
        }
        for (uint16 i=0; i<activeVaults.length; i++) {
            vaultReward[activeVaults[i]].rewardRate = uint256(1e18).mul(vaultReward[activeVaults[i]].multiplier).div(totalParts);
        }
    }

    function addVaultRewards() public {
        require(activeVaults.length > 0, "!activeVault");
        require(startTime > 0, "!startTime");
        uint256 from = lastRewardAddedTime == 0 ? startTime : lastRewardAddedTime;
        lastRewardAddedTime = block.timestamp;
        uint256 rewardTime = lastRewardAddedTime.sub(from);
        uint256 remainingTime = block.timestamp > endTime ? 1 : endTime.sub(from);
        uint256 reward = balle.balanceOf(address(this)).mul(rewardTime).div(remainingTime);
        for (uint16 i=0; i<activeVaults.length; i++) {
            uint256 amount = reward.mul(vaultReward[activeVaults[i]].rewardRate).div(1e18);
            balle.safeTransfer(activeVaults[i], amount);
        }
    }

}