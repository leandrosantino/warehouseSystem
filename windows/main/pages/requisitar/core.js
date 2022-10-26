function createCore({window, container}){

    const { ipc, eventEmitterCreator, ejs, require, events} = window
    const eventEmitter = eventEmitterCreator()
    const globalEvents = events
    
    const page = require(__dirname, './render')({eventEmitter, ejs, container, globalEvents})
    let maquinas, products, colaboradores

    const requisição = {
        requisitante: '',
        matricula: '',
        natureza: '',
        tag: '',
    } 

    let selected_item = ''
    const listItems = {}
    const loadItemList = ()=>eventEmitter.send('renderListItem', listItems)
    const error = err => ipc.sendSync('dialogError', err)
    
    function loadSearch(){
        const filtro = []
        const input = page.inputs.pesquisa.value.toLocaleUpperCase()
        for(codigo in products){   
            const iten = products[codigo]
            const searchStr = `${codigo}${iten.nome}${iten.endereco}`.toLocaleUpperCase()
            const respSearch = searchStr.search(input)

            if(respSearch >= 0 || input == ''){
                filtro.push({...iten, func: `onclick="screens.requisitar.selectIten('${codigo}')"`})
            }
        }
        eventEmitter.send('renderListSearch', filtro)
        page.getElements(page)
    }

    const updateQuantItems = ()=> page.quant_items.innerHTML = Object.keys(listItems).length
    
    function adicionarItens(){
        if(Object.keys(listItems).length < 15){
            if(selected_item != ''){
                
                const itemBase = products[selected_item]
                const quantR = Number(page.inputs.quant_Req.value)
                const quantE = Number(page.inputs.quant_Ent.value)

                if(!(itemBase.quant < quantE)){
                    listItems[selected_item] = itemBase
                    const item = listItems[selected_item]
                    item.quantR = quantR 
                    item.quantE = quantE 
                    item.func = `onclick="screens.requisitar.selectIten('${selected_item}', 1)"`
                    page.inputs.produto.value = ''
                }else{
                    error('Estoque Insuficiente!!')
                }

                updateQuantItems()
                loadItemList()
            }
        }else{
            error('Quantidade máxima de Itens atingida!')
        }
    }

    function removeSpaceStr(str){
        let resp = ''   
        const array = str.split('')
        array.forEach(char=>{
            if(char != ' '){
                resp += char
            }
        })
        return resp
    }

    ipc.on('scanner', (event, args)=>{
        const {quant} = args
        const code = removeSpaceStr(args.code)
        console.log(args)
        const itemBase = products[code]

        if(!(itemBase.quant < quant)){
            listItems[code] = itemBase
            const item = listItems[code]
            item.quantR = quant
            item.quantE = quant
            item.func = `onclick="screens.requisitar.selectIten('${code}', 1)"`
            page.inputs.produto.value = ''
        }else{
            error('Estoque Insuficiente!!')
        }
        updateQuantItems()
        loadItemList()
    })

    function deleteItems(){
        delete listItems[selected_item]
        page.inputs.produto.value = ''
        selected_item = ''
        updateQuantItems()
        loadItemList()
    }

    function selectIten(id, type){
        selected_item = id
        page.inputs.produto.value = products[id].nome
        if(type){
            eventEmitter.send('emphasisItem', selected_item)
        }
    }

    function tagPopulate(){
        let html = ''
        maquinas.forEach(tag=>{
            html += `<option value="${tag}">${tag}</option>`
        }) 
        page.inputs.tag.innerHTML = html
        page.inputs.tag.value = ''
    }

    function defineNatureza(){
        let resp = false
        const names = ['Quebra','Preventiva','Melhoria','Segurança','Outros',]
        page.inputs.natureza.forEach((item, index)=>{
            if(item.checked){
                resp = names[index]
            }
        })
        requisição.natureza = resp
        return resp
    }

    const updateNatureza = ()=>page.labels.natureza.innerHTML = defineNatureza()
    
    function updateTag(){
        requisição.tag = page.inputs.tag.value
        page.labels.maquina.innerHTML = requisição.tag
    }

    function updateRequisitante(){
        const mat = page.inputs.matricula.value
        const requisitante = colaboradores[mat]
        requisição.matricula = mat
        if(requisitante){
            requisição.requisitante = requisitante
            page.labels.requisitante.style.color = '#000'
            page.labels.requisitante.innerHTML = requisição.requisitante
        }else{
            requisição.requisitante = false
            page.labels.requisitante.style.color = '#DD1C1A'
            page.labels.requisitante.innerHTML = 'Matricula não cadastrada!'
        }
        
    }

    function clear(){
        delete requisição.itens
        for(key in requisição){
            requisição[key] = ''
        }
        for(key in listItems){
            delete listItems[key]
        }
        page.inputs.pesquisa.value = ''
        page.inputs.matricula.value = ''
        page.inputs.tag.value = ''
        page.inputs.produto.value = ''
        page.inputs.quant_Req.value = 1
        page.inputs.quant_Ent.value = 1
        page.labels.requisitante.innerHTML = ''
        page.labels.natureza.innerHTML = ''
        page.labels.maquina.innerHTML = ''
        loadItemList()
        loadSearch()
        updateQuantItems()
    }

    function cancelar(){
        clear()
    }
      
    function concluir(){
        requisição.itens = listItems

        if(requisição.requisitante){
            if(
                requisição.requisitante != '' &&
                requisição.matricula != '' &&
                requisição.tag != '' &&
                Object.keys(requisição.itens).length != 0 
            ){  
                if(ipc.sendSync('dialogQuestion',{
                    msg: 'Atenção!!',
                    detail: 'Realmente deseja concluir?',
                    window: 'main'
                })){
                    if(ipc.sendSync('registerRequisição', requisição)){
                        clear()
                        ipc.sendSync('dialogSuccess', {
                            msg:'Requisição registrada com sucesso!!!',
                            window: 'main'
                        })
                    }else{
                        error('Erro inesperado! reinicie o programa e tente novamente!')
                    }
                }
            }else{
                error('Preencha todos os campos para continuar!')
            }
        }else{
            error('Matricula não cadastrada!')
        }
    }
 
    function assignRoles(){ 
        eventEmitter.DOM('click', page.buttons.close_search, ()=>{
            page.inputs.pesquisa.value = ''
            loadSearch()
        })
        eventEmitter.DOM('click', page.buttons.delete_iten, deleteItems)
        eventEmitter.DOM('click', page.buttons.adicionar, adicionarItens)
        eventEmitter.DOM('keyup', page.inputs.pesquisa, loadSearch)
        eventEmitter.DOM('click', page.buttons.concluir, concluir)
        eventEmitter.DOM('change', page.inputs.tag, updateTag)
        eventEmitter.DOM('change', page.inputs.matricula, updateRequisitante)
        eventEmitter.DOM('click', page.buttons.cancelar, cancelar)
        for(index in page.buttons.natureza){
            if(!isNaN(index)){
                eventEmitter.DOM('click', page.buttons.natureza[index], updateNatureza)
            }
        }
    }

    function toCharge(){
        setTimeout(()=>{},0)
        ipc.sendSync('setPermissionScanner', false)
        products = ipc.sendSync('getRequestsProducts')   
        maquinas = ipc.sendSync('getMaquinas')
        colaboradores = ipc.sendSync('getColaboradores')
        eventEmitter.send('render', {})
        updateNatureza()
        loadSearch()
        tagPopulate()
        updateQuantItems()
        assignRoles()
        console.log(products)
    }
    

    globalEvents.on('toChargeRequisitar', toCharge)


    return {
        toCharge,
        selectIten,
        selected_item
    }

}

module.exports = createCore