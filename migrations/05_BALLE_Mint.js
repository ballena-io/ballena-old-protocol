const fs = require('fs');

const BALLE = artifacts.require('BALLE');
const RewardPool = artifacts.require('RewardPool');
const VaultRewardPool = artifacts.require('VaultRewardPool');

module.exports = async function (deployer, network, accounts) {
  // Load network config data
  const networkConfigFilename = `.env.${network}.json`;
  const networkConfig = JSON.parse(fs.readFileSync(networkConfigFilename));

  // Get addresses
  const balleAddress = networkConfig.BALLE;
  const rewardPoolAddress = networkConfig.rewardPoolAddress;
  const vaultRewardPoolAddress = networkConfig.vaultRewardPoolAddress;
  const devTeamVestingAddress = networkConfig.devTeamVestingAddress;
  const devTeamTimelockAddress = networkConfig.devTeamTimelockAddress;

  if (network == 'bsc_mainnet') {
  } else {
    const balleToken = await BALLE.at(balleAddress);

    await balleToken.mint(rewardPoolAddress, 13000)
    await balleToken.mint(vaultRewardPoolAddress, 24000)

    for (i=0; i < devTeamVestingAddress.length - 1; i++) {
      await balleToken.mint(devTeamVestingAddress[i], 400)
    }
    await balleToken.mint(devTeamTimelockAddress, 600)
  }

};
