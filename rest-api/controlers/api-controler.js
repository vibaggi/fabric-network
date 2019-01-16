
var networkService = require('./../services/network-service')


function criarUsuario(username) {

    return new Promise(async (resolve, reject) => {

        networkService.createWallet(username).then(resp => resolve(resp)).catch(error => reject(error))


    })


}

/**
 * Método prepara a requisicao do front-end para chamar a transação no fabric
 * @param {JSON} carro 
 * @param {*} username 
 */
function criarCarro(carro, username) {

    return new Promise(async (resolve, reject) => {
        //inicialmente passaremos a key, entretanto deverá haver um sistema automatica de gerar Key
        // var args = Array.prototype.slice.call([ ])


        //submetendo transação

        try {
            var contract = await networkService.getGatewayContract(username)
            var resp = await contract.submitTransaction("createCarro", carro.key, carro.dono, carro.placa, carro.anoDeFab, carro.cor, carro.nome)

            resolve(JSON.parse(resp))
        } catch (error) {
            reject(error)
        }

        // networkService.getGatewayContract(username).then(contract => {

        //     contract.submitTransaction("createCarro", carro.key, carro.dono, carro.placa, carro.anoDeFab, carro.cor, carro.nome).then(resp=>{
        //         resolve("ok")
        //     }).catch(error=>{
        //         reject(error)
        //     })

        // }).catch(error => {
        //     reject(error)
        // })
    })


}

/**
 * Método para realizar a transação de tradeCarro no chaincode.
 * @param {*} carroKey 
 * @param {*} newOwner 
 * @param {*} username é o identificador da wallet
 */
function tradeCarro(carroKey, newOwner, username) {

    return new Promise(async (resolve, reject) => {

        try {

            var contract = await networkService.getGatewayContract(username);
            var resp = await contract.submitTransaction("tradeCarro", carroKey, newOwner);

            resolve(resp)

        } catch (error) {
            reject(error)
        }



    })

}

function getCarro(carroKey, username) {

    return new Promise(async (resolve, reject) => {
        try {

            var contract = await networkService.getGatewayContract(username);
            var carro = await contract.evaluateTransaction("queryCarro", carroKey)

            resolve(JSON.parse(carro))
        } catch (error) {
            reject(error)
        }
    })
}

function getCarros(username) {

    return new Promise(async (resolve, reject) => {
        try {

            var contract = await networkService.getGatewayContract(username);
            var carros = await contract.evaluateTransaction("queryTodosCarros")
            carros = JSON.parse(carros)
            console.log(carros)
            let result = []

            carros.forEach(element => {
                console.log(element)
                let obj = {
                    "id": element.Key ,
                    "anoDeFab": element.Record.anoDeFab,
                    "cor": element.Record.cor,
                    "dono": element.Record.dono,
                    "nome": element.Record.nome,
                    "placa": element.Record.placa
                }
                result.push(obj)
                
            });
    

            resolve(result)
        } catch (error) {
            reject(error)
        }
    })
}

module.exports = {
    criarUsuario: criarUsuario,
    criarCarro: criarCarro,
    tradeCarro: tradeCarro,
    getCarro: getCarro,
    getCarros: getCarros
}