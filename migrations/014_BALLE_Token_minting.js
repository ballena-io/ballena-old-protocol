const fs = require('fs');

const BALLE = artifacts.require('BALLE');

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

  const balleToken = await BALLE.at(balleAddress);

  await balleToken.addMinter(accounts[0]);

  await balleToken.mint(rewardPoolAddress, 13000)
  await balleToken.mint(vaultRewardPoolAddress, 24000)

  for (i=0; i < devTeamVestingAddress.length - 1; i++) {
    await balleToken.mint(devTeamVestingAddress[i], 400)
  }
  await balleToken.mint(devTeamTimelockAddress, 600)

};
