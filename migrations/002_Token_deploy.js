const fs = require('fs');

const BALLE = artifacts.require('BALLE');
const ERC20Token = artifacts.require('ERC20Token');

module.exports = async function (deployer, network, accounts) {
  // Load network config data
  const networkConfigFilename = `.env.${network}.json`;
  const networkConfig = JSON.parse(fs.readFileSync(networkConfigFilename));
  let txRegistry = networkConfig.txRegistry;

  let balleToken;
  if (network == 'bsc_mainnet') {
    await deployer.deploy(BALLE, 'ballena.io', 'BALLE');
    txRegistry.push(BALLE.transactionHash);

  } else {
    await deployer.deploy(BALLE, 'bproject.io', 'BTEST');
    txRegistry.push(BALLE.transactionHash);

    if (network == 'development') {
      // deploy mock token contracts
      let wbnb = await deployer.new(ERC20Token, 'Wrapped BNB', 'WBNB');
      console.log(wbnb === undefined ? 'UNDEFINED!!??' : `OK ${wbnb.address}`);
      if (wbnb === undefined) {
        wbnb = await deployer.new(ERC20Token, 'Wrapped BNB', 'WBNB');
        console.log(wbnb === undefined ? 'UNDEFINED!!??' : `OK ${wbnb.address}`);
      }
      console.log(`TX: ${wbnb.transactionHash}`);
      txRegistry.push(wbnb.transactionHash);
      
      networkConfig['WBNB'] = wbnb.address;
    }
  } 

  networkConfig['txRegistry'] = txRegistry;
  networkConfig['BALLE'] = BALLE.address;

  fs.writeFileSync(networkConfigFilename, JSON.stringify(networkConfig, null, 2), { flag: 'w' });

};
