function createPageHome(window){

    const path = require('path')
    const events = window.events

    function createPage(){
        const ejs = window.ejs

        function getElements(){
            //page.btTeste = document.querySelector('#bt')
        }

        function render(dados){
            const html = ejs.create(path.join(__dirname, './home.ejs'), dados) 
            app.innerHTML = html
            getElements()
        }

        const page = {
            render,
        }
        
        return page
    }

    function createLogicCore(){

        function init(){
            console.log('init')
            events.send('render', {ano: '2021'})
        }

        function update(){
            console.log('Update')
        }

        return {
            init,
            update,
        }

    }

    const page = createPage()
    const logicCore  = createLogicCore()

    events.on('render', (args)=>{
        page.render(args)
    })

    return {
        render: logicCore.init,
        update: logicCore.update,
    }
}

module.exports = createPageHome