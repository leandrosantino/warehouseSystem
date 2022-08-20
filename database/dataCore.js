module.exports = (props)=>{

    const {ipcMain, events} = props
    
    const sqlite = require('./sequelize/create')()
    const excel = require('./excel')()
    const csv = require('./csvWriter')()
    const json = require('./jsonCore')()

    let produtcs = {}

    async function updateProduts(){
        const data = excel.getProdutos()
        const header = []
        Object.keys(dataObject[0]).forEach(key=>{
            header.push({id: key, title: key})
        })
        console.log(header)
        await csv.writerData({header,data})
    }

    async function getProduts(){
        try{
            const data = await csv.readerData()
            const resp = {}
            data.forEach((produto, index)=>{                
                const {codigo, descricao, endereco, estoque} = produto
                resp[codigo] = {descricao, endereco, estoque}
            })

            produtcs = resp
            
            return resp
        }catch(err){
            console.log(err)
            return false
        }
    }

    async function getHistorico(){
        try{

            const historico = await sqlite.Historico.findAll({
                where:{
                    data: new Date(2022,1,21)
                }
            })

            console.log(historico)


            return true
        }catch(err){
            events.send('dialogError', `Erro dataCore - ${err}`)
            return false
        }
    }
 

    
    function declareEvents(){
        //Produtos
            events.on('getProducts', async (event)=>{
                event.returnValue = await getProduts()
            })
            events.on('updateDataProducts', (event, args)=>{
                const {code, estoque} = args
                try{
                    produtcs[code].estoque = estoque
                    event.returnValue = true
                }catch{
                    event.returnValue = false
                }
            })            
            events.on('updateLocalProducts', ()=>{})
        //Histórico
            events.on('getHistorico', (event)=>{
                event.returnValue = excel.getHistorico()
            })
            events.on('updateHistorico', (event, args)=>{
                event.returnValue = excel.updateHistorico(args)
            })
    }

    async function init(){
        try{
            //await sqlite.init()
            await getHistorico()
            declareEvents()
            return true
        }catch(err){
            return false
        }
    }

    return {
        init,
        excel
    }

}