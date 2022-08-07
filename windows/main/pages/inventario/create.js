function createPageHome({window, container}){

    const events = window.eventEmitterCreator()
    const globalEvents = window.events

    function createPage(){
        const ejs = window.ejs 

        function getElements(){
            const elements = {
                case:{id:'#case'},
            }
            
            for(iten in elements){
                page[iten] = document.querySelector(elements[iten].id)
            }
        }

        function renderEvents(){
            getElements()
            events.on('renderTable', (historico)=>{
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

        function toCharge(){
            window.ipc.sendSync('setPermissionScanner', true)
            events.send('render', {})

            let historico = window.ipc.sendSync('getHistorico')
            if(historico.length == 0){
                historico = [
                    ['', '', '', '', '', '', ''],
                ]
            }
            events.send('renderTable', historico)


            window.ipc.on('updateHistorico', (event, args)=>{
                events.send('renderTable', args)
            })
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




    const page = createPage()
    const core  = createCore()

    return {
        toCharge: core.toCharge,
        update: core.update,
    }
}

module.exports = createPageHome