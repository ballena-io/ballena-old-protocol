const fs = require('fs');

const Masterchef = artifacts.require('Masterchef');

module.exports = async function (deployer, network, accounts) {
  // Load network config data
  const networkConfigFilename = `.env.${network}.json`;
  const networkConfig = JSON.parse(fs.readFileSync(networkConfigFilename));

  if (network != 'bsc_mainnet') {
    const cake = networkConfig.CAKE;
    const syrup = networkConfig.SYRUP;
    const devAddress = accounts[0];

    await deployer.deploy(Masterchef, cake, syrup, devAddress, '1000000000000000000', 50);

    networkConfig['MasterchefAddress'] = Masterchef.address;

    fs.writeFileSync(networkConfigFilename, JSON.stringify(networkConfig, null, 2), { flag: 'w' });
  } 

};
