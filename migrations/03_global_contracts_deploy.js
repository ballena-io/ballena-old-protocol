const fs = require('fs');

const BalleTreasury = artifacts.require('BalleTreasury');
const RewardPool = artifacts.require('RewardPool');
const VaultRewardPool = artifacts.require('VaultRewardPool');
const BulkSender = artifacts.require('BulkSender');

module.exports = async function (deployer, network, accounts) {
  // Load network config data
  const networkConfigFilename = `.env.${network}.json`;
  const networkConfig = JSON.parse(fs.readFileSync(networkConfigFilename));

  // Get addresses
  const wbnbAddress = networkConfig.WBNB;
  const balleAddress = networkConfig.BALLE;

  // Deploy Treasury contract
  await deployer.deploy(BalleTreasury);
  const treasury = await BalleTreasury.deployed();
  // const treasuryAddress = treasury.address;

  // Deploy RewardPool contract
  await deployer.deploy(RewardPool, wbnbAddress, balleAddress, treasury.address);
  const rewardPool = await RewardPool.deployed();

  // Deploy VaultRewardPool contract
  await deployer.deploy(VaultRewardPool, balleAddress);
  const vaultRewardPool = await VaultRewardPool.deployed();

  // Deploy BulkSender contract
  await deployer.deploy(BulkSender, balleAddress);
  const bulkSender = await BulkSender.deployed();

  networkConfig['treasuryAddress'] = treasury.address;
  networkConfig['rewardPoolAddress'] = rewardPool.address;
  networkConfig['vaultRewardPoolAddress'] = vaultRewardPool.address;
  networkConfig['bulkSenderAddress'] = bulkSender.address;

  fs.writeFileSync(networkConfigFilename, JSON.stringify(networkConfig, null, 2), { flag: 'w' });

};
