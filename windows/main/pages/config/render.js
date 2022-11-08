    function createPage({eventEmitter, ejs, container, globalEvents}){

    function getElements(){
        const query = (id)=>document.querySelector(id)

        const elements = { 
            btDB: query('#btDB'),
            btPDF: query('#btPDF'),
            btImport: query('#btImport'),
            DBpath: query('#DBpath'),
            PDFpath: query('#PDFpath'),
            user: query('#upUser'),
            newpass: query('#NewPass'),
            pass: query('#Pass'),
            checkbox: query('#checkbox'),
            btSalvar: query('#btSalvar'),

        } 

        for(iten in elements){ 
            page[iten] = elements[iten]
        }
    }

    function renderEvents(){
        getElements()

        eventEmitter.DOM('change', page.checkbox, ()=>{
            if(page.checkbox.checked){
                page.pass.type = 'text'
                page.newpass.type = 'text'
            }else{
                page.pass.type = 'password'
                page.newpass.type = 'password'
            }
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