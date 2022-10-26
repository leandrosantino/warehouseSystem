function createExcelModel(){
    
    const xlsx = require('node-xlsx')
    const path = require('path')
    const fs = require('fs') 


    function getWorksheet(workbook, sheetName, col){
        let sheet
        workbook.forEach(_sheet=>{
            if(_sheet.name == sheetName){
                sheet = _sheet.data
            }
        })
        let start
        sheet.forEach((item, index)=>{
            if(item[0] == col){
                start = index+1
            }
        })
        return {sheet, start}
    }

    function getProducts(workbook){
        try{
            const {sheet, start} = getWorksheet(workbook, 'CONTROLE GERAL', 'Codigo')

            let labels = [
                'Codigo','Classificação','Descrição Tecnica', 
                'ENDEREÇO','Estoque','Mínimo','Maximo'
            ].map(item=>{
                let index
                sheet[3].forEach((row, _index)=>{
                    if(row == item){
                        index = _index 
                        return
                    }
                })
                return index
            })

            sheet.splice(0,start)
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

            const resp = {}
            dataObject.forEach((produto, index)=>{                
                const {
                    codigo, 
                    classificacao,
                    descricao, 
                    endereco,
                    estoque, 
                    minimo, 
                    maximo
                } = produto
                resp[codigo] = {
                    descricao, 
                    classificacao,
                    endereco, 
                    estoque: Number(estoque), 
                    minimo: Number(minimo), 
                    maximo: Number(maximo)
                }
            })
            return resp
   
        }catch(err){
            return {err}
        }
    }

    function getDButes(workbook){
        try{
            const {sheet, start} = getWorksheet(workbook, 'DB_UTEs', 'Máquina')
            sheet.splice(0,start)
            const utes = {}, maquinas = []
            sheet.forEach(item=>{
                utes[item[0]] = item[1]
                maquinas.push(item[0])
            })
            return {utes, maquinas}
        }catch(err){
            return {err}
        }
    }

    function formatName(name){
        let resp = ''
        const arrayName = name.split(' ')
        resp += `${arrayName[0]} `
        if(arrayName[1].length <= 3){
            resp += `${arrayName[1]} ${arrayName[2]}`
        }else{
            resp += arrayName[1]
        }
        return resp
    }

    function getColaboradores(workbook){
        try{
            const {sheet, start} = getWorksheet(workbook, 'BD_matriculas', 'Matrícula')
            sheet.splice(0,start)
            const colaboradores = {}
            sheet.forEach(item=>{
                colaboradores[item[0]] = formatName(item[1])
            })
            return colaboradores
        }catch(err){
            return {err}
        }
    }

    function getSheetData(source){
        const workbook = xlsx.parse(source)
        const {utes, maquinas} = getDButes(workbook)

        return {
            products: getProducts(workbook),
            colaboradores: getColaboradores(workbook),
            utes, maquinas,
        }
    }

    function getHistorico(source){
        try{
            //path.join(source, 'histórico.xlsx')
            const workbook = xlsx.parse(source)
            const sheet = workbook[0]
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
        getHistorico,
        updateHistorico,
        createXlsx,
        getSheetData,
    }
}

module.exports = createExcelModel