const fs = require('fs');

const MasterChef = artifacts.require('MasterChef');

module.exports = async function (deployer, network, accounts) {

  if (network != 'develop') {
    // Load network config data
    const networkConfigFilename = `.env.${network}.json`;
    const networkConfig = JSON.parse(fs.readFileSync(networkConfigFilename));
    let txRegistry = networkConfig.txRegistry;

    if (network != 'bsc_mainnet') {
      const cake = networkConfig.CAKE;
      const syrup = networkConfig.SYRUP;
      const devAddress = accounts[0];
      const pancakePairAddress = networkConfig.pancakePairAddress;

      let block = await web3.eth.getBlock("latest")

      await deployer.deploy(MasterChef, cake, syrup, devAddress, '1000000000000000000', block.number); // 1 CAKE per block
      txRegistry.push(MasterChef.transactionHash);

      // PENDIENTE EN TESTNET
      // add created PancakePair to MasterChef
      const masterChef = await MasterChef.deployed();
      let result = await masterChef.add(1000, pancakePairAddress, true);
      console.log(`TX: ${result.tx}`);
      txRegistry.push(result.tx);

      networkConfig['txRegistry'] = txRegistry;
      networkConfig['masterChefAddress'] = MasterChef.address;

      fs.writeFileSync(networkConfigFilename, JSON.stringify(networkConfig, null, 2), { flag: 'w' });
    } 
  }
  
};
