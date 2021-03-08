const fs = require('fs');

const VaultRewardPool = artifacts.require('VaultRewardPool');
const RewardedVaultMock1 = artifacts.require('RewardedVaultMock1');
const RewardedVaultMock2 = artifacts.require('RewardedVaultMock2');

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
    // Deploy Mocks for testing
    await deployer.deploy(RewardedVaultMock1, VaultRewardPool.address);
    await deployer.deploy(RewardedVaultMock2, VaultRewardPool.address);
    
    networkConfig['vaultRewardPoolAddress'] = VaultRewardPool.address;
    networkConfig['rewardedVaultMock1Address'] = RewardedVaultMock1.address;
    networkConfig['rewardedVaultMock2Address'] = RewardedVaultMock1.address;

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
