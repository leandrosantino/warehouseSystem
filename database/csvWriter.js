module.exports  = ()=>{

    const {createObjectCsvWriter} = require('csv-writer')
    const fs = require('fs')
    const path = require('path')
    const source = path.join(__dirname, './src/inventory.csv')

    async function writerData({header, data}){
        try{
            const csvWriter = createObjectCsvWriter({
                path: source, 
                header
            });
             
            await csvWriter.writeRecords(data)
            return true
        }catch(err){
            return err
        }
    }

    function readerData(){
        return new Promise((resolve, reject)=>{
            const csv = require('csv-parser')
            const fs = require('fs')
            const results = [];
    
            fs.createReadStream(source)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => {
                resolve(results)
            })
            .on('error', err=>reject(err))
        })
    }

    async function updateInventoryFile(inventory){

        const data = []
        const header = []

        if(!Object.keys(inventory).length == 0){
            Object.keys(inventory).forEach(key=>{
                const item = inventory[key]
                data.push({codigo: key,...item })
            })
            Object.keys(data[0]).forEach(key=>{
                header.push({id: key, title: key})
            })
        }
        
        await writerData({header,data})
    }

    async function importInventoryFile(){
        const data = await readerData()
        const obj = {}

        if(data.length <= 1){
            return {}
        }else{            
            data.forEach(item=>{
                const codigo = item.codigo
                delete item.codigo
                obj[codigo]=item
            })
        }
            
        return obj
    }

    return {
        readerData,
        writerData,
        updateInventoryFile,
        importInventoryFile,
    }

}