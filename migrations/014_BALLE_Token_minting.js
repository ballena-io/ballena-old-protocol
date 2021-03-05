const fs = require('fs');

const BALLE = artifacts.require('BALLE');

module.exports = async function (deployer, network, accounts) {
  // Load network config data
  const networkConfigFilename = `.env.${network}.json`;
  const networkConfig = JSON.parse(fs.readFileSync(networkConfigFilename));
  let txRegistry = networkConfig.txRegistry;

  // Get addresses
  const balleAddress = networkConfig.BALLE;
  const rewardPoolAddress = networkConfig.rewardPoolAddress;
  const vaultRewardPoolAddress = networkConfig.vaultRewardPoolAddress;
  const devTeamVestingAddress = networkConfig.devTeamVestingAddress;
  const devTeamTimelockAddress = networkConfig.devTeamTimelockAddress;

  const balleToken = await BALLE.at(balleAddress);

  let result = await balleToken.addMinter(accounts[0]);
  console.log(`TX: ${result.tx}`);
  txRegistry.push(result.tx);

  result = await balleToken.mint(rewardPoolAddress, 13000)
  console.log(`TX: ${result.tx}`);
  txRegistry.push(result.tx);

  result = await balleToken.mint(vaultRewardPoolAddress, 24000)
  console.log(`TX: ${result.tx}`);
  txRegistry.push(result.tx);

  for (i=0; i < devTeamVestingAddress.length - 1; i++) {
    result = await balleToken.mint(devTeamVestingAddress[i], 400)
    console.log(`TX: ${result.tx}`);
    txRegistry.push(result.tx);
  }
  
  result = await balleToken.mint(devTeamTimelockAddress, 600)
  console.log(`TX: ${result.tx}`);
  txRegistry.push(result.tx);

  networkConfig['txRegistry'] = txRegistry;

  fs.writeFileSync(networkConfigFilename, JSON.stringify(networkConfig, null, 2), { flag: 'w' });

};
