const {INTEGER, STRING, DATE} = require('sequelize').DataTypes

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

    models.User = {
        id,
        credential: {
            type: STRING,
            alloNull: false
        },
        name: {
            type: STRING,
            alloNull: false
        },
        password: {
            type: STRING,
            alloNull: false
        },
        permissions: {
            type: STRING,
            alloNull: false
        }
    }

    models.Historico = {
        id,
        semana: {
            type: INTEGER,
            alloNull: false
        },
        dia: {
            type: INTEGER,
            alloNull: false
        },
        mes: {
            type: INTEGER,
            alloNull: false
        },
        ano: {
            type: INTEGER,
            alloNull: false
        },
        date: {
            type: STRING,
            alloNull: false
        },
        codigo: {
            type: STRING,
            alloNull: false
        },
        descricao: {
            type: STRING,
            alloNull: false
        },
        endereco: {
            type: STRING,
            alloNull: false
        },
        tipo: {
            type: STRING,
            alloNull: false
        },
        quantidade: {
            type: INTEGER,
            alloNull: false
        },
        anterior:{
            type: INTEGER,
            alloNull: false
        },
        atual: {
            type: INTEGER,
            alloNull: false
        },
        origem: {
            type: STRING,
            alloNull: false
        },
        maquina: {
            type: STRING,
            alloNull: false
        },
        matricula: {
            type: STRING,
            alloNull: false
        },

    }

    create();
    return models

}

module.exports = createModels