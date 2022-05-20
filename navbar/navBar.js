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
            
            window.on('resize', ()=>{
                window.webContents.send('changeMaxIco')
            })
        }
    }
}

function render(window){
    const source = path.join(__dirname, '../src/icons')

    const buttons = {
        close: fs.readFileSync(path.join(source, './close.svg'), {encoding:'utf8', flag:'r'}) ,
        maximize: fs.readFileSync(path.join(source, './maximum.svg'), {encoding:'utf8', flag:'r'}) ,
        minimize: fs.readFileSync(path.join(source, './minimum.svg'), {encoding:'utf8', flag:'r'}) ,
        restore: fs.readFileSync(path.join(source, './restore.svg'), {encoding:'utf8', flag:'r'}) ,
    }

    function create(){
        
        console.log(buttons)

        const html = ejs.create(path.join(__dirname, 'navBar.ejs'), {
            close: buttons.close,
            maximize: 
            ipcRenderer.sendSync('isMaximized', {window})? 
            buttons.restore:
            buttons.maximize,

            minimize: buttons.minimize,
        })
        document.querySelector('.nav').innerHTML = html


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