function createCore({window, container}){ 

    const { ipc, eventEmitterCreator, ejs, require,events} = window
    const eventEmitter = eventEmitterCreator()
    const globalEvents = events
    const page = require(__dirname, './render')({eventEmitter, ejs, container, globalEvents})

    let products = {}
    let selected_item = ''


    const isDate = (strDate)=>{
        const date = strDate.split('/');
        const dia = Number(date[0])
        const mes = Number(date[1])-1
        const ano = Number(date[2])

        let resp = new Date(ano, mes, dia)
        if(resp == 'Invalid Date' || mes < 0 || mes > 11 || ano < 1900 || dia > 31 || dia < 1){
            resp = false
        }else{
            resp = true
        }
        return resp
    }

    function assignRoles(){

        eventEmitter.DOM('click', page.buttons.close_search, ()=>{
            page.inputs.pesquisa.value = ''
            loadSearch()
        })

        eventEmitter.DOM('keyup', page.inputs.pesquisa, loadSearch)

        eventEmitter.DOM('click', page.buttons.salvar, salvar)

        eventEmitter.DOM('keyup', page.inputs.data, ()=>{
            const input = page.inputs.data
            const txt = input.value
            if(txt.length == 2){
                input.value =  txt + '/'
            };
            if(txt.length == 5){
                input.value = txt + '/'
            };
        })
    }

    const error = err => ipc.sendSync('dialogError', err)

    function salvar(){
        const {data, tipo, produto, quant} = page.inputs

        if(!isDate(data.value)){
            error('Data Inválida!')
            return
        }

        if(
            data.value == '' || 
            tipo.value == '' || 
            produto.value == '' || 
            quant.value < 1 || 
            selected_item == '' 
        
        ){
            error('Preencha todos os campos para prosseguir!')
            return
        }

        if(tipo.value == 'Saída' && products[selected_item].quant < Number(quant.value)){
            error('Estoque insuficiente!')
            return
        }
        
        if(ipc.sendSync('dialogQuestion',{
            msg: 'Atenção!!',
            detail: 'Realmente deseja salvar?',
            window: 'main'
        })){
            const resp = ipc.sendSync('setMoviments', {
                data: data.value,
                codigo: selected_item,
                tipo: tipo.value,
                quant: quant.value,
            })

            if(resp){
                ipc.sendSync('dialogSuccess', {
                    msg:'Salvo com sucesso!!!',
                    window: 'main'
                })

                data.value = ''
                tipo.value = ''
                produto.value = ''
                quant.value = ''
                selected_item = ''
                
                return   
            }

            error('Falha ao salvar movimentação!!')

        }
    }

    function selectIten(id){
        selected_item = id
        page.inputs.produto.value = products[id].nome
    }

    function formatProducts(products){
        const products2 = {}
        Object.keys(products).forEach(key=>{
            products2[key]={
                nome: products[key].descricao,
                endereco: products[key].endereco,
                quant:  products[key].estoque,
            }
        })
        return products2
    }

    function loadSearch(){
        const filtro = []
        const input = page.inputs.pesquisa.value.toLocaleUpperCase()
        for(codigo in products){   
            const iten = products[codigo]
            const searchStr = `${codigo}${iten.nome}${iten.endereco}`.toLocaleUpperCase()
            const respSearch = searchStr.search(input)

            if(respSearch >= 0 || input == ''){
                filtro.push({...iten, func: `onclick="screens.moviments.selectIten('${codigo}')"`})
            }
        }
        eventEmitter.send('renderListSearch', filtro)
        page.getElements(page)
    }

    function setData(){
        products = formatProducts(ipc.sendSync('getProducts')) 
        loadSearch()

        const now = new Date()
        let day = String(now.getDate())
        if(day.length < 2){
            day = `0${day}`
        }
        page.inputs.data.value = `${day}/${now.getMonth()+1}/${now.getFullYear()}`

    }

    function toCharge(){
        ipc.sendSync('setPermissionScanner', false)
        eventEmitter.send('render', {})
        setData()
        assignRoles() 
    }

    globalEvents.on('toChargeMoviments', toCharge)

    return {
        toCharge,
        selectIten,
        setData,
    }

} 

module.exports = createCore