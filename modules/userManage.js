const {ipcMain} = require('electron')

module.exports = ()=>{
    const users = {}

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

    function getUserConected(){
        return userConneted ? userConneted : false
    }

    
    const product = {
        login,
        getUserConected,
    }

    return product

}