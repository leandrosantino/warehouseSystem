function createPageHome({window, container}){

    const events = window.eventEmitterCreator()
    const globalEvents = window.events

    function createPage(){
        const ejs = window.ejs 

        function getElements(){
            const elements = {
                voltar:{id:'#voltar'},
            }
            
            for(iten in elements){
                page[iten] = document.querySelector(elements[iten].id)
            }
        }

        function renderEvents(){
            getElements()
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
            page.render(data_Page, container)
        })
    
        const page = {
            render,
        }
        
        return page
    }

    function createCore(){

        const data_Page = {
            conected: false,
            user: 'leandro Santino'
        }

        function toCharge(){
            events.send('render', data_Page)
        }

        globalEvents.on('toChargeInventario', toCharge)

        function update(){
            console.log('Update')
        }

        return {
            toCharge,
            update,
        }

    }

    window.ipc.on('scanner', (event, args)=>{
        console.log(args)
    })

    window.ipc.on('updateHistorico', (event, args)=>{
        console.log(args)
    })

    const page = createPage()
    const core  = createCore()

    return {
        toCharge: core.toCharge,
        update: core.update,
    }
}

module.exports = createPageHome