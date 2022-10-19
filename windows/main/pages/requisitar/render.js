function createPage({eventEmitter, ejs, container, globalEvents}){

    function getElements(page){

        const query = (id)=>document.querySelector(id)

        const elements = {
            case:{
                list: query('#caselist'),
                search: query('#search_case'),
            },
            inputs: {
                matricula: query('#matricula'),
                tag: query('#tag'),
                produto: query('#produto'),
                quant_Req: query('#requisitada'),
                quant_Ent: query('#entregue'),
                pesquisa: query('#pesquisa'),
                natureza: [
                    query('#quebra'),
                    query('#preventiva'), 
                    query('#melhoria'),
                    query('#seguranca'),
                    query('#outros')
                ],
            },                   
            buttons: {
                adicionar: query('#adicionar'),
                close_search: query('#close_search'),
                iten_list: query('#body'),
                delete_iten: query('#deleteItem'),
                concluir: query('#concluir'),
                cancelar: query('#cancelar'),
                natureza: document.getElementsByName('natureza')
            },
            labels: {
                requisitante: query('#requisitante'),
                natureza: query('#natureza'),
                maquina: query('#maquina'),
            },
            quant_items: query('#quantItems'),
            
        } 
        
        for(iten in elements){ 
            page[iten] = elements[iten]
        }
    }

    function rendereventEmitter(){
        getElements(page) 

        eventEmitter.on('renderListSearch', (args)=>{
            page.case.search.innerHTML = ejs.createComponent({
                source: __dirname,
                filename: 'searchTable.ejs',
                data: {
                    dados: args
                }
            })
        })

        eventEmitter.on('renderListItem', (args)=>{
            page.case.list.innerHTML = ejs.createComponent({
                source: __dirname,
                filename: 'listTable.ejs',
                data: {
                    dados: args
                }
            })
        })

        eventEmitter.on('emphasisItem', (args)=>{
            const items = document.getElementsByClassName('body')
            for(index in items){
                if(!isNaN(index)){
                    items[index].style.backgroundColor = '#ffffff'
                }
            }
            if(items.length > 0 ){
                document.querySelector(`#${args}`).style.backgroundColor = '#d4dcdd'
            }
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
        getElements,
    }
    
    return page

}

module.exports = createPage