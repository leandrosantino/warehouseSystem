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
    }

    async function close(){
        await connection.close()
    }    

    return {
        connection,
        init,
        close,
        ...models,
        Op,
    }
}
  
module.exports = dataBase