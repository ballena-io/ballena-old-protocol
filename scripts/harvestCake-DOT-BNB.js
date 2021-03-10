module.exports = async function main(callback) {
    try {
        //const accounts = web3.currentProvider.addresses
        const CakeLPStrategyV1 = artifacts.require('CakeLPStrategyV1');
        const strat = await CakeLPStrategyV1.at('0xB55B221b63c854088E02Bb6e7591935D53576519');

        await strat.harvest();

        callback(0);
    } catch (error) {
        console.error(error);
        callback(1);
    }
}
