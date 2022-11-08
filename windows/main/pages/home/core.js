function createLogicCore(window){

    const { ipc, eventEmitterCreator, ejs, require, events} = window
    const eventEmitter = eventEmitterCreator()
    const globalEvents = events
    
    const page = require(__dirname, './render')({eventEmitter, ejs, globalEvents})

    let colaboradores

    const optionsPage = {
        user: 'Menu'
    }

    function openRequest(){
        const mat = page.matricula.value
        if(colaboradores[mat]){
            globalEvents.send('toChargeRequisitar', mat)
            setTimeout(()=>{
                toCharge()
            }, 10* 60* 1000)
        }else{
            ipc.sendSync('dialogError', 'Matricula não cadastrada!!!')
        }
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

        eventEmitter.DOM('click', page.requests, 
        ()=>globalEvents.send('toChargeRequests'))

        eventEmitter.DOM('click', page.moviments, 
        ()=>globalEvents.send('toChargeMoviments'))

        eventEmitter.DOM('click', page.btEntrar, openRequest)

        eventEmitter.DOM('keyup', page.matricula, event=>{
            if(event.keyCode === 13) openRequest()
        })
    }

    function toCharge(){
        ipc.sendSync('setPermissionScanner', false)
        eventEmitter.send('render', optionsPage)
        colaboradores = ipc.sendSync('getColaboradores')
        assignRoles()
        home.mainCase = page.mainCase
        page.matricula.focus()
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