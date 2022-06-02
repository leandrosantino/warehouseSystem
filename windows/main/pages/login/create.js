function createPageHome(window){

    const path = require('path')
    const events = window.events
    const fs = require('fs')

    function createPage(){
        const ejs = window.ejs 

        function getElements(){
            page.login = document.querySelector('#btLogin')
            page.input_user = document.querySelector('#input-user')
            page.input_password = document.querySelector('#input-senha')
        }

        function render(dados, container){
            const html = ejs.create({
                source: __dirname, 
                data: dados
            }) 
            container.innerHTML = html
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

        const users = {
            'leandro_santino': {
                password: 'alpha45c'
            }
        }

        function init(args){
            console.log('init')
            events.send('renderLogin', args)
        }

        function update(){
            console.log('Update')
        }

        function login(login_date={
            user,
            password,
        }){
            const user = users[login_date.user]
            console.log(user, login_date)
            if(user){
                if(login_date.password == user.password){
                    events.send('loginButtons', 'login')
                }else{
                    console.log('senha Errada')
                }
            }else{
                console.log('Usuário não encontradao')
            }
        }

        return {
            init,
            update,
            login,
            optionsPage,
        }

    }

    const page = createPage()
    const core  = createLogicCore()

    events.on('renderLogin', (args)=>{
        page.render(core.optionsPage, args.container)
        main()
    })

    function main(){
        events.DOM('click', page.login, ()=>{
            core.login({
                user: page.input_user.value,
                password: page.input_password.value
            })
        })
    }

    return {
        render: core.init,
        update: core.update,
    }
}

module.exports = createPageHome