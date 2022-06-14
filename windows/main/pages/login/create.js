function createPageHome({window, container}){

    const events = window.eventEmitterCreator()
    const globalEvents = window.events
    
    
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

        events.on('render', (data_Page)=>{
            render(data_Page, container) 
        })

        const page = {
            render,
        }
        
        return page
    }

    function createCore(){

        const data_Page = {
            conected: false,
            user: 'Adler'
        }

        function toCharge(){
            events.send('render', data_Page)
            events.send('setfunc_btlogin', login)
        }

        globalEvents.on('toChargeLogin', toCharge)

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
                    globalEvents.send('loginButtons', 'login')
                    globalEvents.send('setUserName', user.name)
                    globalEvents.send('toChargeRequisitar')
                }else{
                    events.send('loginAlert', 'Usuário ou senha Incorretos!')
                }
            }else{
                events.send('loginAlert', 'Usuário ou senha Incorretos!')
            }
        }

        return {
            toCharge,
            update,
            login,
        }

    }

    const page = createPage()
    const core  = createCore()

    return {
        toCharge: core.toCharge,
        update: core.update,
    }
}

module.exports = createPageHome