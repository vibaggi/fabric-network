/*
# Copyright IBM Corp. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
*/

'use strict';
const shim = require('fabric-shim');
const helper = require('./helper-chaincode')

let Chaincode = class {

    // The Init method is called when the Smart Contract 'fabcar' is instantiated by the blockchain network
    // Best practice is to have any Ledger initialization in separate function -- see initLedger()
    async Init(stub) {
        console.info('=========== Instantiated fabric-api chaincode ===========');
        return shim.success();
    }

    // The Invoke method is called as a result of an application request to run the Smart Contract
    // 'fabcar'. The calling application program has also specified the particular smart contract
    // function to be called, with arguments
    async Invoke(stub) {
        let ret = stub.getFunctionAndParameters();
        console.info(ret);

        let method = this[ret.fcn];
        if (!method) {
            console.error('no function of name:' + ret.fcn + ' found');
            throw new Error('Received unknown function ' + ret.fcn + ' invocation');
        }
        try {
            let payload = await method(stub, ret.params);
            return shim.success(payload);
        } catch (err) {
            console.log(err);
            return shim.error(err);
        }
    }


    
    
    async createCar(stub, args) {
        
        var certificateOwner = helper.getCertificateUser(stub)
        console.log("%%%%%%%",certificateOwner)

        //formatando dados
        var car = {
            owner: certificateOwner,
            urlImage: args[0],
            plate: args[1],
            fabDate: args[2],
            color: args[3],
            name: args[4]
       }
        
       //insere o asset na Blockchain, mas precisa ser em formato Buffer, e 
       //a criação está em formato JSON, assim, precisamos dar JSON.stringfy(nome_do_asset)
       //Quando uso Buffer.from(JSON.stringify(lote)) eu estou jogando no Buffer (que é como a Blockcahin)
       //que é como a Blockchain é estruturada

       //Atualizando no ledger
        await stub.putState(args[1], Buffer.from(JSON.stringify(car)));

        //retorna o valor inserido no Buffer para quem invocou a função
        return Buffer.from(JSON.stringify(car));
    }





    async tradeCar(stub, args) {

        
        //recuperando asset car na rede
        var result = await stub.getState(args[0])

        if (!result || result.length === 0) {
            throw new Error(`O car da ${args[0]} não existe, logo não é possível alterar o seu owner`);
        }
        
        //analisa uma string JSON, construindo o valor ou um objeto JavaScript descrito pela string, que no caso é o resultado da busca pelo asset. 
        const car = JSON.parse(result.toString());

        //Vamos verificar se o certificado pertence ao owner da wallet!
        var certificateOwner = helper.getCertificateUser(stub)
        console.log(car.owner,"-", certificateOwner)
        if(car.owner.indexOf(certificateOwner) ) return Buffer.from("Transferência não permitida! Apenas cars do owner da wallet podem ser transferidos!")
        

        //verifica se o nome do novo owner é o mesmo que o nome do owner
        //antigo. Se for, significa que vc está tentando transferir o car
        //para o mesmo owner, o que não deve ser permitido
        
        if (car.owner == args[1]) {
            return Buffer.from("Não é possivel transferir car para o mesmo owner")
        }

        //atualizando o campo "owner" do objeto car para o nome do novo owner
        car.owner = args[1]

        //atualizando o asset car na blockchain
        await stub.putState(args[0], Buffer.from(JSON.stringify(car)));


        return Buffer.from("Sucesso")


    }

    async queryCar(stub, args) {

        var result = await stub.getState(args[0])

        return result

    }

    async queryAllCars(stub, args){

        let startKey = 'AAA-0000';
        let endKey = 'ZZZ-9999';
        
        let iterator = await stub.getStateByRange(startKey, endKey);

        let allResults = [];
        while (true) {
          let res = await iterator.next();
    
          if (res.value && res.value.value.toString()) {
            let jsonRes = {};
            console.log(res.value.value.toString('utf8'));
    
            jsonRes.Key = res.value.key;
            try {
              jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
            } catch (err) {
              console.log(err);
              jsonRes.Record = res.value.value.toString('utf8');
            }
            allResults.push(jsonRes);
          }
          if (res.done) {
            console.log('end of data');
            await iterator.close();
            console.info(allResults);
            return Buffer.from(JSON.stringify(allResults));
          }
        }
    }

    async queryHistory(stub, args) {

        var result = await stub.getHistoryForKey(args[0])

        return result

    }
    
};


shim.start(new Chaincode());

