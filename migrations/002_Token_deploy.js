const fs = require('fs');

const BALLE = artifacts.require('BALLE');
const WBNB = artifacts.require('WBNB');

module.exports = async function (deployer, network, accounts) {
  // Load network config data
  const networkConfigFilename = `.env.${network}.json`;
  const networkConfig = JSON.parse(fs.readFileSync(networkConfigFilename));

  if (network == 'develop') {
    // environment for tests

    await deployer.deploy(BALLE, 'ballena.io', 'BALLE');
    await deployer.deploy(WBNB);

    networkConfig['WBNB'] = WBNB.address;
    networkConfig['BALLE'] = BALLE.address;

  } else {

    let txRegistry = networkConfig.txRegistry;

    if (network == 'bsc_mainnet') {
      await deployer.deploy(BALLE, 'ballena.io', 'BALLE');
      txRegistry.push(BALLE.transactionHash);

    } else {
      await deployer.deploy(BALLE, 'bproject.io', 'BTEST');
      txRegistry.push(BALLE.transactionHash);

      if (network == 'development') {
        // deploy mock WBNB contract
        await deployer.deploy(WBNB);
        txRegistry.push(WBNB.transactionHash);
        
        networkConfig['WBNB'] = WBNB.address;
      }
    } 

    networkConfig['txRegistry'] = txRegistry;
    networkConfig['BALLE'] = BALLE.address;

  }

  fs.writeFileSync(networkConfigFilename, JSON.stringify(networkConfig, null, 2), { flag: 'w' });

};
