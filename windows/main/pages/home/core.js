function createLogicCore(window){

    const { ipc, eventEmitterCreator, ejs, require, events} = window
    const eventEmitter = eventEmitterCreator()
    const globalEvents = events
    
    const page = require(__dirname, './render')({eventEmitter, ejs, globalEvents})

    const optionsPage = {
        user: 'Menu'
    }

    function assignRoles(){
        eventEmitter.DOM('click', page.logout, 
        ()=> globalEvents.send('logout'))

        eventEmitter.DOM('click', page.config, 
        ()=>globalEvents.send('toChargeConfig'))

        eventEmitter.DOM('click', page.login, 
        ()=> globalEvents.send('toChargeLogin'))

        eventEmitter.DOM('click', page.requisitar, 
        ()=> globalEvents.send('toChargeRequisitar'))

        eventEmitter.DOM('click', page.inventario, 
        ()=>globalEvents.send('toChargeInventario'))
    }

    function toCharge(){
        ipc.sendSync('setPermissionScanner', false)
        eventEmitter.send('render', optionsPage)
        assignRoles()
        home.mainCase = page.mainCase
    }

    function update(){
        console.log('Update')
    }
    
    const home = {
        update,
        toCharge
    }

    toCharge()

    globalEvents.on('toChargeHome', toCharge)

    return home
}

module.exports = createLogicCore