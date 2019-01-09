
CONTRACT_NAME=$1

#Derrubar todas os dockers
docker stop $(docker ps -a -q) && docker rm $(docker ps -a -q)

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
docker exec cliFabric peer chaincode invoke -n ${CONTRACT_NAME} -c '{"function":"createLote","Args":["CX0", "Lote Genesis", "KG", "1", "Fuzaro Farm"]}' -C mychannel

