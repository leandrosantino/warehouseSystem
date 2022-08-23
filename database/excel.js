function createExcelModel(){
    
    const xlsx = require('node-xlsx')
    const path = require('path')
    //const source = path.join(__dirname, './src')
    const fs = require('fs') 

    function getProdutos(source){
        try{
            //path.join(source, 'CONTROLE DE SPARE PARTS.xlsm')
            const workbook = xlsx.parse(source)
            const sheet = workbook[1].data

            let labels = [
                'Codigo',
                'Classificação',
                'Descrição Tecnica',
                'ENDEREÇO',
                'Estoque',
                'Mínimo',
                'Maximo'
            ]
            labels = labels.map(item=>{
                let index
                sheet[1].forEach((row, _index)=>{
                    if(row == item){
                        index = _index
                        return
                    }
                })
                return index
            })

            sheet.splice(0,2)
            const dataObject = []
            sheet.forEach(row=>{
                if(row[labels[2]]){
                    dataObject.push({
                        codigo: row[labels[0]],
                        classificacao: row[labels[1]]?row[labels[1]]:'',
                        descricao: row[labels[2]],
                        endereco: row[labels[3]],
                        estoque: row[labels[4]],
                        minimo: row[labels[5]]?row[labels[5]]:0,
                        maximo: row[labels[6]]?row[labels[6]]:0,
                    })
                }
            })

            return dataObject
   
        }catch(err){
            return {err}
        }
    }

    function getHistorico(source){
        try{
            //path.join(source, 'histórico.xlsx')
            const workbook = xlsx.parse(source)
            const sheet = workbook[0].data
            sheet.splice(0,1)
            return sheet
        }catch{
            return false
        }
    }

    function updateHistorico(_data, source){
        try{   
            const labels = [
                'Data',
                'Código', 
                'Endereço',
                'Tipo',
                'Quantidade',
                'Item',
                'Estoque Anterior',
                'Estoque Atual'
            ]

            const data = [labels,..._data]
            const buffer = xlsx.build([{name:'historico', data}])
            fs.writeFileSync(path.join(source, 'histórico.xlsx'), buffer, {encoding: 'utf-8'})
            
            return true
        }catch(err){
            console.log(err)
            return false
        }
    }

    function createXlsx({path, name, data}){
        const buffer = xlsx.build([{name, data}])
        fs.writeFileSync(path, buffer, {encoding: 'utf-8'})
    }

    return {
        getProdutos,
        getHistorico,
        updateHistorico,
        createXlsx,
    }
}

module.exports = createExcelModel