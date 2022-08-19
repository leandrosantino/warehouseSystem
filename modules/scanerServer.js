function createSerialMonitor({ipcMain, events}){

    const SerialPort = require('./serialPort')()
    let windows = null
    let port = null
    let produtos = {}
    let historico = []
    let permission = false

    const actions = {
        getData({code}){
            const produto = produtos[code]
            console.log(produto)
            if(produto){
                return toCode(produto)
            }else{
                return toCode({
                    status: 'erro',
                    message: 'item não encontrado'
                })
            }
        },
        sendUpdate({code, estoque, windowName}){
            if(permission){
                const item = produtos[code]
                if(item){
                    const diff  = item.estoque-estoque
                    const type = diff>0?'saída':'entrada' 

                    const date = new Date()
                    const meses = ['01','02','03','04','05','06','07','08','09','10','11','12']
                    
                    historico.unshift([
                        `${date.getDate()}/${meses[date.getMonth()]}/${date.getFullYear()}`,
                        code,
                        diff==0?'Inalterado':type,
                        Math.abs(diff),
                        item.descricao,
                        item.estoque,
                        estoque
                    ])
                    console.log(historico)

                    const resp = events.sendSync('updateHistorico', historico)

                    console.log(resp)

                    windows[windowName].webContents.send('updateHistorico', historico)
            
                    return toCode({
                        status: 'ok',
                        message: 'updade successfull'
                    })
                }else{
                    return toCode({
                        status: 'erro',
                        message: 'item não encontrado'
                    })
                }
            }else{
                return toCode({
                    status: 'erro',
                    message: 'O controlador não está em modo de inventário!'
                })
            }
        },
        scanner({code, windowName}){

            windows[windowName].webContents.send('scanner', code)

            return toCode({
                status: 'ok',
                message: 'Scanner successfull'
            })
        }
    }

    async function start(windowName){
        
        produtos = events.sendSync('getProducts') 
        historico = events.sendSync('getHistorico')
        close()
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
                        port.write(toCode({
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
            console.log('Scanner Closed')
            return true
        }catch(err){
            console.log(err)
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
        ipcMain.on('getHistorico', (event, args)=>{
            event.returnValue = historico
        })
        ipcMain.on('setPermissionScanner', (event, args)=>{
            permission = args
            event.returnValue = true
        })
    }

    function toCode(object){
        let str = ''
        const keys = Object.keys(object)
        keys.forEach((_key, index)=>{
            const vrg = keys.length == index+1?'':';'
            let key = _key.toLocaleUpperCase().split('')
            key = `${key[0]}${key[1]}`
            str+=`${key}:${object[_key]}${vrg}`
        })
        return str
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