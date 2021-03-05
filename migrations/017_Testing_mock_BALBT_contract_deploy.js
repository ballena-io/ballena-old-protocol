const fs = require('fs');

const ERC20Token = artifacts.require('ERC20Token');

module.exports = async function (deployer, network, accounts) {
  // Load network config data
  const networkConfigFilename = `.env.${network}.json`;
  const networkConfig = JSON.parse(fs.readFileSync(networkConfigFilename));

  if (network != 'bsc_mainnet') {
    let tokenA = await deployer.new(ERC20Token, 'bALBT', 'BALBT');
    console.log(tokenA === undefined ? 'UNDEFINED!!??' : `OK ${tokenA.address}`);
    if (tokenA === undefined) {
      tokenA = await deployer.new(ERC20Token, 'bALBT', 'BALBT');
      console.log(tokenA === undefined ? 'UNDEFINED!!??' : `OK ${tokenA.address}`);
    }

    networkConfig['TokenA'] = tokenA.address;

    fs.writeFileSync(networkConfigFilename, JSON.stringify(networkConfig, null, 2), { flag: 'w' });
  } 

};
