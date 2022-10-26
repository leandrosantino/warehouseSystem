module.exports = (props)=>{

    const path = require('path')
    const fs = require('fs')
    const {ipcMain, events} = props 
    const dateFetures = require('../modules/dateFetures')()
    
    const sqlite = require('./sequelize/create')()
    const excel = require('./excel')()
    const csv = require('./csvWriter')()
    const json = require('./jsonCore')()
    const macroExe = require('./macroExe')()
    const PDF = require('../modules/PDF/PDFgenerator')(events)
    
    const dataBase = {
        products: {},
        colaboradores: {},
        utes: {},
        maquinas: [],
    }
    const naturezas = {
        'Quebra': 0, 'Preventiva': 1, 'Melhoria': 2, 'Segurança': 3, 'Outros': 4,
    }

    async function importDataBase(dialog){
        try{
            const source = json.getExcelDBpath()

            if(fs.existsSync(source)){
                json.setExcelDBpath(source)
                const {products, colaboradores, utes, maquinas} = excel.getSheetData(path.normalize(source))
                dataBase.products = products
                dataBase.colaboradores = colaboradores
                dataBase.utes = utes
                dataBase.maquinas = maquinas
                if(dialog){
                    events.sendSync('dialogSuccess', {
                        msg: 'Sucesso! - Importação de dados Finalizada!',
                        window: 'main',
                    })
                }
            }else{
                events.sendSync('dialogSuccess', {
                    msg: `Atenção!!! - Base de Dados não Selecionada! \n 
                    Escolha o local da Base de Dados na janela de configurações
                    para que o programa funcione normalmente!`,
                    window: 'main',
                })
            }
                
            return true

        }catch(err){
            events.sendSync('dialogError', `Erro ao importar dados - ${err}`)
            return false
        }
    }

    async function updateProducts(){
        try{
            const data = []
            Object.keys(dataBase.products).forEach(key=>{
                const item = dataBase.products[key]
                data.push({...item, codigo: key})
            })

            const header = []
            Object.keys(data[0]).forEach(key=>{
                header.push({id: key, title: key})
            })

            await csv.writerData({header,data})
            return true
        }catch(err){
            events.sendSync('dialogError', `Erro dataCore - ${err}`)
            return false
        }

    }

    function changeStock(data){
        const {quantidade, type, code} = data
        if(type == 'entrada'){
            dataBase.products[code].estoque += quantidade
        }else{
            dataBase.products[code].estoque -= quantidade
        }
        updateProducts()
    } 

    async function registerInventoryCount(data){
        try{
            const produto = dataBase.products[data.codigo]

            const diff  = produto.estoque-data.atual
            const type = diff>0?'saída':'entrada' 
            const quantidade = Math.abs(diff)
            
            if(!produto){
                events.sendSync('dialogError', `Item não encontrado!`)
                return false
            }

            //if(diff != 0){}
                await itemOutput({
                    ...data,
                    endereco: produto.endereco,
                    descricao: produto.descricao,
                    anterior: produto.estoque,
                    tipo: diff == 0?'inalterado':type,
                    quantidade,
                    origen: 'inventario',
                })
            

            const now = dateFetures.getDate()
            const historico = await getHistorico({
                mes: now.mes,
                ano: now.ano,
                origen: 'inventario'
            })
            
            const window = events.sendSync('getWindows', 'main')
            window.webContents.send('updateHistorico', historico)
            
            return true

        }catch(err){
            events.sendSync('dialogError', `Erro dataCore - ${err}`)
            return false
        }
    }

    async function registerRequisition(data){
        try{
            const {code, quantidade, type} = data
            const produto = dataBase.products[code]
            if(!produto){
                events.sendSync('dialogError', `Item não encontrado!`)
                return false
            }
            console.log(produto)

            const atual =  type=='entrada'?
            produto.estoque+quantidade:
            produto.estoque-quantidade

            console.log(produto.estoque, atual, quantidade, type)

            if(atual < 0){
                events.sendSync('dialogError', `Estoque insuficiente`)
                return false
            }

            await itemOutput({
                codigo: code,
                endereco: produto.endereco,
                descricao: produto.descricao,
                anterior: produto.estoque,
                atual,
                tipo: type,
                quantidade,
                origen: 'requisicao',
            })

            console.log(dataBase.products[code])

            return true

        }catch(err){
            events.sendSync('dialogError', `Erro dataCore - ${err}`)
            return false
        }
    }

    async function itemOutput(data){
        try{
            await sqlite.Historico.create({
                ...dateFetures.getDateforHistorico(),
                ...data,
            })
            changeStock({
                code: data.codigo,
                quantidade: data.quantidade,
                type: data.tipo
            })
            return true
        }catch(err){
            events.sendSync('dialogError', `Erro dataCore - ${err}`)
            return false
        }
    }

    async function getHistorico(conditions){
        try{ 
            const historico = await sqlite.Historico.findAll({
                where: conditions,
                order: [
                    ['id', 'DESC'],
                ],
            })

            const resp = []
            historico.forEach(row=>{
                resp.push(row.dataValues)
            })
            return resp
        }catch(err){ 
            events.sendSync('dialogError', `Erro dataCore - ${err}`)
            return false
        }
    }

    async function deleteHistoricRecord(id){
        try{

            const quest = events.sendSync('dialogQuestion', {
                msg: 'Realmente deseja excluir o registro?',
                detail: 'Esta ação não pode ser revertida!',
                window: 'main',
            })

            if(quest){
                const record = await sqlite.Historico.findOne({where: {id}})
                const {codigo, quantidade, tipo} = record.dataValues

                if(record){record.destroy()}
    
                const now = dateFetures.getDate()
                const historico = await getHistorico({
                    mes: now.mes,
                    ano: now.ano,
                    origen: 'inventario'
                })

                changeStock({
                    code: codigo,
                    quantidade,
                    type: tipo=='entrada'?'saída':'entrada'
                })
    
                const window = events.sendSync('getWindows', 'main')
                window.webContents.send('updateHistorico', historico)

                events.sendSync('dialogSuccess', {
                    msg: 'Registro excluido com sucesso!',
                    window: 'main',
                })
    
                return true
            }

        }catch(err){
            events.sendSync('dialogError', `Erro dataCore - ${err}`)
            return false
        }
    }

    async function generateSheetHistoric(conditions){
        try{ 

            const historic = await getHistorico(conditions)

            if(historic.length != 0){
                const sheetData = []

                historic.forEach(item=>{
                    const {
                        date, codigo, endereco, quantidade, descricao, anterior, atual, origen
                    } = item
                    sheetData.push([
                        date, codigo, endereco, quantidade, descricao, anterior, atual, origen
                    ])
                })

                const source = events.sendSync('dialogPath', {
                    title: 'Selecionar local para salvar planilha de historico',
                    type: 'folder',
                    window: 'main',
                })

                if(source){
                    excel.updateHistorico(sheetData, source)
                    events.sendSync('dialogSuccess', {
                        msg: 'Planilha criada com sucesso!!',
                        window: 'main',
                    })
                    return true
                }else{
                    return false
                }
                
            }else{
                events.sendSync('dialogError', `Erro - Sem registro de historico!`)
                return false
            }
        }catch(err){
            events.sendSync('dialogError', `Erro dataCore - ${err}`)
            return false
        }
    }

    function PDFformatData(dados){
        dados.numero = json.getRequestNumber()
        dados.turno = dateFetures.getTurno()
        dados.ute = dataBase.utes[dados.tag]
        const arrayNat = ['', '', '', '', '']
        arrayNat[naturezas[dados.natureza]] = 'X'
        dados.natureza = arrayNat
        dados.material = []

        Object.keys(dados.itens).forEach((key, index)=>{
            const {nome, quantR, quantE} = dados.itens[key]
            index++
            dados.material.push({
                index, codigo: key, descricao: nome, quantR, quantE,
            })
        })

        const materialLen = dados.material.length
        if(materialLen < 6){
            const diff = 6 - materialLen
            let index = materialLen
            for(let i=1;i<=diff;i++){
                index++
                dados.material.push({
                    index, codigo:'', descricao:'', quantR:'', quantE:'',
                })
            }
        }

        return dados
    }

    async function registerRequisição(dados){
        const {itens} = dados
        const moviments = []
        const dateNow = dateFetures.getDateStr()
        dados.data = dateNow
        dados.hora = dateFetures.getHourstr()

        Object.keys(itens).forEach(key=>{
            moviments.push({
                data: dateNow,
                codigo: key,
                tipo: 'Saída',
                quant: itens[key].quantE,
            })
        })

        try{
            if(fs.existsSync(json.getPDFpath())){
                const source = json.getExcelDBpath()
                await macroExe.executeMacro({
                    filePath: path.normalize(source),
                    macroName: 'Module1.registerMovement',
                    args: moviments,
                }) 
                await PDF.generate(PDFformatData(dados))
                await importDataBase()
                events.sendSync('getWindows', 'main').webContents.send('resetMain', 'requisitar')
                
                return true
            }else{
                events.sendSync('dialogSuccess', {
                    msg: `Atenção!!! - Pasta de PDFs não selecionada! \n 
                    Escolha o local para salvar os PDFs na janela de configurações
                    para que o programa funcione normalmente!`,
                    window: 'main',
                })
                return false
            }
        }catch(err){
            console.log(err)
            return false
        }
    }    

    function getRequestsProducts(){
        const products2 = {}
        Object.keys(dataBase.products).forEach(key=>{
            products2[key]={
                nome: dataBase.products[key].descricao,
                endereco: dataBase.products[key].endereco,
                quant:  dataBase.products[key].estoque,
            }
        })
        return products2
    }

    function selectExcelDBpath(){
        const source = events.sendSync('dialogPath', {
            title: 'Selecionar Planilha do Almoxarifado',
            type: 'file',
            window: 'main',
        })
        if(source){
            json.setExcelDBpath(source)
            return source
        }else{
            return false
        }
    }

    function seletcPDFpath(){
        const source = events.sendSync('dialogPath', {
            title: 'Selecionar Pasta para PDFs',
            type: 'folder',
            window: 'main',
        })
        if(source){
            json.setPDFpath(source)
            return source
        }else{
            return false
        } 
           
    }
 
    function declareEvents(){
        //Produtos
            events.on('getProducts', (event, args)=>{
                event.returnValue = args?dataBase.products[args]:dataBase.products
            })
            events.on('changeStock', (event, args)=>{
                changeStock(args)
                event.returnValue = true
            })            
        //Histórico
            events.on('getHistorico', async (event, args)=>{
                event.returnValue = await getHistorico(args)
            })
            events.on('updateHistorico', (event, args)=>{
                event.returnValue = excel.updateHistorico(args)
            })
            events.on('itemOutput', async (event, args)=>{
                event.returnValue = await itemOutput(args)
            })
            events.on('registerInventoryCount', async (event, args)=>{
                event.returnValue = await registerInventoryCount(args)
            })
        //Ipc
            ipcMain.on('importDataBase', async (event, args)=>{
                event.returnValue = await importDataBase(true)
                events.sendSync('getWindows', 'main').webContents.send('resetMain', '')
            })
            ipcMain.on('generateSheetHistoric', async (event, args)=>{
                event.returnValue =  await generateSheetHistoric(args)
            })
            ipcMain.on('deleteHistoricRecord', async (event, args)=>{
                event.returnValue =  await deleteHistoricRecord(args)
            })
            ipcMain.on('getRequestsProducts', (event, args)=>{
                event.returnValue = getRequestsProducts()
            })
            ipcMain.on('getMaquinas', (event, args)=>{
                event.returnValue = dataBase.maquinas
            })
            ipcMain.on('getColaboradores', (event, args)=>{
                event.returnValue = dataBase.colaboradores
            })
            ipcMain.on('registerRequisição', async(event, args)=>{
                event.returnValue = await registerRequisição(args)
            })
            ipcMain.on('setExcelDBpath', (event, args)=>{
                event.returnValue = selectExcelDBpath()
            })
            ipcMain.on('setPDFpath', (event, args)=>{
                event.returnValue = seletcPDFpath()
            })
            ipcMain.on('getExcelDBpath', (event, args)=>{
                event.returnValue = json.getExcelDBpath()
            })
            ipcMain.on('getPDFpath', (event, args)=>{
                event.returnValue = json.getPDFpath()
            })
    }

    async function init(){
        try{
            await sqlite.init()
            await importDataBase()
            declareEvents()

            return true
        }catch(err){
            console.log(err)
            return false
        }
    }

    return {
        init,
    }

}