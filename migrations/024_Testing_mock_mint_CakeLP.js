const fs = require('fs');

const PancakePair = artifacts.require('PancakePair');
const ERC20Token = artifacts.require('ERC20Token');
const WBNB = artifacts.require('WBNB');

module.exports = async function (deployer, network, accounts) {

  if (network != 'develop') {
    // Load network config data
    const networkConfigFilename = `.env.${network}.json`;
    const networkConfig = JSON.parse(fs.readFileSync(networkConfigFilename));
    let txRegistry = networkConfig.txRegistry;

    if (network != 'bsc_mainnet') {
      // Get addresses
      const WBNBAddress = networkConfig.WBNB;
      const BALBTAddress = networkConfig.BALBT;
      const pancakePairAddress = networkConfig.PancakePairAddress;

      const wBNB = await WBNB.at(WBNBAddress);

      let result = await wBNB.mint(pancakePairAddress, '2000000000000000000'); // 2 WBNB
      console.log(`TX: ${result.tx}`);
      txRegistry.push(result.tx);

      const BALBT = await ERC20Token.at(BALBTAddress);

      result = await BALBT.transfer(pancakePairAddress, '3000000000000000000000'); // 3000 BALBT
      console.log(`TX: ${result.tx}`);
      txRegistry.push(result.tx);

      const pancakePair = await PancakePair.at(pancakePairAddress);

      result = await pancakePair.mint(accounts[0]);
      console.log(`TX: ${result.tx}`);
      txRegistry.push(result.tx);

      networkConfig['txRegistry'] = txRegistry;

      fs.writeFileSync(networkConfigFilename, JSON.stringify(networkConfig, null, 2), { flag: 'w' });
    }
  }
    
};
