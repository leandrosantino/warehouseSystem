// User Management
module.exports = ({ipcMain, events})=>{

    const json = require('../database/jsonCore')()

    const permissions = {
        pages: [
            'requests',
            'inventario',
            'estoque',
            'config',
            'requisitar',
        ],
        actions: [
            'user manage',
        ], 
    }

    const user = json.getUserData()

    console.log(user)

    let userConneted = {}

    const getSecurityQuestion = () => {return user.securityQuestion}

    function loginWithSecurityQuestion(email, response){
        if(user.securityQuestionResponse === response){
            if(user.email === email ){
                user.permissions = permissions
                userConneted = user
                return user
            }else{
                return false
            }
        }else{
            false
        }
    }

    function createUser(UserData){
        json.setUserData(UserData)
        return true
    }

    function login(loginData = {
        email,
        pass,
    }){ 
        if(loginData.email === user.email){
            if(user.pass === loginData.pass){
                user.permissions = permissions
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
        if(events.sendSync('dialogQuestion', {
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

        ipcMain.on('getSecurityQuestion', (event, args)=>{
            event.returnValue = getSecurityQuestion()
        })

        ipcMain.on('loginWithSecurityQuestion', (event, args)=>{
            event.returnValue = loginWithSecurityQuestion(args)
        })

        ipcMain.on('createUser', (event, args)=>{
            event.returnValue = createUser(args)
        })


        ipcMain.on('login', (event, args)=>{
            event.returnValue = login(args)
        })

        ipcMain.on('logout', (event, args)=>{
            event.returnValue = logout()
        })

    }

    
    const product = {
        init,
        login,
        getConectedUser,
        getSecurityQuestion,
        loginWithSecurityQuestion,
        createUser,
    }

    return product

}

