module.exports  = ()=>{

    const {createObjectCsvWriter} = require('csv-writer')
    const fs = require('fs')
    const path = require('path')
    const source = path.join(__dirname, './src/produtos.csv')

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
            .on('error', err=>reject)
        })
    }

    return {
        readerData,
        writerData,
    }

}