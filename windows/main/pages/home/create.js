function createPageHome(window){

    const path = require('path')
    const events = window.events
    const fs = require('fs')

    function createPage(){
        const ejs = window.ejs 

        function getElements(){
            page.login = document.querySelector('#login')
            page.logout = document.querySelector('#logout')
            page.btReqs = document.querySelector('#requisitar')
            page.mainCase = document.querySelector('#mainCase')
            page.requisicoes = document.querySelector('#requisicoes')
            page.estoque = document.querySelector('#estoque')
            page.btChangeSideBar = document.querySelector('#iconUser')
            page.sideBar = document.querySelector('#side-bar')
        }

        function renderEvents(){
            getElements()
            //events.DOM('click', page.login, core.login)
            events.DOM('click', page.logout, core.logout)

            events.DOM('click', page.btChangeSideBar, ()=>{
                const type = page.sideBar.getAttribute('class')
                if(type == 'sideBar_reduce'){
                    page.sideBar.setAttribute('class', 'sideBar_normal')
                    
                }else{
                    page.sideBar.setAttribute('class', 'sideBar_reduce')
                }
                
            })

            events.on('loginButtons', (args)=>{
                console.log(args)
                if(args === 'login'){
                    page.login.style.display = 'none'
                    page.logout.style.display = 'inherit'
                    page.requisicoes.style.display = 'inherit'
                    page.estoque.style.display = 'inherit'
                }else{
                    page.login.style.display = 'inherit'
                    page.logout.style.display = 'none'
                    page.requisicoes.style.display = 'none'
                    page.estoque.style.display = 'none'
                }
            })

            home.btReqs = page.btReqs
            home.mainCase = page.mainCase
            home.login = page.login
        }
 
        function render(dados){
            const html = ejs.create({
                source: __dirname, 
                data: dados
            }) 
            app.innerHTML = html
            renderEvents()
        }

        const page = {
            render, 
        }
        return page 
    }

    function createLogicCore(){

        const optionsPage = {
            user: 'Adler Pelzer Group'
        }

        function init(){
            events.send('renderHome', optionsPage)
        }

        function update(){
            console.log('Update')
        }
        
        function logout(){
            if(window.ipc.sendSync('logout')){
                events.send('loginButtons', 'logout')
            }
        }

        return {
            init,
            update,
            logout,
        }

    }

    const page = createPage()
    const core  = createLogicCore()

    events.on('renderHome', (args)=>{
        page.render(args)
    })
    
    const home = {
        render: core.init,
        update: core.update,
    }
    
    core.init()

    return home
}

module.exports = createPageHome