const fs = require('fs');

const PancakePair = artifacts.require('PancakePair');

module.exports = async function (deployer, network, accounts) {
  // Load network config data
  const networkConfigFilename = `.env.${network}.json`;
  const networkConfig = JSON.parse(fs.readFileSync(networkConfigFilename));
  let txRegistry = networkConfig.txRegistry;

  if (network != 'bsc_mainnet') {
    const tokenA = networkConfig.TokenA;
    const tokenB = networkConfig.TokenB;
    
    await deployer.deploy(PancakePair);
    txRegistry.push(PancakePair.transactionHash);

    let pancakePair = await PancakePair.deployed();

    let result = await pancakePair.initialize(tokenA, tokenB);
    console.log(`TX: ${result.tx}`);
    txRegistry.push(result.tx);
    
    networkConfig['txRegistry'] = txRegistry;
    networkConfig['PancakePairAddress'] = pancakePair.address;

    fs.writeFileSync(networkConfigFilename, JSON.stringify(networkConfig, null, 2), { flag: 'w' });
  } 

};
