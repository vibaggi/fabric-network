/*
# Copyright IBM Corp. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
*/

'use strict';
const shim = require('fabric-shim');
const util = require('util');

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


    async createLote(stub, args) {
        // retrieve existing chaincode states
        var lote = {
            description: args[1],
            unit: args[2],
            quant: args[3],
            issuer: args[4],
            owner: args[4]
        }

        await stub.putState(args[0], Buffer.from(JSON.stringify(lote)));

        return Buffer.from(JSON.stringify(lote));
    }

    async tradeLote(stub, args) {

        //recuperando o lote do ledger
        var result = await stub.getState(args[0])

        if (!result || result.length === 0) {
            throw new Error(`${args[0]} does not exist`);
        }

        const lote = JSON.parse(result.toString());

        // try {

        //     var bufferOriginal  = Buffer.from(JSON.parse(result).data);
        //     var lote            = JSON.parse(bufferOriginal.toString('utf8'))       

        // } catch (error) {

        //     return "erro ao converter Buffer"

        // }


        if (lote.owner == args[1]) {
            return "Não é possivel transferir o lote para o mesmo owner"
        }

        //atualizando o owner
        lote.owner = args[1]

        //atualizando o lote no ledger
        await stub.putState(args[0], Buffer.from(JSON.stringify(lote)));


        return "Sucesso"


    }

    async queryLote(stub, args) {

        var result = await stub.getState(args[0])

        return result

    }

    async getHistoryLote(stub, args) {

        //retorna um iterator object
        var history = await stub.getHistoryForKey(args[0])
        var historyArray = Array.from(history)

        return historyArray
    }

};

shim.start(new Chaincode());

