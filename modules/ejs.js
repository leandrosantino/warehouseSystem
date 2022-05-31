function createScreen(){

    const ejs = require('ejs')
    const fs = require('fs')
    const path = require('path')
    const sass = require('sass')

    function create(options = {
        source, 
        data,
    }){

        const scssFile = path.join(options.source, 'style.scss')
        const ejsFile = path.join(options.source, 'template.ejs')

        const style = sass.compile(scssFile)
        const linkCss = `
            <style>${style.css}</style>\n
        `
        const str = fs.readFileSync(ejsFile,'utf8')
        const template = ejs.compile(`${linkCss}${str}`);
        return template(options.data)
    } 

    function createString(str, data){
        const template = ejs.compile(`${linkCss}${str}`);
        return template(data)
    }

    return {
        create,
    }
}

module.exports = createScreen