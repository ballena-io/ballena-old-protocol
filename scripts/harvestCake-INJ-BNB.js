module.exports = async function main(callback) {
    try {
        //const accounts = web3.currentProvider.addresses
        const CakeLPStrategyV1 = artifacts.require('CakeLPStrategyV1');
        const strat = await CakeLPStrategyV1.at('0x7e7Ac9a184112803d2E707f9CC63dec891a44f5d');

        await strat.harvest();

        callback(0);
    } catch (error) {
        console.error(error);
        callback(1);
    }
}
