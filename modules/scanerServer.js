function createSerialMonitor(ipcMain, excel){

    const SerialPort = require('./serialPort')()
    let windows = null
    let port = null
    let produtos = {}
    let historico = []

    const actions = {
        getData({code, windowName}){
            const produto = produtos[code]
            console.log(produto)
            if(produto){
                return JSON.stringify(produto)
            }else{
                return JSON.stringify({
                    status: 'erro',
                    message: 'item não encontrado'
                })
            }
        },
        sendUpdate({code, estoque, windowName}){
            const item = produtos[code]
            if(item){
                const diff  = item.estoque-estoque
                const type = diff>0?'saída':'entrada' 

                const date = new Date()
                const meses = ['01','02','03','04','05','06','07','08','09','10','11','12']
                
                historico.unshift([
                    `${date.getDate()}/${meses[date.getMonth()]}/${date.getFullYear()}`,
                    diff==0?'Inalterado':type,
                    Math.abs(diff),
                    item.descricao,
                    item.estoque,
                    estoque
                ])
                console.log(historico)

                const resp = excel.updateHistorico(historico)

                console.log(resp)

                windows[windowName].webContents.send('updateHistorico', historico)
        
                return JSON.stringify({
                    status: 'ok',
                    message: 'updade successfull'
                })
            }else{
                return JSON.stringify({
                    status: 'erro',
                    message: 'item não encontrado'
                })
            }
        },
        scanner({code, windowName}){

            windows[windowName].webContents.send('scanner', code)

            return JSON.stringify({
                status: 'ok',
                message: 'Scanner successfull'
            })
        }
    }

    async function start(windowName){
        
        produtos = excel.getProdutos()
        historico = excel.getHistorico()
        port = await SerialPort.init()

        if(port && !produtos.err){
            console.log('connected Scanner') 
            port.on('readable', ()=>{
                try{
                    let msg = toJson(String(port.read()))
                    console.log(String(port.read()), msg, 'teste')
                    const {type, params} = msg

                    params.windowName = windowName
                    
                    try{
                        const resp = actions[type](params)
                        console.log(resp)
                        port.write(resp)
                    }catch(err){
                        console.log(err)
                        port.write(JSON.stringify({
                            status: 'erro',
                            message: 'erro inesperado'
                        }))
                    }
                    
                }catch(err){
                    //console.log('erro', err)
                }       
            })
            port.on('close', resp=>{
                console.log('scanner closed')
                windows[windowName].webContents.send('scannerDisconnected')
            })
            console.log('successful connection!')
            return true
        }else{
            console.log('device disconnected')
            return false
        }
    }

    async function close(){
        try{
            port.close()
            return true
        }catch{
            return false
        }
    }

    function init(_windows){
        windows = _windows
        ipcMain.on('scannerInit', async (event, args)=>{
            event.returnValue = await start(args)
        })
        ipcMain.on('scannerclose', async (event, args)=>{
            event.returnValue = await close()
        })
    }

    function toJson(srt = ''){
        const data = {
            type: '',
            params:{}
        }
        const keys = {
            c: 'code',
            e: 'estoque',
            GD: 'getData',
            SU: 'sendUpdate',
            SC: 'scanner'
            
        }
        const params = srt.split(';')
    
        params.forEach(param=>{
            const val = param.split(':')
    
            if(val[0] == 't'){
                let resp = keys[val[1].replace('\r\n', '')]
                data.type = resp
            }else{
                let resp = val[1].replace('\r\n', '')
                if(val[0] == 'e'){resp = Number(resp)}
                data.params[keys[val[0]]] = resp
            }
        })
        return data
    }

    return {
        init,
        start,
        close
    }

}

module.exports = createSerialMonitor