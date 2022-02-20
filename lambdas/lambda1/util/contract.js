const Web3 = require(web3)

exports.execWhitelisting = (addresses) => {
    //const web3 = new Web3('wss://mainnet.infura.io/ws/v3/87f68694263249fcacd339d8fd6b08b7')
    //const web3 = new Web3(new Web3.providers.WebsocketProvider('ws://172.30.77.160:8546'))
    const web3 = new Web3("http://172.30.77.160:8545") 
    
    web3.eth.getChainId().then(console.log)
    contract_abi = require('../metagate_abi.json')
    const my_contract = new web3.eth.Contract(contract_abi, "0xf25186B5081Ff5cE73482AD761DB0eB0d25abfBF")

    const result = await my_contract.methods.editWhitelisting(addresses).call()
    return result
}

exports.execTicket = (address) => {
    
}
