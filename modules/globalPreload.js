module.exports = (args = {
    window
})=>{
    const {
        contextBridge,
        ipcRenderer,
    } = require("electron");

    const event = require('./event.js')()
    const ejs = require('./ejs.js')()
    const navBar = require('../navbar/navBar.js')

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
        'ejs': ejs,
        'navBar': navBar.render(args.window, args.type),
        'pages': {create: createPage}
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