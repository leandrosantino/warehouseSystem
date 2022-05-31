module.exports = (args = {
    window
})=>{
    const {
        contextBridge,
        ipcRenderer,
    } = require("electron");
    const path = require('path')

    const event = require('./event.js')()
    const navBar = require('../navbar/navBar.js')
    const sass = require('sass')

    const bridges = {
        'ipc': {
            send(channel, args){
                ipcRenderer.sendSync(channel, args)
            },
            sendSync(channel, args){
                return ipcRenderer.sendSync(channel, args)
            },
            on(channel, func){
                ipcRenderer.on(channel, (event, ...args) => func(event, ...args));
            }
        },
        'events': event,
        'navBar': navBar.render(args.window, args.type),
        'pages': {create: createPage},
        'icons': ipcRenderer.sendSync('icons'),
        'ejs': require('./ejs.js')(),
        'setCss': ()=>{
            const source = path.join(__dirname, `../windows/${args.window}/index.scss`)
            const compile = sass.compile(source)
            document.head.innerHTML += `<style>${compile.css}</style>`
        },
    }

    function newBridge(name, object){
        bridges[name] = object
    }

    function init(){
        Object.keys(bridges).forEach(name => {
            contextBridge.exposeInMainWorld(name, bridges[name]);
        })
    }

    let pages = {}

    function createPage(page, event){
        return pages[page](event)
    }

    function addPages(pages_){
        pages = pages_
    }

    return {
        init,
        newBridge,
        addPages,
    }
}