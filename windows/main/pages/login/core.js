function createCore({window, container}){ 

    const { ipc, eventEmitterCreator, ejs, require,events} = window
    const eventEmitter = eventEmitterCreator()
    const globalEvents = events
    const page = require(__dirname, './render')({eventEmitter, ejs, container, globalEvents})

 
    function login(){
        const login_date = {
            user: 'leandro_santino',//page.input_user.value,//
            password: 'alpha45c'//page.input_password.value,//
        }

        const user = window.ipc.sendSync('login', login_date)
        if(user){
            if(login_date.password == user.password){

                globalEvents.send('showAllowedScreens', {
                    type: 'login',
                    permissions: user.permissions.pages
                })
                globalEvents.send('setUserName', user.name)
                globalEvents.send('toChargeInventario')
            }else{
                eventEmitter.send('loginAlert', 'Usuário ou senha Incorretos!')
            }
        }else{
            eventEmitter.send('loginAlert', 'Usuário ou senha Incorretos!')
        }

        page.input_user.value = ''
        page.input_password.value = ''
    }

    function logout(){
        if(ipc.sendSync('logout')){
            ipc.sendSync('setPermissionScanner', false)
            globalEvents.send('showAllowedScreens', 'logout')
            //globalEvents.send('toChargeLogin')
            globalEvents.send('setUserName', 'Adler Pelzer Group')
        }
    }

    globalEvents.on('logout', logout)

    function assignRoles(){
        eventEmitter.DOM('keypress', page.input_password, ({keyCode})=>{
            if(keyCode == 13){login()}
        })
        eventEmitter.DOM('click', page.login, login)
    }

    function toCharge(){
        const data_Page = {
            conected: false,
            user: 'Adler'
        }
        setTimeout(()=>{ ipc.sendSync('setPermissionScanner', true) },0)
        eventEmitter.send('render', data_Page)
        assignRoles()
        login()
    }

    globalEvents.on('toChargeLogin', toCharge)

    return {
        toCharge,
    }

}

module.exports = createCore