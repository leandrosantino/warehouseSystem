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
            page.checkbox = document.querySelector('#checkbox')
            page.loginAlert = document.querySelector('#login-alert')
        }

        function renderEvents(){
            getElements()
            events.on('loginAlert', (arg)=>{
                page.loginAlert.innerHTML = arg
                setTimeout(()=>{
                    page.loginAlert.innerHTML = ''
                },1500)
            })
            events.DOM('change', page.checkbox, ()=>{
                if(page.checkbox.checked){
                    page.input_password.type = 'text'
                }else{
                    page.input_password.type = 'password'
                }
            })
            events.on('setfunc_btlogin', (login)=>{
                events.DOM('click', page.login, ()=>{
                    login({
                        user: page.input_user.value,
                        password: page.input_password.value,
                    })
                    page.input_user.value = ''
                    page.input_password.value = ''
                })
            })
        }

        function render(dados, container){
            const html = ejs.create({
                source: __dirname, 
                data: dados
            }) 
            container.innerHTML = html
            renderEvents()
        }

        const page = {
            render,
        }
        
        return page
    }

    function createLogicCore(){

        const optionsPage = {
            conected: false,
            user: 'Adler'
        }

        function init(args){
            events.send('renderLogin', args)
            events.send('setfunc_btlogin', login)
        }

        function update(){
            console.log('Update')
        }

        function login(login_date={
            user,
            password,
        }){
            const user = window.ipc.sendSync('login', login_date)
            if(user){
                if(login_date.password == user.password){
                    events.send('loginButtons', 'login')
                    console.log('teste',window.ipc.sendSync('getConectedUser'))
                    //events.send('OpenReqs')
                }else{
                    events.send('loginAlert', 'Usuário ou senha Incorretos!')
                }
            }else{
                events.send('loginAlert', 'Usuário ou senha Incorretos!')
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
    })

    return {
        render: core.init,
        update: core.update,
    }
}

module.exports = createPageHome