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
    }

    function toCharge(){
        setTimeout(()=>{
           ipc.sendSync('setPermissionScanner', false)
            eventEmitter.send('render', {})
            page.DBpath.value = ipc.sendSync('getExcelDBpath')
            page.PDFpath.value = ipc.sendSync('getPDFpath')
            assignRoles() 
        },0)
        
    }

    globalEvents.on('toChargeConfig', toCharge)

    return {
        toCharge,
    }

} 

module.exports = createCore