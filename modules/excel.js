function createExcelModel(ipcMain, dataBase){
    
    const xlsx = require('node-xlsx')
    const path = require('path')
    const source = path.join(__dirname, '../database/src')
    const fs = require('fs')

    function getProdutos(){
        try{
            const workbook = xlsx.parse(path.join(source, 'CONTROLE DE SPARE PARTS.xlsm'))
            const sheet = workbook[1].data

            let labels = [
                'Codigo',
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
                if(row[labels[1]]){
                    dataObject.push({
                        codigo: row[labels[0]],
                        descricao: row[labels[1]],
                        endereco: row[labels[2]],
                        estoque: row[labels[3]],
                        minimo: row[labels[4]]?row[labels[4]]:0,
                        maximo: row[labels[5]]?row[labels[5]]:0,
                    })
                }
            })

            const resp = {}
            dataObject.forEach((produto, index)=>{                
                const {codigo, descricao, endereco, estoque} = produto
                resp[codigo] = {descricao, endereco, estoque}
            })

            return resp
   
        }catch(err){
            return {err}
        }
    }

    function getHistorico(){
        try{
            const workbook = xlsx.parse(path.join(source, 'histórico.xlsx'))
            const sheet = workbook[0].data
            sheet.splice(0,1)
            return sheet
        }catch{
            return false
        }
    }

    function updateHistorico(_data){
        try{   
            const labels = [
                'Data',
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