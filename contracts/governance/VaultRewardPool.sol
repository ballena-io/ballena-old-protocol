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

/**********************************************
 * TO-DO List:
 *   - Rework function updateRewardRate (derived from original notifyRewardAmount) to set the rewardRate of each vault
 *     it may be necessary to keep track of all changes along time, so each user can take the correct reward calculated 
 *     with the corresponding rewardRate on every period
 *   - Write tests to check correct calculations
 *
 **********************************************/
contract VaultRewardPool is Ownable {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    IERC20 public balle;
    uint256 public startTime = 0;
    uint256 public constant DURATION = 365 days;

    struct VaultReward {
        uint256 periodFinish;
        uint256 rewardRate;
        uint256 lastUpdateTime;
        uint256 rewardPerTokenStored;
        mapping(address => uint256) userRewardPerTokenPaid;
        mapping(address => uint256) rewards;
        uint16 multiplier; // multiplicador x 100
        bool retired;
    }
    mapping(address => VaultReward) public vaultReward;
    address[] public activeVaults;
    mapping(address => bool) public allVaults;

    event RewardAdded(address vault, uint256 reward);
    event RewardPaid(address indexed user, uint256 reward);

    /**
     * @dev Sets the value of {balle} to the BALLE token that the vault will hold and distribute.
     * @param _balle the BALLE token.
     */
    constructor(address _balle) {
        balle = IERC20(_balle);
    }

    modifier updateReward(address _vault, address _account) {
        vaultReward[_vault].rewardPerTokenStored = rewardPerToken(_vault);
        vaultReward[_vault].lastUpdateTime = lastTimeRewardApplicable(_vault);
        if (_account != address(0)) {
            vaultReward[_vault].rewards[_account] = earned(_vault, _account);
            vaultReward[_vault].userRewardPerTokenPaid[_account] = vaultReward[_vault].rewardPerTokenStored;
        }
        _;
    }

    modifier onlyValidVault(address _vault) {
        require(allVaults[_vault], "!vault");
        _;
    }

    function lastTimeRewardApplicable(address _vault) public view onlyValidVault(address(_vault)) returns (uint256) {
        return Math.min(block.timestamp, vaultReward[_vault].periodFinish);
    }

    function rewardPerToken(address _vault) public view onlyValidVault(address(_vault)) returns (uint256) {
        if (IERC20(_vault).totalSupply() == 0) {
            return vaultReward[_vault].rewardPerTokenStored;
        }
        return
            vaultReward[_vault].rewardPerTokenStored.add(
                lastTimeRewardApplicable(_vault)
                    .sub(vaultReward[_vault].lastUpdateTime)
                    .mul(vaultReward[_vault].rewardRate)
                    .mul(1e18)
                    .div(IERC20(_vault).totalSupply())
            );
    }

    function earned(address _vault, address _account) public view onlyValidVault(address(_vault)) returns (uint256) {
        return
            IERC20(_vault).balanceOf(_account)
                .mul(rewardPerToken(_vault).sub(vaultReward[_vault].userRewardPerTokenPaid[_account]))
                .div(1e18)
                .add(vaultReward[_vault].rewards[_account]);
    }

    function activateVault(address _vault) external onlyOwner {
        uint16 totalParts;
        for (uint16 i=0; i<activeVaults.length; i++) {
            totalParts = totalParts + vaultReward[activeVaults[i]].multiplier;
        }
        totalParts = totalParts + IRewardedVault(_vault).multiplier();
        activeVaults.push(_vault);
        allVaults[_vault] = true;
        if (startTime == 0) {
            startTime = block.timestamp;
        }
        vaultReward[_vault].periodFinish = 0;
        vaultReward[_vault].rewardRate = 0;
        vaultReward[_vault].multiplier = IRewardedVault(_vault).multiplier();
        vaultReward[_vault].retired = false;
        for (uint16 i=0; i<activeVaults.length; i++) {
            updateRewardRate(activeVaults[i], totalParts, vaultReward[activeVaults[i]].multiplier);
        }
    }

    function retireVault(address _vault) external onlyOwner onlyValidVault(address(_vault)) {
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
            updateRewardRate(activeVaults[i], totalParts, vaultReward[activeVaults[i]].multiplier);
        }
    }

    function updateMultiplier(address _vault) public onlyValidVault(address(_vault)) {
        vaultReward[_vault].multiplier = IRewardedVault(_vault).multiplier();
        uint16 totalParts;
        for (uint16 i=0; i<activeVaults.length; i++) {
            totalParts = totalParts + vaultReward[activeVaults[i]].multiplier;
        }
        for (uint16 i=0; i<activeVaults.length; i++) {
            updateRewardRate(activeVaults[i], totalParts, vaultReward[activeVaults[i]].multiplier);
        }
    }

    function updateShares(address _vault) public onlyValidVault(address(_vault)) updateReward(address(_vault), msg.sender) {
    }

    function getReward(address _vault) public onlyValidVault(address(_vault)) updateReward(address(_vault), msg.sender) {
        uint256 reward = earned(_vault, msg.sender);
        if (reward > 0) {
            vaultReward[_vault].rewards[msg.sender] = 0;
            balle.safeTransfer(msg.sender, reward);
            emit RewardPaid(msg.sender, reward);
        }
    }

    function updateRewardRate(address _vault, uint16 _totalParts, uint16 _vaultParts) internal updateReward(address(_vault), address(0)){
        // reward = saldo del contrato * vaultParts / totalParts
        uint256 reward = balle.balanceOf(address(this)).mul(_vaultParts).div(_totalParts);
        if (block.timestamp >= vaultReward[_vault].periodFinish) {
            vaultReward[_vault].rewardRate = reward.div(DURATION);
        } else {
            uint256 remaining = vaultReward[_vault].periodFinish.sub(block.timestamp);
            uint256 leftover = remaining.mul(vaultReward[_vault].rewardRate);
            vaultReward[_vault].rewardRate = reward.add(leftover).div(DURATION);
        }
        vaultReward[_vault].lastUpdateTime = block.timestamp;
        vaultReward[_vault].periodFinish = block.timestamp.add(DURATION);
    }

}