const app = document.querySelector('#app')

try{
    
    const home = window.pages.create('home', window)
    const reqs = window.pages.create('requisitar', window)
    const login = window.pages.create('login', window)

    //Open page new Request
    window.events.DOM('click', home.btReqs, ()=>{
        reqs.render({container: home.mainCase})
    })
    
    //Open page Login
    window.events.DOM('click', home.login, ()=>{
        login.render({container: home.mainCase})
    })
    //login.render({container: home.mainCase})


    

}catch(err){
    console.log('app-error', err)
}