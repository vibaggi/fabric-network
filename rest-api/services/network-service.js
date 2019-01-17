//Este service gerencia a wallet e a conectividade com a network

const { FileSystemWallet, Gateway, X509WalletMixin } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const fs = require('fs');
const path = require('path');
const ccpPath = path.resolve(__dirname, '..', '..', 'basic-network', 'connection.json');
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);

//criando o file system
const walletPath = path.join(process.cwd(), 'wallet');
const wallet = new FileSystemWallet(walletPath);
const yaml = require('js-yaml');



createAdm() //Iniciar adm ao subir o servidor


/**
 * Função para criar uma nova wallet no rest api
 * @param {*} userName 
 */
function createWallet(userName) {

    return new Promise(async (resolve, reject) => {
        
        // Verificando a existencia do usuário
        const userExists = await wallet.exists(userName);
        if (userExists) {
            reject(`Já existe uma wallet para ${userName} `)
        }

        //Verificando se a respApi tem uma conta ADM
        const adminExists = await wallet.exists('admin');
        if (!adminExists) {
            reject('O resp-api precisa de uma wallet de Administrador')
        }

        //Conectando à rede usando o adm
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'admin', discovery: { enabled: false } });
        const ca = gateway.getClient().getCertificateAuthority();
        const adminIdentity = gateway.getCurrentIdentity();

        //Criando registro do novo usuário
        const secret = await ca.register({ affiliation: 'org1.department1', enrollmentID: userName, role: 'client' }, adminIdentity);
        const enrollment = await ca.enroll({ enrollmentID: userName, enrollmentSecret: secret });
        const userIdentity = X509WalletMixin.createIdentity('Org1MSP', enrollment.certificate, enrollment.key.toBytes());
        wallet.import(userName, userIdentity);
        console.log("Wallet criado com sucesso!")

        resolve("Sucesso")
    })

}

/**
 * Função para criar o adm do peer. Use somente uma vez.
 */
async function createAdm(){

    try{

        const caURL = ccp.certificateAuthorities['ca.example.com'].url;
        const ca = new FabricCAServices(caURL);

        const adminExists = await wallet.exists('admin');
        if (adminExists) {
            console.log('An identity for the admin user "admin" already exists in the wallet');
            return;
        }

        // Enroll the admin user, and import the new identity into the wallet.
        const enrollment = await ca.enroll({ enrollmentID: 'admin', enrollmentSecret: 'adminpw' });
        const identity = X509WalletMixin.createIdentity('Org1MSP', enrollment.certificate, enrollment.key.toBytes());
        wallet.import('admin', identity);
        console.log('Successfully enrolled admin user "admin" and imported it into the wallet');
    }catch(error){
        console.log('erro ao criar o adm')
        console.log(error)
    }
}

/**
 * Método padrão para submeter transações
 * @param {*} nameTransaction Nome da Transação do blockchain 
 * @param {*} userName Proprietário da wallet
 * @param {*} args Array de argumentos ["arg1",  "arg2", "arg3" ...]
 */
function getGatewayContract(userName){

    return new Promise( async (resolve, reject)=>{
          //Abrindo conexao com a network

        const gateway = new Gateway();

        try{

            // Carregando o connectionProfile
            let connectionProfile = yaml.safeLoad(fs.readFileSync('../gateway/networkConnection.yaml', 'utf8'));

            // Configura connectionOptions
            let connectionOptions = {
                identity: userName,
                wallet: wallet,
                discovery: { enabled:false, asLocalhost: true }
            };


            await gateway.connect(connectionProfile, connectionOptions);
            const network = await gateway.getNetwork('mychannel');
            const contract = await network.getContract('chainv111');
            
            // const response = await contract.submitTransaction.apply(this, args);


            resolve(contract)

        }catch(error){
            
            reject(error)

        }
    })
  

}

module.exports = {
    createWallet: createWallet,
    getGatewayContract: getGatewayContract

}


