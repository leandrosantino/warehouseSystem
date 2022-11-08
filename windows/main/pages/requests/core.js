function createCore({window, container}){

    const { ipc, eventEmitterCreator, ejs, require, events} = window
    const eventEmitter = eventEmitterCreator()
    const globalEvents = events
    
    const page = require(__dirname, './render')({eventEmitter, ejs, container, globalEvents})
    
    const renderTable = ({dados, colaboradores}) => {
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
        
        console.log(array)

        renderTable({dados:array, colaboradores})
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

        console.log(dados)
        
        filterHistoryLocal()
    }

    function deleteRequest(id){
        if(ipc.sendSync('dialogQuestion',{
            msg: 'Atenção!!',
            detail: 'Realmente deseja Excluir a requisição?\nEsta ação não pode ser revertida!',
            window: 'main'
        })){
            if(ipc.sendSync('deleteHistory', id)){
                dados = ipc.sendSync('getHistory', {})   
                filterHistoryLocal()
                ipc.sendSync('dialogSuccess', {
                    msg:'Requisição Excluida com sucesso!!!',
                    window: 'main'
                })
            }else{
                ipc.sendSync('dialogError', 'Falha ao Excluir requisição!!')
            }
        }
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

        renderTable({dados, colaboradores})
        

        assignRoles()
    }
 
    globalEvents.on('toChargeRequests', toCharge)

    function update(){
        console.log('Update')
    }

    return {
        toCharge,
        update,
        deleteRequest,
    }

}

module.exports = createCore