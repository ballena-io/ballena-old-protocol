const fs = require('fs');

const ExtraRewardPot = artifacts.require('ExtraRewardPot');

module.exports = async function (deployer, network, accounts) {
  // Load network config data
  const networkConfigFilename = `.env.${network}.json`;
  const networkConfig = JSON.parse(fs.readFileSync(networkConfigFilename));
  
  if (network == 'develop') {
    // environment for tests
    
    // Get addresses
    const balleAddress = networkConfig.BALLE;

    // Deploy ExtraRewardPot contract
    await deployer.deploy(ExtraRewardPot, balleAddress);

    networkConfig['extraRewardPotAddress'] = ExtraRewardPot.address;

  } else {

    let txRegistry = networkConfig.txRegistry;

    // Get addresses
    const balleAddress = networkConfig.BALLE;

    // Deploy ExtraRewardPot contract
    await deployer.deploy(ExtraRewardPot, balleAddress);
    txRegistry.push(ExtraRewardPot.transactionHash);

    networkConfig['txRegistry'] = txRegistry;
    networkConfig['extraRewardPotAddress'] = ExtraRewardPot.address;

  }

  fs.writeFileSync(networkConfigFilename, JSON.stringify(networkConfig, null, 2), { flag: 'w' });

};
