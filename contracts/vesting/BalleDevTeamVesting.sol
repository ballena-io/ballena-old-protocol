// contracts/vesting/BalleDevTeamVesting.sol
// SPDX-License-Identifier: MIT
pragma solidity 0.7.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";

/**
 * Ballena.io Dev Team tokens vesting contract. 
 *
 * According to the Ballena.io Dev Team token distribution structure, there are six parties that should
 * be provided with corresponding token amounts during the first year after the proyect going live:
 *     Project Lead
 *     Blockchain Lead Developer
 *     Front End Lead Developer
 *     Documentation Lead
 *     Security Lead Developer
 *     Ballena.io Premium Group
 *
 * The Balle Dev Team "Vesting" smart contract should be in place to ensure meeting the token distribution
 * commitments.
 *
 * Six instances of the contract will be deployed for holding tokens for each wallet.
 * 
 */
/**********************************************
 * TO-DO List:
 *   - Set final release dates (initVestingStages)
 *
 **********************************************/
contract BalleDevTeamVesting {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    // Address of BALLE token
    IERC20 public immutable balle;

    // Address for receiving tokens
    address public immutable destinationAddress;

    // Tokens vesting stage structure with vesting date and tokens allowed to unlock
    struct VestingStage {
        uint256 date;
        uint256 tokensUnlockedPercentage;
    }

    // Num of stages
    uint8 public constant NUM_STAGES = 5;

    // Array for storing all vesting stages with structure defined above
    VestingStage[NUM_STAGES] public stages;

    // Total amount of tokens sent
    uint256 public initialTokensBalance;
    
    // Amount of tokens already sent
    uint256 public tokensSent;

    // Event raised on each successful withdraw
    event Withdraw(uint256 amount, uint256 timestamp);

    /**
     * @dev We are filling vesting stages array right when the contract is deployed.
     * @param _balle Address of BALLE Token that will be locked on contract.
     * @param _destinationAddress Address of tokens receiver when it is unlocked.
     */
    constructor (
        address _balle, 
        address _destinationAddress
    ) {
        balle = IERC20(_balle);
        destinationAddress = _destinationAddress;
        initVestingStages();
    }
    
    /**
     * @dev Calculate tokens amount that is sent to withdrawAddress.
     * Returns the amount of tokens that can be sent.
     */
    function getAvailableTokensToRelease () public view returns (uint256 tokensToSend) {
        uint256 tokensUnlockedPercentage = getTokensUnlockedPercentage();
        // In the case of stuck tokens we allow the withdrawal of them all after vesting period ends.
        if (tokensUnlockedPercentage >= 100) {
            tokensToSend = balle.balanceOf(address(this));
        } else {
            tokensToSend = getTokensAmountAllowedToRelease(tokensUnlockedPercentage);
        }
    }

    /**
     * @dev Get detailed info about stage.
     * Provides ability to get attributes of every stage from external callers, ie Web3, truffle tests, etc.
     * @param index Vesting stage number. Ordered by ascending date and starting from zero.
     *
     * Returns:
     *  {
     *    "date": "Date of stage in unix timestamp format.",
     *    "tokensUnlockedPercentage": "Percent of tokens allowed to be withdrawn."
     * }
     */
    function getStageAttributes (uint8 index) external view returns (uint256 date, uint256 tokensUnlockedPercentage) {
        return (stages[index].date, stages[index].tokensUnlockedPercentage);
    }

    /**
     * @dev Setup array with vesting stages dates and percents.
     */
    function initVestingStages () internal {
        stages[0].date = 1614960000;
        stages[1].date = 1622563200;
        stages[2].date = 1630512000;
        stages[3].date = 1638374400;
        stages[4].date = 1646150400;

        stages[0].tokensUnlockedPercentage = 20;
        stages[1].tokensUnlockedPercentage = 40;
        stages[2].tokensUnlockedPercentage = 60;
        stages[3].tokensUnlockedPercentage = 80;
        stages[4].tokensUnlockedPercentage = 100;
    }

    /**
     * @dev Main method for release tokens from vesting.
     */
    function release () external {
        // solhint-disable-next-line not-rely-on-time
        require(
            block.timestamp >= stages[0].date,
            "BalleDevTeamVesting: current time is before first release time"
        );
        // Setting initial tokens balance on a first release
        if (initialTokensBalance == 0) {
            setInitialTokensBalance();
        }
        uint256 tokensToSend = getAvailableTokensToRelease();
        require(tokensToSend > 0, "BalleDevTeamVesting: no tokens to release");

        sendTokens(tokensToSend);
    }

    /**
     * @dev Set initial tokens balance when making the first release.
     */
    function setInitialTokensBalance () private {
        initialTokensBalance = balle.balanceOf(address(this));
    }

    /**
     * @dev Send tokens to destinationAddress.
     * @param tokensToSend Amount of tokens will be sent.
     */
    function sendTokens (uint256 tokensToSend) private {
        // Updating tokens sent counter
        tokensSent = tokensSent.add(tokensToSend);
        // Sending allowed tokens amount
        balle.safeTransfer(destinationAddress, tokensToSend);
        // Raising event
        emit Withdraw(tokensToSend, block.timestamp);
    }

    /**
     * @dev Calculate tokens available for release.
     * @param tokensUnlockedPercentage Percent of tokens that are allowed to be sent.
     * Returns the amount of tokens that can be sent according to provided percentage.
     */
    function getTokensAmountAllowedToRelease (uint256 tokensUnlockedPercentage) private view returns (uint256) {
        uint256 totalTokensAllowedToRelease = initialTokensBalance.mul(tokensUnlockedPercentage).div(100);
        uint256 unsentTokensAmount = totalTokensAllowedToRelease.sub(tokensSent);
        return unsentTokensAmount;
    }

    /**
     * @dev Get tokens unlocked percentage on current stage.
     * Returns the percent of tokens allowed to be sent.
     */
    function getTokensUnlockedPercentage () private view returns (uint256) {
        uint256 allowedPercent;
        
        for (uint8 i = 0; i < NUM_STAGES; i++) {
            if (block.timestamp >= stages[i].date) {
                allowedPercent = stages[i].tokensUnlockedPercentage;
            }
        }
        
        return allowedPercent;
    }
}
