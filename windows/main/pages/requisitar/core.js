function createCore({window, container}){

    const { ipc, eventEmitterCreator, ejs, require, events} = window
    const eventEmitter = eventEmitterCreator()
    const globalEvents = events
    
    const page = require(__dirname, './render')({eventEmitter, ejs, container, globalEvents})
 
    function assignRoles(){

    }

    function toCharge(){
        ipc.sendSync('setPermissionScanner', true)
        eventEmitter.send('render', {})

        assignRoles()
    }
 
    globalEvents.on('toChargeRequisitar', toCharge)


    return {
        toCharge,
    }

}

module.exports = createCore