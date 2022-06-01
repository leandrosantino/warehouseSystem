function createPageHome(window){

    const path = require('path')
    const events = window.events
    const fs = require('fs')

    function createPage(){
        const ejs = window.ejs 

        const icons = window.icons

        function getElements(){
            page.voltar = document.querySelector('#voltar')
        }

        function render(dados, container){
            const html = ejs.create({
                source: __dirname, 
                data: {...dados, icons: icons}
            }) 
            container.innerHTML = html
            getElements()
        }

        const page = {
            render,
        }
        
        return page
    }

    function createLogicCore(){

        const optionsPage = {
            conected: false,
            user: 'leandro Santino'
        }

        function init(){
            console.log('init')
            //events.send('render2', optionsPage)
        }

        function update(){
            console.log('Update')
        }


        return {
            init,
            update,
            optionsPage
        }

    }

    const page = createPage()
    const core  = createLogicCore()

    events.on('renderReqs', (args)=>{
        page.render(core.optionsPage, args.container)
        main()
    })

    function main(){
        
    }

    return {
        render: core.init,
        update: core.update,
    }
}

module.exports = createPageHome