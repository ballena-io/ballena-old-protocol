const fs = require('fs');

const ERC20Token = artifacts.require('ERC20Token');
const PancakePair = artifacts.require('PancakePair');
const PancakeRouter = artifacts.require('PancakeRouter');
const Masterchef = artifacts.require('Masterchef');

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

    let syrup = await deployer.new(ERC20Token, 'PancakeSwap Syrup', 'SYRUP');
    console.log(syrup === undefined ? 'UNDEFINED!!??' : `OK ${syrup.address}`);
    if (syrup === undefined) {
      syrup = await deployer.new(ERC20Token, 'PancakeSwap Syrup', 'SYRUP');
      console.log(syrup === undefined ? 'UNDEFINED!!??' : `OK ${syrup.address}`);
    }

    let tokenA = await deployer.new(ERC20Token, 'bALBT', 'BALBT');
    console.log(tokenA === undefined ? 'UNDEFINED!!??' : `OK ${tokenA.address}`);
    if (tokenA === undefined) {
      tokenA = await deployer.new(ERC20Token, 'bALBT', 'BALBT');
      console.log(tokenA === undefined ? 'UNDEFINED!!??' : `OK ${tokenA.address}`);
    }

    let tokenB = await deployer.new(ERC20Token, 'BNB', 'BNB');
    console.log(tokenB === undefined ? 'UNDEFINED!!??' : `OK ${tokenB.address}`);
    if(tokenB === undefined){
      tokenB = await deployer.new(ERC20Token, 'BNB', 'BNB');
      console.log(tokenB === undefined ? 'UNDEFINED!!??' : `OK ${tokenB.address}`);
    }
    
    await deployer.deploy(PancakePair);
    pair = await PancakePair.deployed();
    await pair.initialize(tokenA.address, tokenB.address);
    
    await deployer.deploy(PancakeRouter, pair.address);
    router = await PancakeRouter.deployed();

    await deployer.deploy(Masterchef, cake.address, syrup.address, accounts[0], '1000000000000000000', 50);
    masterchef = await Masterchef.deployed();

    networkConfig['CAKE'] = cake.address;
    networkConfig['SYRUP'] = syrup.address;
    networkConfig['TokenA'] = tokenA.address;
    networkConfig['TokenB'] = tokenB.address;
    networkConfig['PancakePairAddress'] = pair.address;
    networkConfig['PancakeRouterAddress'] = router.address;
    networkConfig['MasterchefAddress'] = masterchef.address;

  } 

  fs.writeFileSync(networkConfigFilename, JSON.stringify(networkConfig, null, 2), { flag: 'w' });

};
