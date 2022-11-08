    function createPage({eventEmitter, ejs, container, globalEvents}){

    function getElements(){
        const query = (id)=>document.querySelector(id)

        const elements = { 
            inputs: {
                data: query('#data'),
                tipo: query('#tipo'),
                produto: query('#material'),
                pesquisa: query('#pesquisa'),
                quant: query('#quant'),
            },
            buttons:{
                close_search: query('#close_search'),
                salvar: query('#btSalvar'),
            },
            case: {
                search: query('#search_case')
            }
        } 

        for(iten in elements){ 
            page[iten] = elements[iten]
        }
    }

    function renderEvents(){
        getElements()

        eventEmitter.on('renderListSearch', (args)=>{
            page.case.search.innerHTML = ejs.createComponent({
                source: __dirname,
                filename: 'searchTable.ejs',
                data: {
                    dados: args
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
        renderEvents()
    }

    eventEmitter.on('render', (data_Page)=>{
        render(data_Page, container) 
    })

    const page = {
        render,
        getElements,
    }
    
    return page
}

module.exports = createPage