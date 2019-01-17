
var networkService = require('./../services/network-service')


function createUser(username) {

    return new Promise(async (resolve, reject) => {

        networkService.createWallet(username).then(resp => resolve(resp)).catch(error => reject(error))


    })


}

/**
 * Método prepara a requisicao do front-end para chamar a transação no fabric
 * @param {JSON} carro 
 * @param {*} username 
 */
function createCar(carro, username) {

    return new Promise(async (resolve, reject) => {
        //inicialmente passaremos a key, entretanto deverá haver um sistema automatica de gerar Key
        // var args = Array.prototype.slice.call([ ])


        //submetendo transação

        try {
            var contract = await networkService.getGatewayContract(username)
            var resp = await contract.submitTransaction("createCar", carro.key, carro.dono, carro.placa, carro.anoDeFab, carro.cor, carro.nome)

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
 * Método para realizar a transação de tradeCar no chaincode.
 * @param {*} carroKey 
 * @param {*} newOwner 
 * @param {*} username é o identificador da wallet
 */
function tradeCar(carroKey, newOwner, username) {

    return new Promise(async (resolve, reject) => {

        try {

            var contract = await networkService.getGatewayContract(username);
            var resp = await contract.submitTransaction("tradeCar", carroKey, newOwner);

            resolve(resp)

        } catch (error) {
            reject(error)
        }



    })

}

function getCar(carroKey, username) {

    return new Promise(async (resolve, reject) => {
        try {

            var contract = await networkService.getGatewayContract(username);
            var carro = await contract.evaluateTransaction("queryCar", carroKey)

            resolve(JSON.parse(carro))
        } catch (error) {
            reject(error)
        }
    })
}

function getAllCars(username) {

    return new Promise(async (resolve, reject) => {
        try {

            var contract = await networkService.getGatewayContract(username);
            var carros = await contract.evaluateTransaction("queryAllCars")
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

function getHistoryById(carId, username) {

    return new Promise(async (resolve, reject) => {
        try {

            var contract = await networkService.getGatewayContract(username);
            var carro = await contract.evaluateTransaction("queryHistory", carId)
            console.log(carro)

            resolve(JSON.parse(carro))
        } catch (error) {
            reject(error)
        }
    })
}


module.exports = {
    createUser: createUser,
    createCar: createCar,
    tradeCar: tradeCar,
    getCar: getCar,
    getAllCars: getAllCars,
    getHistoryById: getHistoryById
}