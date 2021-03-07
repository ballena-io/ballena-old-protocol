const fs = require('fs');

const RewardPot = artifacts.require('RewardPot');

module.exports = async function (deployer, network, accounts) {
  // Load network config data
  const networkConfigFilename = `.env.${network}.json`;
  const networkConfig = JSON.parse(fs.readFileSync(networkConfigFilename));
  
  if (network == 'develop') {
    // environment for tests
    
    // Get addresses
    const balleAddress = networkConfig.BALLE;

    // Deploy RewardPot contract
    await deployer.deploy(RewardPot, balleAddress);

    networkConfig['rewardPotAddress'] = RewardPot.address;

  } else {

    let txRegistry = networkConfig.txRegistry;

    // Get addresses
    const balleAddress = networkConfig.BALLE;

    // Deploy RewardPot contract
    await deployer.deploy(RewardPot, balleAddress);
    txRegistry.push(RewardPot.transactionHash);

    networkConfig['txRegistry'] = txRegistry;
    networkConfig['rewardPotAddress'] = RewardPot.address;

  }

  fs.writeFileSync(networkConfigFilename, JSON.stringify(networkConfig, null, 2), { flag: 'w' });

};
