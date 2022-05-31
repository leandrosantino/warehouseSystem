const { ipcMain, ipcRenderer } = require("electron")
const fs = require('fs')
const path = require("path")
const ejs = require('../modules/ejs.js')()

function main(windows){
    ipcMain.on('MaximizeNav', (event, args)=>{
        let window
        try{
            window = windows[args.window].get()
        }catch{
            window = windows[args.window]
        }

        if(window.isMaximized()){
            window.restore()
            event.returnValue = true
        }else{
            window.maximize()
            event.returnValue = false
        }
        
    })
    
    ipcMain.on('MinimizeNav', (events, args)=>{
        let window
        try{
            window = windows[args.window].get()
        }catch{
            window = windows[args.window]
        }
        window.minimize()
    })

    ipcMain.on('CloseNav', (events, args)=>{
        const window = windows[args.window]
        window.close()
    })

    ipcMain.on('isMaximized', (event, args)=>{
        let window
        try{
            window = windows[args.window].get()
        }catch{
            window = windows[args.window]
        }

        event.returnValue = window.isMaximized()
    })

    for (win in windows){
        if(win != 'createMain' && win != 'create'){
            let window
            try{
                window = windows[win].get()
            }catch{
                window = windows[win]
            }
            
            try{
                window.on('resize', ()=>{
                    window.webContents.send('changeMaxIco')
                })
            }catch{}
        }
    }
}

function render(window, type){
    const source = path.join(__dirname, './icons')


    const icons = ipcRenderer.sendSync('icons')

    const buttons = {
        close: icons.close,
        maximize: icons.maximize,
        minimize: icons.minimize,
        restore: icons.restore,
    }

    function create(){
        
        const html = ejs.create({
            source: __dirname,
            data: {
                close: buttons.close,
                maximize: type != 'modal'? buttons.maximize: false,
                minimize: type != 'modal'? buttons.minimize: false,
            }
        })
        document.querySelector('.nav').innerHTML = html

        setTimeout(()=>{
            changeIcon()
        }, 100)

    }

    function changeIcon(){
        const button = document.querySelector('#ico-max')
        if(ipcRenderer.sendSync('isMaximized', {window})){
            button.innerHTML = buttons.restore
        }else{
            button.innerHTML = buttons.maximize
        }
    }

    function maximize(){
        ipcRenderer.send('MaximizeNav', {window})
        changeIcon()
    }
    function minimize(){
        ipcRenderer.send('MinimizeNav', {window})
    }
    function close(){
        ipcRenderer.send('CloseNav', {window})
    }

    ipcRenderer.on('changeMaxIco', (events, args)=>{
        changeIcon()
    })

    return{
        maximize,
        minimize,
        close,
        create,
    }
}

module.exports = {
    main,
    render,
}