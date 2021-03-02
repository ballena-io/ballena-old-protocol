const fs = require('fs');

const BALLE = artifacts.require("BALLE");
const RewardPool = artifacts.require("RewardPool");
const VaultRewardPool = artifacts.require("VaultRewardPool");
const BalleDevTeamVesting = artifacts.require("BalleDevTeamVesting");
const BalleDevTeamTimelock = artifacts.require("BalleDevTeamTimelock");

module.exports = async function (deployer, network, accounts) {
  if (network == "bsc_mainnet") {
  } else {
    const balleToken = await BALLE.deployed();
    const rewardPool = await RewardPool.deployed();
    const vaultRewardPool = await VaultRewardPool.deployed();
    const devTeamVesting = await BalleDevTeamVesting.deployed();
    // TODO: Truffle only allows access to one instance of BalleDevTeamVesting, add all instances in config to mint for all
    const devTeamTimelock = await BalleDevTeamTimelock.deployed();

    await balleToken.mint(rewardPool.address, 13300)
    await balleToken.mint(vaultRewardPool.address, 24000)
    await balleToken.mint(devTeamVesting.address, 400)
    await balleToken.mint(devTeamTimelock.address, 300)

  } 
};
