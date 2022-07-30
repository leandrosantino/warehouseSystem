function createSerialMonitor(ipcMain, dataBase){

    const {SerialPort} = require('serialport')
    let windows = null
    let port = null

    const eventsListnner = {
        scanner({windowName, msg}){
            windows[windowName].webContents.send('updateSerial', msg)
        },
        updateDB({msg}){
            
        },
    }

    function start({params, eventChanel}){

        /*{
            eventChanel,
            params: {
                windowName,
                portName
            }
        }*/

        const {windowName, portName} = params

        port = new SerialPort({
            baudRate: 115200,
            path: portName,
        })

        port.on('readable', message=>{

            const msg = String(message)

            console.log(`menssagem recebida ${msg}`)

            eventsListnner[eventChanel]({
                windowName: windowName? windowName: '',
                msg
            })

            port.write('', 'utf-8', resp =>{
                console.log('messagen devolvida', resp)
            })

        })

    }

    function close(){
        port.destroy()
    }

    function init(_windows){
        windows = _windows
        
        ipcMain.on('serialPortInit', (event, args)=>{
            start(args)
            event.returnValue = true
        })

        ipcMain.on('closeSerialPort', (event, args)=>{
            close()
            event.returnValue = true
        })
    }

    return {
        init,
        start,
        close
    }

}

module.exports = createSerialMonitor