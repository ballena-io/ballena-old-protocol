const fs = require('fs');

const VaultRewardPool = artifacts.require('VaultRewardPool');

module.exports = async function (deployer, network, accounts) {
  // Load network config data
  const networkConfigFilename = `.env.${network}.json`;
  const networkConfig = JSON.parse(fs.readFileSync(networkConfigFilename));

  // Get addresses
  const balleAddress = networkConfig.BALLE;

  // Deploy VaultRewardPool contract
  await deployer.deploy(VaultRewardPool, balleAddress);
  const vaultRewardPool = await VaultRewardPool.deployed();

  networkConfig['vaultRewardPoolAddress'] = vaultRewardPool.address;

  fs.writeFileSync(networkConfigFilename, JSON.stringify(networkConfig, null, 2), { flag: 'w' });

};
