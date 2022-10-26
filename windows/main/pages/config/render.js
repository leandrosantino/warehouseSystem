    function createPage({eventEmitter, ejs, container, globalEvents}){

    function getElements(){
        const query = (id)=>document.querySelector(id)

        const elements = {
            btDB: query('#btDB'),
            btPDF: query('#btPDF'),
            btImport: query('#btImport'),
            DBpath: query('#DBpath'),
            PDFpath: query('#PDFpath'),
        } 

        for(iten in elements){ 
            page[iten] = elements[iten]
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

    eventEmitter.on('render', (data_Page)=>{
        render(data_Page, container) 
    })

    const page = {
        render,
    }
    
    return page
}

module.exports = createPage