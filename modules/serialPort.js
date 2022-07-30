function createSerialModule(){
    const {SerialPort} = require('serialport')
    const {autoDetect} = require('@serialport/bindings-cpp')
    const bindings = autoDetect()
    

    async function selectPort(){

        const list = await bindings.list()
        let path = false

        list.forEach(port=>{
            const drive = port.friendlyName.split(' ')[1]
            const vId = port.vendorId
            const pId = port.productId

            const key = `${drive} ${vId} ${pId}`

            if(key == 'CH340 1A86 7523'){
                path = port.path
            }
            

        })

        return path
    }

    async function init () {
        try{
            
            const path = await selectPort()
            
            if(path){
                const port = new SerialPort({
                    path,
                    baudRate: 115200
                })
                return port
            }else{
                return false
            }
    
        }catch(err){
            return `${err}`
        }
    }


    return {
        init,
    }
}

module.exports = createSerialModule