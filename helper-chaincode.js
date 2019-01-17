const ClientIdentity = require('fabric-shim').ClientIdentity;

class Helper {
    /**
     * In this Class we have some functions to helper chaincode.
     */


     /**
      * Get stub and returns de name of certificate owner.
      * @param {*} stub 
      */
     static getCertificateUser(stub){
        
        let _clientIdentity = new ClientIdentity(stub); 
        let _cert = _clientIdentity.getX509Certificate();
        console.log(_cert.subject.commonName)

        if (_cert.subject.commonName){
            return _cert.subject.commonName;
        }
        return null;
     }



}

module.exports = Helper