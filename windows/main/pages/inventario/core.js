function createCore({window, container}){

    const { ipc, eventEmitterCreator, ejs, require, events} = window
    const eventEmitter = eventEmitterCreator()
    const globalEvents = events
    
    const page = require(__dirname, './render')({eventEmitter, ejs, container, globalEvents})
 
    function assignRoles(){
        eventEmitter.DOM('click', page.btImport, ()=>{
            window.ipc.send('importProducts')
        })
        eventEmitter.DOM('click', page.btPlanilha, ()=>{
            const now = new Date()
            window.ipc.send('generateSheetHistoric', {
                mes: now.getMonth(),
                ano: now.getFullYear()
            })
        })
    }

    function toCharge(){
        ipc.sendSync('setPermissionScanner', true)
        eventEmitter.send('render', {})

        let historico = ipc.sendSync('getHistorico')

        eventEmitter.send('renderTable', historico)
        
        ipc.on('updateHistorico', (event, args)=>{
            eventEmitter.send('renderTable', args)
        })
        assignRoles()
    }
 
    function deleteHistorico(id){
        window.ipc.send('deleteHistoricRecord', Number(id))
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