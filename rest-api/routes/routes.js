
var router      = require('express').Router();
var controller  = require('../controlers/api-controler')

/**
 * Cria uma wallet para o usuário caso não exista.
 */
router.post("/criarUsuario", function(req, res){
    controller.criarUsuario(req.body.userName).then(resp=>{
        res.send(resp)
    }).catch(error=>{
        res.status(500).send(error)
    })
})

/**
 * Cria um carro. É necessário informar o usuário que irá realizar a ação
 */
router.post("/criarCarro", function(req, res){
    //verificando body recebido
   if(req.body.carro == undefined){
    res.status(500).send("Objeto car não enviado pelo body")
   }

   controller.criarCarro(req.body.carro, req.body.userName).then(resp=>{
       res.send(resp)
   }).catch(error=>{
       res.status(500).send(error)
   })
})

/**
 * Faz um trade de um carro entre proprietários
 */
router.post("/tradeCarro", function(req, res){

    if(req.body.userName == undefined) res.status(401).send("Não authorizado. Identifique-se! Passe userName no parametro")

    if(req.body.key == undefined || req.body.newOwner == undefined){
        res.status(500).send("Informe os parametros key e newOwner")
    }

    controller.tradeCarro(req.body.key, req.body.newOwner, req.body.userName).then(resp=>{
        res.send(resp)
    }).catch(error=>{
        res.status(500).send(error)
    })

})

//Recupera um carro pelo ID
router.get("/getCarro/:userName/:id", function(req, res){
    if(req.params.userName == undefined) res.status(401).send("Não authorizado. Identifique-se! Passe userName no parametro")

    controller.getCarro(req.params.id, req.params.userName).then(resp=>{
        res.send(resp)
    }).catch(error=>{
        res.status(500).send(error)
    })

})

//Recupera todos os carros
router.get("/getTodosCarros/:userName", function(req, res){
    if(req.params.userName == undefined) res.status(401).send("Não authorizado. Identifique-se! Passe userName no parametro")

    controller.getCarros(req.params.userName).then(resp=>{
        res.send(resp)
    }).catch(error=>{
        res.status(500).send(error)
    })
})

module.exports = router;