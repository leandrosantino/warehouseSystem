function createScreen(){

    const ejs = require('ejs')
    const fs = require('fs')
    const path = require('path')
    const sass = require('sass')
    const {ipcRenderer} = require('electron')

    function create(options = {
        source, 
        data,
    }){
 
        const scssFile = path.join(options.source, 'style.scss')
        const ejsFile = path.join(options.source, 'template.ejs')
        const icons = ipcRenderer.sendSync('icons')

        
        const style = sass.compile(scssFile)
        const linkCss = `
        <style>${style.css}</style>\n
        `
        const str = fs.readFileSync(ejsFile,'utf8')
        const template = ejs.compile(`${linkCss}${str}`);
        return template({
            icons,
            ...options.data,
        })
    }

    function createComponent({source, data, filename}){
        const ejsFile = path.join(source, filename)
        const icons = ipcRenderer.sendSync('icons')

        const str = fs.readFileSync(ejsFile,'utf8')
        const template = ejs.compile(str);
        return template({
            icons,
            ...data,
        })
    }

    function createString(str, data){
        const template = ejs.compile(`${linkCss}${str}`);
        return template(data)
    }

    return {
        create,
        createComponent,
    }
}

module.exports = createScreen