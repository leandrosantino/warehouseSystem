function createCore({window, container}){

    const { ipc, eventEmitterCreator, ejs, require, events} = window
    const eventEmitter = eventEmitterCreator()
    const globalEvents = events
    
    const page = require(__dirname, './render')({eventEmitter, ejs, container, globalEvents})
 
    function toCharge(){
        ipc.sendSync('setPermissionScanner', true)
        eventEmitter.send('render', {})

        let historico = ipc.sendSync('getHistorico')
        if(historico.length == 0){
            historico = [{
                date      : '',
                codigo    : '',
                endereco  : '',
                tipo      : '',
                quantidade: '',
                descricao : '',
                anterior  : '',
                atual     : '',
            }]   
        }

        eventEmitter.send('renderTable', historico)

        ipc.on('updateHistorico', (event, args)=>{
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