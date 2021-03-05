const fs = require('fs');

const BALLE = artifacts.require('BALLE');

module.exports = async function (deployer, network, accounts) {
  // Load network config data
  const networkConfigFilename = `.env.${network}.json`;
  const networkConfig = JSON.parse(fs.readFileSync(networkConfigFilename));
  let txRegistry = networkConfig.txRegistry;

  // Get addresses
  const balleAddress = networkConfig.BALLE;

  const balleToken = await BALLE.at(balleAddress);

  let result = await balleToken.removeMinter(accounts[0]);
  console.log(`TX: ${result.tx}`);
  txRegistry.push(result.tx);

  result = await balleToken.setGovernance("0x0000000000000000000000000000000000000000")
  console.log(`TX: ${result.tx}`);
  txRegistry.push(result.tx);

  networkConfig['txRegistry'] = txRegistry;

  fs.writeFileSync(networkConfigFilename, JSON.stringify(networkConfig, null, 2), { flag: 'w' });

};
