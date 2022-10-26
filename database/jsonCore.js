module.exports = ()=>{
    
    const fs = require('fs')
    const path = require('path')
    const config = require('./src/config.json')

    const saveJson = ()=>fs.writeFileSync(path.join(__dirname, './src/config.json'), JSON.stringify(config, {}, 4))

    function setExcelDBpath(directory){
        config.ExcelDBpath = path.normalize(directory)
        saveJson()
    }
    const getExcelDBpath = ()=>{return config.ExcelDBpath}

    function setPDFpath(directory){
        config.PDFpath = path.normalize(directory)
        saveJson()
    }
    const getPDFpath = ()=>{return config.PDFpath}

    function getRequestNumber(){
        config.requestNumber += 1
        saveJson()
        return config.requestNumber
    }
 
    return {
        setExcelDBpath,
        getExcelDBpath,
        getRequestNumber,
        setPDFpath,
        getPDFpath,
    }
}