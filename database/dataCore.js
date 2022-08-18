module.exports = (props)=>{

    const {ipcMain, events} = props
    
    const sqlite = require('./sequelize/create')()
    const excel = require('./excel')()
    const csv = require('./csvWriter')()
    const json = require('./jsonCore')()

    async function init(){
        try{
            await sqlite.init()
            return true
        }catch(err){
            return false
        }
    }

    return {
        init,
        excel
    }

}