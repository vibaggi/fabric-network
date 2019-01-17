
#CONTRACT_NAME=$1 --> Caso queira voce mesmo digitar o nome do chain code
CONTRACT_NAME="chaincode"
#Derrubar todas os dockers
docker stop $(docker ps -a -q) && docker rm $(docker ps -a -q)

#Limpar images do peer0
docker rmi $(docker images |grep 'peer0')

#Iniciando rede simples
cd ./basic-network
./start.sh

#criando servico
cd ../configuration/cli
docker-compose -f docker-compose.yml up -d cliFabric

sleep 5

echo "Iniciando instalação do chaincode"

#instalando e instanciando chaincode
docker exec cliFabric peer chaincode install -n ${CONTRACT_NAME} -v 0 -p /opt/gopath/src/github.com -l node
docker exec cliFabric peer chaincode instantiate -n ${CONTRACT_NAME} -v 0 -l node -c '{"Args":[""]}' -C mychannel -P "AND ('Org1MSP.member')"
sleep 10
docker exec cliFabric peer chaincode invoke -n ${CONTRACT_NAME} -c '{"function":"createCar","Args":["htpp://", "ABC-1234", "2018", "verde", "Ford Fiesta"]}' -C mychannel

