const fs = require('fs');

const BALLE = artifacts.require('BALLE');
const ERC20Token = artifacts.require('ERC20Token');

module.exports = async function (deployer, network, accounts) {
  // Load network config data
  const networkConfigFilename = `.env.${network}.json`;
  const networkConfig = JSON.parse(fs.readFileSync(networkConfigFilename));

  let balleToken;
  if (network == 'bsc_mainnet') {
    await deployer.deploy(BALLE, 'ballena.io', 'BALLE');
    balleToken = await BALLE.deployed();

  } else {
    await deployer.deploy(BALLE, 'bproject.io', 'BTEST');
    balleToken = await BALLE.deployed();
    await balleToken.addMinter(accounts[0]);

    if (network == 'development') {
      // deploy mock token contracts
      let wbnb = await deployer.new(ERC20Token, 'Wrapped BNB', 'WBNB');
      
      networkConfig['WBNB'] = wbnb.address;
    }
  } 
  networkConfig['BALLE'] = balleToken.address;

  fs.writeFileSync(networkConfigFilename, JSON.stringify(networkConfig, null, 2), { flag: 'w' });

};
