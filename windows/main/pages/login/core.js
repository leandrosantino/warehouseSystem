function createCore({window, container}){ 

    const { ipc, eventEmitterCreator, ejs, require,events} = window
    const eventEmitter = eventEmitterCreator()
    const globalEvents = events
    const page = require(__dirname, './render')({eventEmitter, ejs, container})

 
    function login(){
        const login_date = {
            user: page.input_user.value,
            password: page.input_password.value,
        }

        const user = window.ipc.sendSync('login', login_date)
        if(user){
            if(login_date.password == user.password){

                globalEvents.send('loginButtons', {
                    type: 'login',
                    permissions: user.permissions.pages
                })
                globalEvents.send('setUserName', user.name)
                globalEvents.send('toChargeRequisitar')
            }else{
                eventEmitter.send('loginAlert', 'Usuário ou senha Incorretos!')
            }
        }else{
            eventEmitter.send('loginAlert', 'Usuário ou senha Incorretos!')
        }

        page.input_user.value = ''
        page.input_password.value = ''
    }



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
        ipc.sendSync('setPermissionScanner', false)
        eventEmitter.send('render', data_Page)
        assignRoles()
    }

    globalEvents.on('toChargeLogin', toCharge)

    return {
        toCharge,
    }

}

module.exports = createCore