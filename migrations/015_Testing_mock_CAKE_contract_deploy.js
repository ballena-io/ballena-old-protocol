const fs = require('fs');

const ERC20Token = artifacts.require('ERC20Token');

module.exports = async function (deployer, network, accounts) {
  // Load network config data
  const networkConfigFilename = `.env.${network}.json`;
  const networkConfig = JSON.parse(fs.readFileSync(networkConfigFilename));

  if (network != 'bsc_mainnet') {
    let cake = await deployer.new(ERC20Token, 'PancakeSwap Cake', 'CAKE');
    console.log(cake === undefined ? 'UNDEFINED!!??' : `OK ${cake.address}`);
    // de nuevo lo mismo, el primer deployer.new(...) devuelve undefined!!
    if (cake === undefined) {
      cake = await deployer.new(ERC20Token, 'PancakeSwap Cake', 'CAKE');
      console.log(cake === undefined ? 'UNDEFINED!!??' : `OK ${cake.address}`);
    }

    networkConfig['CAKE'] = cake.address;

    fs.writeFileSync(networkConfigFilename, JSON.stringify(networkConfig, null, 2), { flag: 'w' });
  } 

};
