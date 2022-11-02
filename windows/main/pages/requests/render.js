function createPage({eventEmitter, ejs, container, globalEvents}){

    function getElements(){
        const query = (id)=>document.querySelector(id)

        const elements = {
            inputs: {
                search: query('#pesquisa'),
                origem: query('#origem'),
                class: query('#class'),
                dia: query('#dia'),
                mes: query('#mes'),
                ano: query('#ano'),
                tipo: query('#tipo')
            },
            buttons: {
                closeSearch: query('#close_search'),
                filter: query('#filter')
            },
            case: query('#caseTable')
        }

        for(iten in elements){ 
            page[iten] = elements[iten]
        }
    }

    function setYears(data){
        const years = {}
        const now = new Date().getFullYear()
        data.forEach(item=>{
            years[String(item.ano)] = ''
        })
        page.inputs.ano.innerHTML = ''
        Object.keys(years).forEach(key=>{
            let select = ''
            if(Number(key) == now){
                select = 'selected'
            }
            page.inputs.ano.innerHTML += `<option value="${key}" ${select}>${key}</option>`
        })
    }

    function setMonths(data){
        const name = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
        const months = {}
        const now = new Date().getMonth()
        data.forEach(item=>{
            months[String(item.mes)] = ''
        })
        page.inputs.mes.innerHTML = ''
        Object.keys(months).forEach(key=>{
            let select = ''
            if(Number(key) == now){
                select = 'selected'
            }
            page.inputs.mes.innerHTML += `<option value="${key}" ${select}>${name[key]}</option>`
        })
    }

    function rendereventEmitter(){
        getElements()
        eventEmitter.on('renderTable', (data)=>{ 
            setYears(data.dados)   
            setMonths(data.dados)
            page.case.innerHTML = ejs.createComponent({
                source: __dirname,
                filename: 'table.ejs',
                data: data,
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

/*

{
                        'ALM00001':{
                            data:'21/02/2022',
                            descricao: 'Sensor vsduhavpiosd vasdhv sd',
                            endereco: 'A2302',
                            tipo:'Entrada',
                            quantidade: 1,
                            atual: 3,
                            anterior: 2,
                            origem: 'Inventário',
                            maquina: 'M22',
                            matricula: '792'
                        }
                    }

*/