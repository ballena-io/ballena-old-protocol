module.exports = async function main(callback) {
    try {
      const Balle = artifacts.require("BALLE");
      const balle = await Balle.deployed();
      governance = await balle.governance();
      console.log("BALLE governance is", governance.toString());

      const addr = "0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1"
      minters = await balle.minters(addr);
      console.log("add is minter", minters.toString());

      callback(0);
    } catch (error) {
      console.error(error);
      callback(1);
    }
  }