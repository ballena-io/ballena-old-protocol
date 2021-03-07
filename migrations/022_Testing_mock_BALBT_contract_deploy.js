const fs = require('fs');

const ERC20Token = artifacts.require('ERC20Token');

module.exports = async function (deployer, network, accounts) {

  if (network != 'develop') {
    // Load network config data
    const networkConfigFilename = `.env.${network}.json`;
    const networkConfig = JSON.parse(fs.readFileSync(networkConfigFilename));
    let txRegistry = networkConfig.txRegistry;

    if (network != 'bsc_mainnet') {
      let bALBT = await deployer.new(ERC20Token, 'bALBT', 'BALBT');
      console.log(bALBT === undefined ? 'UNDEFINED!!??' : `OK ${bALBT.address}`);
      if (bALBT === undefined) {
        bALBT = await deployer.new(ERC20Token, 'bALBT', 'BALBT');
        console.log(bALBT === undefined ? 'UNDEFINED!!??' : `OK ${bALBT.address}`);
      }
      console.log(`TX: ${bALBT.transactionHash}`);
      txRegistry.push(bALBT.transactionHash);

      networkConfig['txRegistry'] = txRegistry;
      networkConfig['BALBT'] = bALBT.address;

      fs.writeFileSync(networkConfigFilename, JSON.stringify(networkConfig, null, 2), { flag: 'w' });
    } 
  }
  
};
