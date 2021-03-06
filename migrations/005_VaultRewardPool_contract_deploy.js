const fs = require('fs');

const VaultRewardPool = artifacts.require('VaultRewardPool');

module.exports = async function (deployer, network, accounts) {
  // Load network config data
  const networkConfigFilename = `.env.${network}.json`;
  const networkConfig = JSON.parse(fs.readFileSync(networkConfigFilename));

  if (network == 'develop') {
    // environment for tests

    // Get addresses
    const balleAddress = networkConfig.BALLE;

    // Deploy VaultRewardPool contract
    await deployer.deploy(VaultRewardPool, balleAddress);

    networkConfig['vaultRewardPoolAddress'] = VaultRewardPool.address;

  } else {

    let txRegistry = networkConfig.txRegistry;

    // Get addresses
    const balleAddress = networkConfig.BALLE;

    // Deploy VaultRewardPool contract
    await deployer.deploy(VaultRewardPool, balleAddress);
    txRegistry.push(VaultRewardPool.transactionHash);

    networkConfig['txRegistry'] = txRegistry;
    networkConfig['vaultRewardPoolAddress'] = VaultRewardPool.address;

  }

  fs.writeFileSync(networkConfigFilename, JSON.stringify(networkConfig, null, 2), { flag: 'w' });

};
