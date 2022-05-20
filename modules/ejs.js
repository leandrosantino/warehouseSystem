function createScreen(){

    const ejs = require('ejs')
    const fs = require('fs')
    const Path = require('path')

    function create(path, data){
        const  str = fs.readFileSync(path,'utf8')
        const template = ejs.compile(str);
        return template(data)
    } 

    function createString(str, data){
        const template = ejs.compile(str);
        return template(data)
    }

    return {
        create,
        createString
    }
}

module.exports = createScreen