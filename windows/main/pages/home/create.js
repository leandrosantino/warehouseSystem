function createPageHome(window){

    const path = require('path')
    const events = window.events
    const fs = require('fs')

    function createPage(){
        const ejs = window.ejs 

        const icons = window.icons

        function getElements(){
            page.login = document.querySelector('#login')
            page.logout = document.querySelector('#logout')
        }

        function render(dados){
            const html = ejs.create(path.join(__dirname, './home.ejs'), {...dados, icons: icons}) 
            app.innerHTML = html
            getElements()
        }

        const page = {
            render,
        }
        
        return page
    }

    function createLogicCore(){

        const optionsPage = {
            conected: false,
            user: 'leandro Santino'
        }

        function init(){
            console.log('init')
            events.send('render', optionsPage)
        }

        function update(){
            console.log('Update')
        }

        function login(){
            optionsPage.conected = true
            events.send('render', optionsPage)
            events.send('loginButtons', 'login')
        }
        
        function logout(){
            optionsPage.conected = false
            events.send('render', optionsPage)
            events.send('loginButtons', 'logout')
        }

        return {
            init,
            update,
            login,
            logout,
        }

    }

    const page = createPage()
    const core  = createLogicCore()

    events.on('render', (args)=>{
        page.render(args)
        main()
    })

    function main(){
        events.DOM('click', page.login, core.login)
        events.DOM('click', page.logout, core.logout)

        events.on('loginButtons', (args)=>{
            console.log(args)
            if(args === 'login'){
                page.login.style.display = 'none'
                page.logout.style.display = 'inherit'
            }else{
                page.login.style.display = 'inherit'
                page.logout.style.display = 'none'
            }
        })
    }

    return {
        render: core.init,
        update: core.update,
    }
}

module.exports = createPageHome