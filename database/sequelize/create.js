function dataBase(){

    const path = require('path')
    const {Sequelize, Op} = require('sequelize')
    const connection = new Sequelize({
        dialect: 'sqlite',
        storage: path.join(__dirname, '../src/dataBase.sqlite'),
        logging: false
    });

    const force = false//true//

    const createModels = require('./models')
    const models = createModels(connection)

    async function init(config = {}){
        await connection.sync({force})
        console.clear()
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