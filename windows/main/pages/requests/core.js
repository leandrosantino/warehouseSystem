function createCore({window, container}){

    const { ipc, eventEmitterCreator, ejs, require, events} = window
    const eventEmitter = eventEmitterCreator()
    const globalEvents = events
    
    const page = require(__dirname, './render')({eventEmitter, ejs, container, globalEvents})
    
    const renderTable = dados => {
        eventEmitter.send('renderTable', {
            dados,
            colaboradores,
        })
    }

    let colaboradores
    let products

    let dados = []

    function filterHistoryLocal(){
        const array = []
        dados.forEach(item=>{
            const strSearch = page.inputs.search.value.toLocaleUpperCase()
            const strData = `${item.descricao}${item.endereco}${item.codigo}`.toLocaleUpperCase()
            const resp = strData.search(strSearch)
            if(resp >= 0 || strSearch == ''){
                array.push(item)
            }
        })
        
        renderTable(array)
    }

    function filterHistoryDB(){
        
        const origem = page.inputs.origem.value
        const _class = page.inputs.class.value
        const tipo = page.inputs.tipo.value

        const filters = {
            dia: Number(page.inputs.dia.value),
            mes: Number(page.inputs.mes.value),
            ano: Number(page.inputs.ano.value),
        }
        if(origem != 'todos') filters.origem = origem
        if(_class!= 'todos') filters.class = _class
        if(tipo!= 'todos') filters.tipo = tipo
        
        dados = ipc.sendSync('getHistory', filters)     
        
        filterHistoryLocal()
    }
 
    function assignRoles(){
        events.DOM('click', page.buttons.filter, filterHistoryDB)
        events.DOM('click', page.buttons.closeSearch, ()=>{
            page.inputs.search.value = ''
            filterHistoryLocal()
        })
        events.DOM('keyup', page.inputs.search, filterHistoryLocal)
    }

    function toCharge(){ 
        ipc.sendSync('setPermissionScanner', false)
        eventEmitter.send('render', {})


        colaboradores = ipc.sendSync('getColaboradores')
        products = ipc.sendSync('getProducts')

        dados = ipc.sendSync('getHistory', {})

        renderTable(dados)
        

        assignRoles()
    }
 
    globalEvents.on('toChargeRequests', toCharge)

    function update(){
        console.log('Update')
    }

    return {
        toCharge,
        update,
    }

}

module.exports = createCore