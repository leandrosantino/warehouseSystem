    function createPage({eventEmitter, ejs, container, globalEvents}){

    function getElements(){
        page.login = document.querySelector('#btLogin')
        page.input_user = document.querySelector('#input-user')
        page.input_password = document.querySelector('#input-senha')
        page.checkbox = document.querySelector('#checkbox')
        page.loginAlert = document.querySelector('#login-alert')
        page.voltar = document.querySelector('#voltar')
    }

    function renderEvents(){
        getElements()
        page.input_user.focus()

        eventEmitter.on('loginAlert', (arg)=>{
            page.loginAlert.innerHTML = arg
            setTimeout(()=>{
                page.loginAlert.innerHTML = ''
            },1500)
        })
        eventEmitter.DOM('change', page.checkbox, ()=>{
            if(page.checkbox.checked){
                page.input_password.type = 'text'
            }else{
                page.input_password.type = 'password'
            }
        }) 
        eventEmitter.on('setfunc_btlogin', (login)=>{
            
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

    eventEmitter.on('render', (data_Page)=>{
        render(data_Page, container) 
    })

    const page = {
        render,
    }
    
    return page
}

module.exports = createPage