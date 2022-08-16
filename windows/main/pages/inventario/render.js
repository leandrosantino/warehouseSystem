function createPage({eventEmitter, ejs, container, globalEvents}){

    function getElements(){
        const elements = {
            case:{id:'#case'},
        }
        
        for(iten in elements){ 
            page[iten] = document.querySelector(elements[iten].id)
        }
    }

    function rendereventEmitter(){
        getElements()
        eventEmitter.on('renderTable', (historico)=>{
            page.case.innerHTML = ejs.createComponent({
                source: __dirname,
                filename: 'table.ejs',
                data: {
                    dados: historico
                }
            })
        })
    }

    function render(dados, container){
        const html = ejs.create({
            source: __dirname, 
            data: dados
        }) 
        container.innerHTML = html
        rendereventEmitter()
    }

    eventEmitter.on('render', (data_Page)=>{
        page.render(data_Page, container)
    })

    const page = {
        render,
    }
    
    return page

}

module.exports = createPage