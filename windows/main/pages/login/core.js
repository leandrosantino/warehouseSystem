function createCore({window, container}){ 

    const { ipc, eventEmitterCreator, ejs, require,events} = window
    const eventEmitter = eventEmitterCreator()
    const globalEvents = events
    const page = require(__dirname, './render')({eventEmitter, ejs, container, globalEvents})

 
    function login(){
        const login_date = {
            email: page.input_user.value,//'arduino',//
            password: page.input_password.value,//'esp8266',//
        }

        const user = window.ipc.sendSync('login', login_date)
        if(user){
            
            globalEvents.send('showAllowedScreens', {
                type: 'login',
                permissions: user.permissions.pages
            })
            globalEvents.send('setUserName', user.name)
            globalEvents.send('toChargeRequisitar')                
            
        }else{
            eventEmitter.send('loginAlert', 'Usuário ou senha Incorretos!')
        }

        page.input_user.value = ''
        page.input_password.value = ''
    }

    function logout(){
        if(ipc.sendSync('logout')){
            globalEvents.send('resetWindow')
            globalEvents.send('showAllowedScreens', 'logout')
        }
    }

    globalEvents.on('logout', logout)

    function assignRoles(){
        eventEmitter.DOM('keypress', page.input_password, ({keyCode})=>{
            if(keyCode == 13){login()}
        })
        eventEmitter.DOM('click', page.login, login)
        eventEmitter.DOM('click', page.voltar, ()=>{
            globalEvents.send('resetWindow')
        })  
    }

    function toCharge(){
        const data_Page = {
            conected: false,
            user: 'Adler'
        }
        ipc.sendSync('setPermissionScanner', false)
        eventEmitter.send('render', data_Page)
        assignRoles()
        //login()
    }

    globalEvents.on('toChargeLogin', toCharge)

    return {
        toCharge,
    }

}

module.exports = createCore