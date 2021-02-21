const BALLE = artifacts.require("BALLE");

module.exports = async function (deployer, network, accounts) {
  const MINTER = accounts[0];
  console.log(`Minter is ${MINTER}`);

  if (network == "bsc") {
    await deployer.deploy(BALLE, "ballena.io", "BALLE");
  } else {
    await deployer.deploy(BALLE, "bproject.io", "BTEST");
    console.log('\n   > BALLE token deployment: Success -->', AmpToken.address)

    const balleToken = await BALLE.deployed();
    console.log(balleToken);
    
    await balleToken.addMinter(MINTER);
  } 
};
