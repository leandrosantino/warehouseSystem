module.exports = (props)=>{

    const path = require('path')

    const {ipcMain, events} = props

    const dateFetures = require('../modules/dateFetures')()
    
    const sqlite = require('./sequelize/create')()
    const excel = require('./excel')()
    const csv = require('./csvWriter')()
    const json = require('./jsonCore')()

    let products = {}

    async function importProducts(){
        try{
            const source = events.sendSync('dialogPath', {
                title: 'Selecionar Planilha do Almoxarifado',
                type: 'file',
                window: 'main',
            })
    
            if(source){
                const data = excel.getProdutos(path.normalize(source))
                const header = []
                Object.keys(data[0]).forEach(key=>{
                    header.push({id: key, title: key})
                })
                await csv.writerData({header,data})
                
                events.sendSync('dialogSuccess', {
                    msg: 'Sucesso! - Importação de dados Finalizada!',
                    window: 'main',
                })
            }
                
            return true

        }catch(err){
            events.sendSync('dialogError', `Erro ao importar dados - ${err}`)
            return false
        }
    }

    async function getProducts(){
        try{
            const data = await csv.readerData()
            const resp = {}
            data.forEach((produto, index)=>{                
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

            products = resp
            
            return resp
        }catch(err){
            console.log(err)
            return false
        }
    }

    async function updateProducts(){
        try{
            const data = []
            Object.keys(products).forEach(key=>{
                const item = products[key]
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
            products[code].estoque += quantidade
        }else{
            products[code].estoque -= quantidade
        }
        updateProducts()
    }

    async function registerInventoryCount(data){
        try{
            const produto = products[data.codigo]

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
            const produto = products[code]
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

            console.log(products[code])

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
 
   
    function declareEvents(){
        //Produtos
            events.on('getProducts', (event, args)=>{
                event.returnValue = args?products[args]:products
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
            ipcMain.on('importProducts', async (event, args)=>{
                event.returnValue = await importProducts()
            })
            ipcMain.on('generateSheetHistoric', async (event, args)=>{
                event.returnValue =  await generateSheetHistoric(args)
            })
            ipcMain.on('deleteHistoricRecord', async (event, args)=>{
                event.returnValue =  await deleteHistoricRecord(args)
            })
    }

    async function init(){
        try{
            await sqlite.init()
            await getProducts()
            declareEvents()

            console.log(dateFetures.getNumWeek(22, 7, 2022))

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