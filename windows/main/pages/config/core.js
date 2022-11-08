function createCore({window, container}){ 

    const { ipc, eventEmitterCreator, ejs, require,events} = window
    const eventEmitter = eventEmitterCreator()
    const globalEvents = events
    const page = require(__dirname, './render')({eventEmitter, ejs, container, globalEvents})

    function setLocalDB(){
        const source = ipc.sendSync('setExcelDBpath')
        console.log(source)
        if(source){
            page.DBpath.value = source
        } 
    }

    function updateUserData(){

        if(page.user.value === '' || page.newpass.value == '' || page.pass.value == ''){
            return ipc.sendSync('dialogError', 'Preencha todos os campos para Continuar!!')
        }

        if(ipc.sendSync('dialogQuestion',{
            msg: 'Atenção!!',
            detail: 'Realmente deseja modificar os dados de acesso? \n Esta ação não pode ser revertida!',
            window: 'main'
        })){

            const {error} = ipc.sendSync('teste', {
                email: page.user.value,
                newpass:  page.newpass.value,
                pass: page.pass.value,
            })

            console.log(error)

            if(!error){

                page.user.value = ''
                page.newpass.value = ''
                page.pass.value = ''
                
                ipc.sendSync('dialogSuccess', {
                    msg:'Usuario modificado dom sucesso!!!',
                    window: 'main'
                })

            }else{
                ipc.sendSync('dialogError', `${error}`)
            }
        }
    }

    function setLocalPDF(){
        const source = ipc.sendSync('setPDFpath')
        console.log(source)
        if(source){
            page.PDFpath.value = source
        } 
    }

    function importDados(){
        window.ipc.send('importDataBase')
    }

    function assignRoles(){
        eventEmitter.DOM('click', page.btDB, setLocalDB)
        eventEmitter.DOM('click', page.btPDF, setLocalPDF)
        eventEmitter.DOM('click', page.btImport, importDados)
        eventEmitter.DOM('click', page.btSalvar, updateUserData)
    }

    function toCharge(){
        ipc.sendSync('setPermissionScanner', false)
        eventEmitter.send('render', {})
        page.DBpath.value = ipc.sendSync('getExcelDBpath')
        page.PDFpath.value = ipc.sendSync('getPDFpath')
        assignRoles() 
    }

    globalEvents.on('toChargeConfig', toCharge)

    return {
        toCharge,
    }

} 

module.exports = createCore