const {INTEGER, STRING} = require('sequelize').DataTypes

function createModels(connection){

    const models = {}
    function create(){
        Object.keys(models).forEach(model => {
            models[model] = connection.define(model.toLowerCase(), models[model])
        })
    }

    const id = {
        type: INTEGER,
        autoIncrement: true,
        alloNull: false,
        primaryKey: true,
    }

    models.Produto = {
        id,
        codigo: {
            type: STRING,
            alloNull: false
        },
        descricao: {
            type: STRING,
            alloNull: false,
        },
        endereco: {
            type: STRING,
            alloNull: false
        },
        estoque: {
            type: INTEGER,
            alloNull: false
        },
        minimo: {
            type: INTEGER,
            alloNull: false
        },
        maximo: {
            type: INTEGER,
            alloNull: false
        },
        
    }


    create();
    return models

}

module.exports = createModels