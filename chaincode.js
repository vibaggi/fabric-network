/*
# Copyright IBM Corp. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
*/

'use strict';
const shim = require('fabric-shim');

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

    
    async createCarro(stub, args) {
        //formatando dados
        var carro = {
            dono: args[1],
            placa: args[2],
            anoDeFab: args[3],
            cor: args[4],
            nome: args[5]
       }
        
       //insere o asset na Blockchain, mas precisa ser em formato Buffer, e 
       //a criação está em formato JSON, assim, precisamos dar JSON.stringfy(nome_do_asset)
       //Quando uso Buffer.from(JSON.stringify(lote)) eu estou jogando no Buffer (que é como a Blockcahin)
       //que é como a Blockchain é estruturada

       //Atualizando no ledger
        await stub.putState(args[0], Buffer.from(JSON.stringify(carro)));

        //retorna o valor inserido no Buffer para quem invocou a função
        return Buffer.from(JSON.stringify(carro));
    }





    async tradeCarro(stub, args) {

        //recuperando asset Carro na rede
        var result = await stub.getState(args[0])

        if (!result || result.length === 0) {
            throw new Error(`O carro da ${args[0]} não existe, logo não é possível alterar o seu dono`);
        }
        
        //analisa uma string JSON, construindo o valor ou um objeto JavaScript descrito pela string, que no caso é o resultado da busca pelo asset. 
        const carro = JSON.parse(result.toString());

        //verifica se o nome do novo dono é o mesmo que o nome do dono
        //antigo. Se for, significa que vc está tentando transferir o carro
        //para o mesmo dono, o que não deve ser permitido
        
        if (carro.dono == args[1]) {
            return "Não é possivel transferir carro para o mesmo dono"
        }

        //atualizando o campo "dono" do objeto carro para o nome do novo dono
        carro.dono = args[1]

        //atualizando o asset carro na blockchain
        await stub.putState(args[0], Buffer.from(JSON.stringify(carro)));


        return "Sucesso"


    }

    async queryCarro(stub, args) {

        var result = await stub.getState(args[0])

        return result

    }

    async queryTodosCarros(stub, args){

        let startKey = 'CAR0';
        let endKey = 'CAR999';
        
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
    
};


shim.start(new Chaincode());

