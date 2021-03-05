const fs = require('fs');

const Masterchef = artifacts.require('Masterchef');

module.exports = async function (deployer, network, accounts) {
  // Load network config data
  const networkConfigFilename = `.env.${network}.json`;
  const networkConfig = JSON.parse(fs.readFileSync(networkConfigFilename));
  let txRegistry = networkConfig.txRegistry;

  if (network != 'bsc_mainnet') {
    const cake = networkConfig.CAKE;
    const syrup = networkConfig.SYRUP;
    const devAddress = accounts[0];

    let block = await web3.eth.getBlock("latest")

    await deployer.deploy(Masterchef, cake, syrup, devAddress, '1000000000000000000', block.number);
    txRegistry.push(Masterchef.transactionHash);

    networkConfig['txRegistry'] = txRegistry;
    networkConfig['MasterchefAddress'] = Masterchef.address;

    fs.writeFileSync(networkConfigFilename, JSON.stringify(networkConfig, null, 2), { flag: 'w' });
  } 

};
