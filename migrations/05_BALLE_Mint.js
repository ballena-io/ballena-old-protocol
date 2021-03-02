const fs = require('fs');

const BALLE = artifacts.require("BALLE");
const RewardPool = artifacts.require("RewardPool");
const VaultRewardPool = artifacts.require("VaultRewardPool");

module.exports = async function (deployer, network, accounts) {
  // Load network config data
  const networkConfigFilename = `.env.${network}.json`;
  const networkConfig = JSON.parse(fs.readFileSync(networkConfigFilename));

  if (network == "bsc_mainnet") {
  } else {
    const balleToken = await BALLE.deployed();
    const rewardPool = await RewardPool.deployed();
    const vaultRewardPool = await VaultRewardPool.deployed();

    await balleToken.mint(rewardPool.address, 13000)
    await balleToken.mint(vaultRewardPool.address, 24000)

    for (i=0; i<networkConfig.devTeamVestingAddress.length-1; i++) {
      await balleToken.mint(networkConfig.devTeamVestingAddress[i], 400)
    }
    await balleToken.mint(networkConfig.devTeamTimelockAddress, 600)
  }

};
