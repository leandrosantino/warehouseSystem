function createPageHome(window){

    const events = window.eventEmitterCreator()
    const globalEvents = window.events

    function createPage(){ 
        const ejs = window.ejs 

        function getElements(){
 
            const elements = {
                login:{id:'#login'},
                logout:{id:'#logout'},
                requisitar:{id:'#requisitar'},
                mainCase :{id:'#mainCase'},
                requisicoes :{id:'#requisicoes'},
                estoque:{id:'#estoque'},
                inventario:{id:'#inventario'},
                btChangeSideBar:{id:'#iconUser'},
                sideBar:{id:'#side-bar'},
                nameUser:{id:'#nameUser'},
            }
            
            for(iten in elements){
                page[iten] = document.querySelector(elements[iten].id)
            }

        }

        function renderEvents(){
            getElements()

            events.DOM('click', page.login, ()=>{
                globalEvents.send('toChargeLogin')
            })

            events.DOM('click', page.requisitar, ()=>{ 
                globalEvents.send('toChargeRequisitar')
            })

            events.DOM('click', page.logout, core.logout)

            events.DOM('click', page.btChangeSideBar, ()=>{
                const type = page.sideBar.getAttribute('class')
                if(type == 'sideBar_reduce'){
                    page.sideBar.setAttribute('class', 'sideBar_normal')
                    
                }else{
                    page.sideBar.setAttribute('class', 'sideBar_reduce')
                }
                
            })

            globalEvents.on('setUserName', (name)=>{
                page.nameUser.innerHTML = name
            })

            globalEvents.on('loginButtons', (args)=>{
                if(args.type === 'login'){
                    page.login.style.display = 'none'
                    page.logout.style.display = 'inherit'
                    args.permissions.forEach(item=>{
                        try{
                            page[item].style.display = 'inherit'
                        }catch{}
                    })

                }else{
                    page.login.style.display = 'inherit'
                    page.logout.style.display = 'none'
                    page.requisicoes.style.display = 'none'
                    page.inventario.style.display = 'none'
                    page.estoque.style.display = 'none'
                }
            })

            home.mainCase = page.mainCase
        }
 
        function render(dados){
            const html = ejs.create({
                source: __dirname, 
                data: dados
            }) 
            app.innerHTML = html
            renderEvents()
        }

        events.on('render', (args)=>{
            render(args)
        })

        const page = {
            render, 
        }
        return page 
    }

    function createLogicCore(){

        const optionsPage = {
            user: 'Adler Pelzer Group'
        }

        function toCharge(){
            events.send('render', optionsPage)
        }

        function update(){
            console.log('Update')
        }
        
        function logout(){
            if(window.ipc.sendSync('logout')){
                globalEvents.send('loginButtons', 'logout')
                globalEvents.send('toChargeLogin')
                globalEvents.send('setUserName', optionsPage.user)
            }
        }

        return {
            toCharge,
            update,
            logout,
        }

    }

    const page = createPage()
    const core  = createLogicCore()
    
    const home = {
        update: core.update,
    }
    
    core.toCharge()

    return home
}

module.exports = createPageHome