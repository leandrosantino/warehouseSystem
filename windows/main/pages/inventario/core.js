function createCore({window, container}){

    const { ipc, eventEmitterCreator, ejs, require, events} = window
    const eventEmitter = eventEmitterCreator()
    const globalEvents = events
    
    const page = require(__dirname, './render')({eventEmitter, ejs, container})

    function toCharge(){
        window.ipc.sendSync('setPermissionScanner', true)
        eventEmitter.send('render', {})

        let historico = window.ipc.sendSync('getHistorico')
        if(historico.length == 0){
            historico = [
                ['', '', '', '', '', '', ''],
            ]
        }

        eventEmitter.send('renderTable', historico)

        window.ipc.on('updateHistorico', (event, args)=>{
            eventEmitter.send('renderTable', args)
        })

    }

    globalEvents.on('toChargeInventario', toCharge)

    function update(){
        console.log('Update')
    }

    return {
        toCharge,
        update,
    }

}

module.exports = createCore