CHAINCODE_VERSION=$1


CONTRACT_NAME="chaincode"


echo "copiando o arquivo do chaincode para o cliFabric"
docker cp chaincode/. cliFabric:/opt/gopath/src/github.com

sleep 5

echo "fazendo update"
#UPDATING
docker exec cliFabric peer chaincode install -n ${CONTRACT_NAME} -v ${CHAINCODE_VERSION} -p /opt/gopath/src/github.com -l node
docker exec cliFabric peer chaincode upgrade -n ${CONTRACT_NAME} -v ${CHAINCODE_VERSION} -c '{"Args":[""]}' -C mychannel -P "AND ('Org1MSP.member')"
sleep 10
docker exec cliFabric peer chaincode invoke -n ${CONTRACT_NAME} -c '{"function":"createCar","Args":["htpp://", "DDD-1234", "2018", "verde", "Ford Fiesta"]}' -C mychannel
