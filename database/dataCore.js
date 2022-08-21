module.exports = (props)=>{

    const {ipcMain, events} = props

    const dateFetures = require('../modules/dateFetures')()
    
    const sqlite = require('./sequelize/create')()
    const excel = require('./excel')()
    const csv = require('./csvWriter')()
    const json = require('./jsonCore')()

    let products = {}

    async function importProducts(){
        const data = excel.getProdutos()
        const header = []
        Object.keys(dataObject[0]).forEach(key=>{
            header.push({id: key, title: key})
        })
        await csv.writerData({header,data})
    }

    async function getProducts(){
        try{
            const data = await csv.readerData()
            const resp = {}
            data.forEach((produto, index)=>{                
                const {codigo, descricao, endereco, estoque, minimo, maximo} = produto
                resp[codigo] = {descricao, endereco, estoque: Number(estoque), minimo, maximo}
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
        

        console.log(code)
        if(type == 'entrada'){
            products[code].estoque += quantidade
        }else{
            products[code].estoque -= quantidade
        }

        updateProducts()
    }

    async function registerInventoryCount(data){
        try{
            const diff  = data.anterior-data.atual
            const type = diff>0?'saída':'entrada' 
            const quantidade = Math.abs(diff)

            if(diff != 0){
                await itemOutput({
                    ...data,
                    tipo: type,
                    quantidade,
                    origen: 'inventario',
                })

                changeStock({
                    code: data.codigo,
                    quantidade,
                    type
                })
            }

            const now = dateFetures.getDate()
            return await getHistorico({
                mes: now.mes,
                ano: now.ano,
                origen: 'inventario'
            })

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
            return true
        }catch(err){
            events.sendSync('dialogError', `Erro dataCore - ${err}`)
            return false
        }
    }

    async function getHistorico(conditions){
        try{
            const historico = await sqlite.Historico.findAll({
                where: conditions
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
    
    function declareEvents(){
        //Produtos
            events.on('getProducts', (event)=>{
                event.returnValue = products
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
    }

    async function init(){
        try{
            await sqlite.init()
            await getProducts()
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