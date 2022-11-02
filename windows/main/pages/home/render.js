function createPage({eventEmitter, ejs, globalEvents}){ 

    function getElements(){

        const elements = {
            login:{id:'#login'},
            logout:{id:'#logout'},
            requisitar:{id:'#requisitar'},  
            mainCase :{id:'#mainCase'},
            requests :{id:'#requests'},
            estoque:{id:'#estoque'},
            config:{id:'#config'},
            inventario:{id:'#inventario'},
            btChangeSideBar:{id:'#iconUser'},
            sideBar:{id:'#side-bar'},
            nameUser:{id:'#nameUser'},
            matricula: {id: '#matricula'},
            btEntrar: {id: '#btEntrar'}
        }
        
        for(iten in elements){
            page[iten] = document.querySelector(elements[iten].id)
        }

    }

    function renderEvents(){
        getElements()

        /*eventEmitter.DOM('click', page.btChangeSideBar, ()=>{
            const type = page.sideBar.getAttribute('class')
            if(type == 'sideBar_reduce'){
                page.sideBar.setAttribute('class', 'sideBar_normal')
                
            }else{
                page.sideBar.setAttribute('class', 'sideBar_reduce')
            }
            
        })*/

        globalEvents.on('setUserName', (name)=>{
            //page.nameUser.innerHTML = name
        })

        globalEvents.on('showAllowedScreens', (args)=>{
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
                page.config.style.display = 'none'
                page.logout.style.display = 'none'
                page.requisicoes.style.display = 'none'
                page.inventario.style.display = 'none'
            }
        })

    }

    function render(dados){
        const html = ejs.create({
            source: __dirname, 
            data: dados
        }) 
        app.innerHTML = html
        renderEvents()
    }

    eventEmitter.on('render', (args)=>{
        render(args)
    })

    const page = {
        render, 
    }

    return page 
}

module.exports = createPage