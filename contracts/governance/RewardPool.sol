// contracts/governance/RewardPool.sol
// SPDX-License-Identifier: MIT
pragma solidity 0.7.4;

import "@openzeppelin/contracts/GSN/Context.sol";
import "@openzeppelin/contracts/math/Math.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IRewardDistributionRecipient.sol";
import "../interfaces/IExtraRewardPool.sol";
import "./LPTokenWrapper.sol";

contract RewardPool is LPTokenWrapper, IRewardDistributionRecipient {
    using SafeMath for uint256;

    IERC20 public immutable wbnb;
    uint256 public constant DURATION = 1 days;

    uint256 public periodFinish = 0;
    uint256 public rewardRate = 0;
    uint256 public lastUpdateTime;
    uint256 public rewardPerTokenStored;
    mapping(address => uint256) public userRewardPerTokenPaid;
    mapping(address => uint256) public rewards;

    address public immutable treasury;
    address public immutable extraRewardPool;

    /**
     * @dev Reward Fee paid to treasury.
     *
     * {REWARD_FEE} - Fee taxed when a governance token holder gets his reward. 100 === 10% fee.
     * {REWARD_MAX} - Aux const used to safely calc the correct amounts.
     */
    uint constant public REWARD_FEE = 100;
    uint constant public REWARD_MAX = 1000;

    event RewardAdded(uint256 reward);
    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);

    constructor (
        address _wbnb, 
        address _balle,
        address _treasury,
        address _extraRewardPool
    ) LPTokenWrapper(
        address(_balle)
    ) {
        wbnb = IERC20(_wbnb);
        treasury = _treasury;
        extraRewardPool = _extraRewardPool;
    }

    modifier updateReward(address account) {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = lastTimeRewardApplicable();
        if (account != address(0)) {
            rewards[account] = earned(account);
            userRewardPerTokenPaid[account] = rewardPerTokenStored;
        }
        _;
    }

    function lastTimeRewardApplicable() public view returns (uint256) {
        return Math.min(block.timestamp, periodFinish);
    }

    function rewardPerToken() public view returns (uint256) {
        if (totalSupply() == 0) {
            return rewardPerTokenStored;
        }
        return
            rewardPerTokenStored.add(
                lastTimeRewardApplicable()
                    .sub(lastUpdateTime)
                    .mul(rewardRate)
                    .mul(1e18)
                    .div(totalSupply())
            );
    }

    function earned(address account) public view returns (uint256) {
        return
            balanceOf(account)
                .mul(rewardPerToken().sub(userRewardPerTokenPaid[account]))
                .div(1e18)
                .add(rewards[account]);
    }

    // stake visibility is public as overriding LPTokenWrapper's stake() function
    function stake(uint256 amount) public override updateReward(msg.sender) {
        require(amount > 0, "Cannot stake 0");
        super.stake(amount);
        emit Staked(msg.sender, amount);
    }

    function withdraw(uint256 amount) public override updateReward(msg.sender) {
        require(amount > 0, "Cannot withdraw 0");
        super.withdraw(amount);
        emit Withdrawn(msg.sender, amount);
    }

    function exit() external {
        withdraw(balanceOf(msg.sender));
        getReward();
    }

    function getReward() public updateReward(msg.sender) {
        uint256 reward = earned(msg.sender);
        if (reward > 0) {
            rewards[msg.sender] = 0;
            uint256 extraReward = IExtraRewardPool(extraRewardPool).getExtraReward(reward);
            reward += extraReward;
            uint256 rewardFee = reward.mul(REWARD_FEE).div(REWARD_MAX);
            balle.transfer(treasury, rewardFee);
            uint256 amount = reward.sub(rewardFee);
            if (balle.balanceOf(address(this)) < totalSupply().add(amount)) {
                // just in case rounding
                amount = balle.balanceOf(address(this)).sub(totalSupply());
            }
            balle.transfer(msg.sender, amount);
            emit RewardPaid(msg.sender, reward);
        }
    }

    function notifyRewardAmount(uint256 reward)
        external override
        onlyRewardDistribution
        updateReward(address(0))
    {
        if (block.timestamp >= periodFinish) {
            rewardRate = reward.div(DURATION);
        } else {
            uint256 remaining = periodFinish.sub(block.timestamp);
            uint256 leftover = remaining.mul(rewardRate);
            rewardRate = reward.add(leftover).div(DURATION);
        }
        lastUpdateTime = block.timestamp;
        periodFinish = block.timestamp.add(DURATION);
        emit RewardAdded(reward);
    }

}
