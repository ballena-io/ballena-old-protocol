const fs = require('fs');

const PancakePair = artifacts.require('PancakePair');

module.exports = async function (deployer, network, accounts) {
  // Load network config data
  const networkConfigFilename = `.env.${network}.json`;
  const networkConfig = JSON.parse(fs.readFileSync(networkConfigFilename));

  if (network != 'bsc_mainnet') {
    const tokenA = networkConfig.TokenA;
    const tokenB = networkConfig.TokenB;
    
    await deployer.deploy(PancakePair);
    pair = await PancakePair.deployed();
    await pair.initialize(tokenA, tokenB);
    
    networkConfig['PancakePairAddress'] = pair.address;

    fs.writeFileSync(networkConfigFilename, JSON.stringify(networkConfig, null, 2), { flag: 'w' });
  } 

};
