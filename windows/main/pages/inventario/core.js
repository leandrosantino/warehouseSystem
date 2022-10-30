function createCore({window, container}){

    const { ipc, eventEmitterCreator, ejs, require, events} = window
    const eventEmitter = eventEmitterCreator()
    const globalEvents = events
    
    const page = require(__dirname, './render')({eventEmitter, ejs, container, globalEvents})
    
    const renderTable = dados => eventEmitter.send('renderTable', dados)
 
    function assignRoles(){
        eventEmitter.DOM('click', page.btRegistar, ()=>{
            if(ipc.sendSync('dialogQuestion',{
                msg: 'Atenção!!',
                detail: 'Realmente deseja salvar as alterações de Inventário?\nEsta ação não pode ser revertida!!',
                window: 'main'
            })){
                ipc.send('saveInventory')
                renderTable({dados:{}, products:{}})
            }
        })
    }

    function toCharge(){ 
        ipc.sendSync('setPermissionScanner', true)
        eventEmitter.send('render', {})

        const products = ipc.sendSync('getProducts')
        
        renderTable({
            dados: ipc.sendSync('getInventory'), 
            products,
        })
        
        ipc.on('updateHistorico', (event, args)=>{
            renderTable({
                dados: args,
                products
            })
        })
        assignRoles()
    }
 
    function deleteHistorico(code){
        window.ipc.send('deleteInventoryCount', code)
    }

    globalEvents.on('toChargeInventario', toCharge)

    function update(){
        console.log('Update')
    }

    return {
        toCharge,
        update,
        deleteHistorico,
    }

}

module.exports = createCore