const fs = require('fs');

const ERC20Token = artifacts.require('ERC20Token');

module.exports = async function (deployer, network, accounts) {
  // Load network config data
  const networkConfigFilename = `.env.${network}.json`;
  const networkConfig = JSON.parse(fs.readFileSync(networkConfigFilename));
  let txRegistry = networkConfig.txRegistry;

  if (network != 'bsc_mainnet') {
    let syrup = await deployer.new(ERC20Token, 'PancakeSwap Syrup', 'SYRUP');
    console.log(syrup === undefined ? 'UNDEFINED!!??' : `OK ${syrup.address}`);
    if (syrup === undefined) {
      syrup = await deployer.new(ERC20Token, 'PancakeSwap Syrup', 'SYRUP');
      console.log(syrup === undefined ? 'UNDEFINED!!??' : `OK ${syrup.address}`);
    }
    console.log(`TX: ${syrup.transactionHash}`);
    txRegistry.push(syrup.transactionHash);

    networkConfig['txRegistry'] = txRegistry;
    networkConfig['SYRUP'] = syrup.address;

    fs.writeFileSync(networkConfigFilename, JSON.stringify(networkConfig, null, 2), { flag: 'w' });
  } 

};
