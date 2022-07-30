// User Management

module.exports = (ipcMain, eventEmitter)=>{

    const {admin, editor} = {
        admin: {
            pages: [
                'requisicoes',
                'estoque',
            ],
            actions: [
                'user manage',
            ], 
        },
        editor: {
            pages: [
                'requisicoes',
            ],
            actions: [], 
        }
    }

    const users = {
        'leandro_santino': {
            name: 'Leandro Santino',
            password: 'alpha45c',
            permissions: admin
        },
        'eliabe_carlos': {
            name: 'Eliabe Carlos',
            password: 'calanguinho',
            permissions: editor
        },
    }

    let userConneted = {}

    function createUser(){

    }

    function login(loginData = {
        user,
        pass,
    }){ 
        const user = users[loginData.user]
        if(user){
            if(users.pass === loginData.pass){
                userConneted = user
                return user
            }else{
                return false
            }
        }else{
            return false
        }
    }

    function logout(){
        if(eventEmitter.sendSync('dialogQuestion', {
            msg: 'Atenção!!',
            detail: 'Realmente Dejeja fazer logout?',
            window: 'main',
            sync:true,
        })){
            userConneted = {}
            return true
        }else{
            return false
        }
    }

    function getConectedUser(){
        return userConneted ? userConneted : false
    }



    function init(){

        ipcMain.on('getConectedUser', (event, args)=>{
            event.returnValue = getConectedUser()
        })

        ipcMain.on('login', (event, args)=>{
            event.returnValue = login({
                user: args.user,
                pass: args.pass
            })
        })

        ipcMain.on('logout', (event, args)=>{
            event.returnValue = logout()
        })

    }

    
    const product = {
        init,
        login,
        getConectedUser,
    }

    return product

}

