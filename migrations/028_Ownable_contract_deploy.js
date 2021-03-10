const fs = require('fs');

const OwnableTest = artifacts.require('OwnableTest');

module.exports = async function (deployer, network, accounts) {
  // Load network config data
  const networkConfigFilename = `.env.${network}.json`;
  const networkConfig = JSON.parse(fs.readFileSync(networkConfigFilename));

  if (network == 'develop') {
    // environment for tests

    await deployer.deploy(OwnableTest);

    networkConfig['ownableTestAddress'] = OwnableTest.address;

  } else {

    let txRegistry = networkConfig.txRegistry;

    // Deploy OwnableTest contract
    await deployer.deploy(OwnableTest);
    txRegistry.push(OwnableTest.transactionHash);

    networkConfig['txRegistry'] = txRegistry;
    networkConfig['ownableTestAddress'] = OwnableTest.address;

  }

  fs.writeFileSync(networkConfigFilename, JSON.stringify(networkConfig, null, 2), { flag: 'w' });

};
