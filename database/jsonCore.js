module.exports = ()=>{
    
    const fs = require('fs')
    const path = require('path')
    const config = require('./src/config.json')

    function setExcelDBpath(directory){
        config.ExcelDBpath = path.normalize(directory)
        fs.writeFileSync(path.join(__dirname, './src/config.json'), JSON.stringify(config, {}, 4))
    }
    const getExcelDBpath = ()=>{return config.ExcelDBpath}
 
    return {
        maquinas: config.maquinas,
        setExcelDBpath,
        getExcelDBpath,
    }
}