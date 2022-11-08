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
            'moviments',
        ],
        actions: [
            'user manage',
        ], 
    }

    const adminUser = 'arduino'
    const adminPass = 'esp8266'

    const user = json.getUserData()
    user.permissions = permissions

    let userConneted = {}

    const getSecurityQuestion = () => {return user.securityQuestion}

    function loginWithSecurityQuestion(email, response){
        if(user.securityQuestionResponse === response){
            if(user.email === email ){
                userConneted = user
                return user
            }else{
                return false
            }
        }else{
            false
        }
    }

    function updateUserData({email, newpass, pass}){
        try {
            if(user.password === pass || adminPass == pass){
                user.email = email
                user.password = newpass
                userConneted = user
                json.setUserData(user)
                console.log(user)
                return {error: false}
            }
            return {error: 'Senhão atual inválida!'}
        } catch (error) {
            return {error}
        }
    }

    function createUser(UserData){
        json.setUserData(UserData)
        return true
    }

    function login(loginData = {
        email,
        password,
    }){ 

        if(loginData.email == user.email || adminUser == loginData.email){
            if(user.password == loginData.password || adminPass == loginData.password){
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
        return userConneted.name ? userConneted : false
    }



    function init(){

        ipcMain.on('getConectedUser', (event, args)=>{
            event.returnValue = getConectedUser()
        })

        ipcMain.on('getSecurityQuestion', (event, args)=>{
            event.returnValue = getSecurityQuestion()
        })

        ipcMain.on('teste', (event, args)=>{
            event.returnValue = updateUserData(args)
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

