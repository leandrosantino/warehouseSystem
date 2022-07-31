function dataBase(){

    const {Sequelize, Op} = require('sequelize')
    const connection = new Sequelize({
        dialect: 'sqlite',
        storage: `./database/src/dataBase.sqlite`,
    });

    const createModels = require('./models')
    const models = createModels(connection)

    async function init(config = {}){
        await connection.sync(config)
        console.clear()
    }

    async function close(){
        await connection.close()
    }

    async function getProdutos(){
        try{
            const resp = {}
            const produtos = await models.Produto.findAll()

            produtos.forEach(produto=>{                
                const {codigo, descricao, endereco, estoque} = produto
                resp[codigo] = {descricao, endereco, estoque}
            })

            return resp
   
        }catch(err){
            return {err}
        }
    }

    return {
        connection,
        init,
        close,
        ...models,
        Op,
        getProdutos
    }
}
  
module.exports = dataBase