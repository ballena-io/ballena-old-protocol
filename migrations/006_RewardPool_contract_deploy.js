const fs = require('fs');

const RewardPool = artifacts.require('RewardPool');

module.exports = async function (deployer, network, accounts) {
  // Load network config data
  const networkConfigFilename = `.env.${network}.json`;
  const networkConfig = JSON.parse(fs.readFileSync(networkConfigFilename));
  
  if (network == 'develop') {
    // environment for tests
    
    // Get addresses
    const wbnbAddress = networkConfig.WBNB;
    const balleAddress = networkConfig.BALLE;
    const treasuryAddress = networkConfig.treasuryAddress;
    const extraRewardPotAddress = networkConfig.extraRewardPotAddress;
    const rewardPotAddress = networkConfig.rewardPotAddress;

    // Deploy RewardPool contract
    await deployer.deploy(RewardPool, wbnbAddress, balleAddress, 
      treasuryAddress, rewardPotAddress, extraRewardPotAddress);

    networkConfig['rewardPoolAddress'] = RewardPool.address;

  } else {

    let txRegistry = networkConfig.txRegistry;

    // Get addresses
    const wbnbAddress = networkConfig.WBNB;
    const balleAddress = networkConfig.BALLE;
    const treasuryAddress = networkConfig.treasuryAddress;
    const extraRewardPotAddress = networkConfig.extraRewardPotAddress;
    const rewardPotAddress = networkConfig.rewardPotAddress;

    // Deploy RewardPool contract
    await deployer.deploy(RewardPool, wbnbAddress, balleAddress, 
      treasuryAddress, rewardPotAddress, extraRewardPotAddress);
    txRegistry.push(RewardPool.transactionHash);

    networkConfig['txRegistry'] = txRegistry;
    networkConfig['rewardPoolAddress'] = RewardPool.address;

  }

  fs.writeFileSync(networkConfigFilename, JSON.stringify(networkConfig, null, 2), { flag: 'w' });

};
