const app = document.querySelector('#app')

try{
    
    const home = window.pages.create('home', window)
    const container = home.mainCase

    const reqs = window.pages.create('requisitar', {window, container}) 
    const login = window.pages.create('login', {window, container})

    

    login.toCharge()


    

}catch(err){
    console.log('app-error', err)
}