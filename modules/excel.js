function createExcelModel(ipcMain, dataBase){
    
    const xlsx = require('node-xlsx')
    const path = require('path')

    async function populateDB(){

        const plan = xlsx.parse(path.join(__dirname, '../database/src/DB_Almoxarife.xlsx'))
        
        const dados = plan[0].data
        const labels = dados[0]
        dados.splice(0,1)
        labels.splice(0,1)

        const dataObject = []

        dados.forEach((row)=> {
            const object = {}
            row.splice(0,1)
            row.forEach((col, index)=>{
                object[labels[index].toLowerCase()] = col
            })
            dataObject.push(object)
        })
        
        console.log(dataObject)

        dataObject.forEach(async row =>{
            await dataBase.Produto.create(row)
        })

    }
    
    return {
        populateDB,
    }
}

module.exports = createExcelModel