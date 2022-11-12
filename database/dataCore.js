module.exports = (props)=>{

    const path = require('path')
    const fs = require('fs')
    const {ipcMain, events} = props 
    const dateFetures = require('../modules/dateFetures')()
    
    const sqlite = require('./sequelize/create')()
    const excel = require('./excel')()
    const csv = require('./csvWriter')()
    const json = require('./jsonCore')()
    const macroExe = require('./macroExe')(events)
    const PDF = require('../modules/PDF/PDFgenerator')(events)
    
    const dataBase = {
        products: {},
        colaboradores: {},
        utes: {},
        machines: [],
        inventory: {},
    }

    async function importDataBase(dialog){
        try{
            const source = json.getExcelDBpath()

            if(fs.existsSync(source)){
                json.setExcelDBpath(source)
                const {products, colaboradores, utes, machines} = excel.getSheetData(path.normalize(source))
                dataBase.products = products
                dataBase.colaboradores = colaboradores
                dataBase.utes = utes
                dataBase.machines = machines
                dataBase.inventory = await csv.importInventoryFile()
                if(dialog){
                    events.sendSync('dialogSuccess', {
                        msg: 'Sucesso! - Importação de dados Finalizada!',
                        window: 'main',
                    })
                }
            }else{
                if(dialog){
                    events.sendSync('dialogSuccess', {
                        msg: `Atenção!!! - Base de Dados não Selecionada! \n 
                        Escolha o local da Base de Dados na janela de configurações
                        para que o programa funcione normalmente!`,
                        window: 'main',
                    })
                }
            }
                
            return true

        }catch(err){
            events.sendSync('dialogError', `Erro ao importar dados - ${err}`)
            return false
        }
    }

    async function saveInventory(){
        try{
            const excelSource = json.getExcelDBpath()
            const moviments = []

            Object.keys(dataBase.inventory).forEach(key=>{
                if(dataBase.inventory[key].tipo == 'inalterado'){
                    delete dataBase.inventory[key]
                }
            })
    
            Object.keys(dataBase.inventory).forEach(key=>{
                const {date, tipo, quantidade} = dataBase.inventory[key]
                if(tipo == 'Entrada' || tipo == 'Saída'){
                    moviments.push({
                        data: date,
                        codigo: key,
                        tipo,
                        quant: quantidade,
                    })
                }
            })
            
            if(fs.existsSync(excelSource)){

                if(moviments.length > 0){
                    await macroExe.executeMacro({   
                        filePath: path.normalize(excelSource),
                        macroName: 'Module1.registerMovement',
                        args: moviments,
                    })
                    await updateHistory(dataBase.inventory)
                }

                dataBase.inventory = {}
                await csv.updateInventoryFile(dataBase.inventory)

                importDataBase()

                events.sendSync('dialogSuccess', {
                    msg: 'Sucesso! - Inventário Salvo!!',
                    window: 'main',
                })

                return true

            }else{
                events.sendSync('dialogSuccess', {
                    msg: `Atenção!!! - Base de Dados não Selecionada! \n 
                    Escolha o local da Base de Dados na janela de configurações
                    para que o programa funcione normalmente!`,
                    window: 'main',
                })
                return false
            }
        }catch{
            return false
        }
    }    

    async function registerInventoryCount(data){
        try{
            const {codigo, atual} = data
            const produto = dataBase.products[codigo]
            const diff  = produto.estoque-atual
            const type = diff>0?'Saída':'Entrada' 
            const quantidade = Math.abs(diff)

            if(!produto){
                events.sendSync('dialogError', `Item não encontrado!`)
                return false
            }

            dataBase.inventory[codigo] = {
                date: dateFetures.getDateStr(),
                tipo: diff == 0?'inalterado':type,
                quantidade,
                atual,
                anterior: produto.estoque,
                origen: 'inventario',
            }
            
            await csv.updateInventoryFile(dataBase.inventory)
            
            const window = events.sendSync('getWindows', 'main')
            window.webContents.send('updateHistorico', dataBase.inventory)
            
            return true

        }catch(err){
            events.sendSync('dialogError', `Erro dataCore - ${err}`)
            return false
        }
    }

    async function deleteInventoryCount(code){
        try{

            const quest = events.sendSync('dialogQuestion', {
                msg: 'Realmente deseja excluir o registro?',
                detail: 'Esta ação não pode ser revertida!',
                window: 'main',
            })

            if(quest){
                
                if(dataBase.inventory[code]){
                    delete dataBase.inventory[code]
                }else{
                    events.sendSync('dialogError', `Erro dataCore - ${err}`)
                    return false
                }
                
                csv.updateInventoryFile(dataBase.inventory)

                const window = events.sendSync('getWindows', 'main')
                window.webContents.send('updateHistorico', dataBase.inventory)

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

    async function getHistory(conditions){
        try{ 
            const historico = await sqlite.Historico.findAll({
                where: conditions?conditions:{},
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
            events.sendSync('dialogError', `Erro ao importar histórico!  - ${err}`)
            return false
        }
    }

    async function deleteHistory(id){
        try {
            const request = await sqlite.Historico.findOne({
                where: {id}
            })

            console.log(id, request)

            if(request){
                const {date, codigo, quantidade} = request
                console.log(request)

                const excelSource = json.getExcelDBpath()
                if(fs.existsSync(excelSource)){
                    await macroExe.executeMacro({
                        filePath: path.normalize(excelSource),
                        macroName: 'Module1.registerMovement',
                        args: [{
                            data: date,
                            codigo,
                            tipo: 'Retorno',
                            quant: quantidade,
                        }],
                    })

                    await request.destroy()
    
                    return true
                }

                return false
                
            }

            return false
            
        } catch (error) {
            console.log(error)
            return false
        }
    }

    async function updateHistory(data){
        try{
            const formatData = []
            const obj = data.itens?data.itens:data
            
            Object.keys(obj).forEach(key=>{
                const item = obj[key]
                formatData.push({
                    codigo: key,
                    descricao: item.nome?item.nome:dataBase.products[key].descricao,
                    endereco: item.endereco?item.endereco:dataBase.products[key].endereco,
                    tipo: item.tipo?item.tipo:'Saída',
                    quantidade: item.quantE?item.quantE:item.quantidade,
                    anterior: item.anterior?item.anterior:item.quant,
                    atual: item.atual?item.atual:item.quant-item.quantE,
                    origem: item.origem?item.origem:'Requisição',
                    maquina: data.tag?data.tag:'outros',
                    matricula: data.matricula?data.matricula: '',
                    class: dataBase.products[key].classificacao
                })
            })

            formatData.forEach(async item=>{
                await sqlite.Historico.create({
                    ...dateFetures.getDateforHistorico(),
                    ...item,
                })
            })
            
            return true
        }catch(err){
            events.sendSync('dialogError', `Erro ao salvar histórico! - ${err}`)
            return false
        }
    }
   
    async function generateSheetHistoric(conditions){
        try{ 

            const historic = await getHistory(conditions)

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

    async function registerRequests(dados){
        const {itens} = dados
        const moviments = []
        const dateNow = dateFetures.getDateStr()
        dados.ute = dataBase.utes[dados.tag]

        Object.keys(itens).forEach(key=>{
            moviments.push({
                data: dateNow,
                codigo: key,
                tipo: 'Saída',
                quant: itens[key].quantE,
            })
        })

        try{
            
            const excelSource = json.getExcelDBpath()
            if(fs.existsSync(excelSource)){
                if(fs.existsSync(json.getPDFpath())){

                    await PDF.generate(dados)
                    await macroExe.executeMacro({
                        filePath: path.normalize(excelSource),
                        macroName: 'Module1.registerMovement',
                        args: moviments,
                    }) 

                    updateHistory(dados)

                    await importDataBase()
                    events.sendSync('getWindows', 'main').webContents.send('refreshRequestData')
                    return {}
                    
                }else{
                    events.sendSync('dialogSuccess', {
                        msg: `Atenção!!! - Pasta de PDFs não selecionada! \n 
                        Escolha o local para salvar os PDFs na janela de configurações
                        para que o programa funcione normalmente!`,
                        window: 'main',
                    })
                    return {erro: 'source'}
                }
            }else{
                events.sendSync('dialogSuccess', {
                    msg: `Atenção!!! - Base de Dados não Selecionada! \n 
                    Escolha o local da Base de Dados na janela de configurações
                    para que o programa funcione normalmente!`,
                    window: 'main',
                })
                return {erro: 'source'}
            }
            
        }catch(err){
            return {erro: String(err)}
        }
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

    async function setMoviments(data){

        try {
            const moviments = [data]
            const excelSource = json.getExcelDBpath()
            if(fs.existsSync(excelSource)){
                await macroExe.executeMacro({
                    filePath: path.normalize(excelSource),
                    macroName: 'Module1.registerMovement',
                    args: moviments,
                })
                await importDataBase()
                events.sendSync('getWindows', 'main').webContents.send('refreshMovimentsData')
                return true
            }
            return false
        } catch (error) {
            return false
        }
    }
 
    function declareEvents(){
        //Produtos
            events.on('getProduct', (event, args)=>{
                event.returnValue = args?dataBase.products[args]:dataBase.products
            })  
            ipcMain.on('getProducts', (event, args)=>{
                event.returnValue = dataBase.products
            })       
        //Histórico
            ipcMain.on('getHistory', async (event, args)=>{
                event.returnValue = await getHistory(args)
            })
            ipcMain.on('deleteHistory', async (event, args)=>{
                event.returnValue = await deleteHistory(args)
            })
            ipcMain.on('generateSheetHistoric', async (event, args)=>{
                event.returnValue =  await generateSheetHistoric(args)
            })
        //Inventário
            events.on('registerInventoryCount', async (event, args)=>{
                event.returnValue = await registerInventoryCount(args)
            })
            ipcMain.on('deleteInventoryCount', async (event, args)=>{
                event.returnValue =  await deleteInventoryCount(args)
            })
            ipcMain.on('getInventory', (event, args)=>{
                event.returnValue = dataBase.inventory
            })
            ipcMain.on('saveInventory', async (event, args)=>{
                event.returnValue = await saveInventory()
            })
        //Ipc
            ipcMain.on('importDataBase', async (event, args)=>{
                event.returnValue = await importDataBase(true)
                events.sendSync('getWindows', 'main').webContents.send('resetMain', '')
            })
           
            ipcMain.on('getMachines', (event, args)=>{
                event.returnValue = dataBase.machines
            })
            ipcMain.on('getColaboradores', (event, args)=>{
                event.returnValue = dataBase.colaboradores
            })
            ipcMain.on('registerRequests', async(event, args)=>{
                event.returnValue = await registerRequests(args)
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
            ipcMain.on('setMoviments', async (event, args)=>{
                event.returnValue = await setMoviments(args)
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
        getHistory,
        updateHistory,
    }

}