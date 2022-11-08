const {ipcMain} = require('electron')
const fs = require('fs')
const path = require('path')

module.exports = ()=>{

    const source = path.join(__dirname, '../src/icons/')
    
    function readSvg(name){
        const option = {encoding:'utf8', flag:'r'}
        return fs.readFileSync(path.join(source, `./${name}.svg`), option)
    }
    
    const icons = {
        close: readSvg('close'),
        maximize: readSvg('maximum'),
        minimize: readSvg('minimum'),
        restore: readSvg('restore'),
        config: readSvg('config'),
        form: readSvg('form'),
        login : readSvg('login'),
        logout: readSvg('logout'),
        person: readSvg('person'),
        search: readSvg('search'),
        question: readSvg('question'),
        info: readSvg('info'),
        addForm: readSvg('addForm'),
        box: readSvg('box'),
        check: readSvg('check'),
        checkList: readSvg('checkList'),
        list: readSvg('list'),
        add: readSvg('add'),
        back: readSvg('back'),
        movement: readSvg('movement')
    }

    ipcMain.on('icons', (event, name)=>{
        event.returnValue = icons
    })

}