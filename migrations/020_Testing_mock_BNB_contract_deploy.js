const fs = require('fs');

const ERC20Token = artifacts.require('ERC20Token');

module.exports = async function (deployer, network, accounts) {
  // Load network config data
  const networkConfigFilename = `.env.${network}.json`;
  const networkConfig = JSON.parse(fs.readFileSync(networkConfigFilename));
  let txRegistry = networkConfig.txRegistry;

  if (network != 'bsc_mainnet') {
    let tokenB = await deployer.new(ERC20Token, 'BNB', 'BNB');
    console.log(tokenB === undefined ? 'UNDEFINED!!??' : `OK ${tokenB.address}`);
    if (tokenB === undefined){
      tokenB = await deployer.new(ERC20Token, 'BNB', 'BNB');
      console.log(tokenB === undefined ? 'UNDEFINED!!??' : `OK ${tokenB.address}`);
    }
    console.log(`TX: ${tokenB.transactionHash}`);
    txRegistry.push(tokenB.transactionHash);

    networkConfig['txRegistry'] = txRegistry;
    networkConfig['TokenB'] = tokenB.address;

    fs.writeFileSync(networkConfigFilename, JSON.stringify(networkConfig, null, 2), { flag: 'w' });
  } 

};
