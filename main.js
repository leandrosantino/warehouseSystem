const {app, BrowserWindow, ipcMain, globalShortcut} = require('electron')
const path = require('path')
const createBrowserWindows = require('./modules/createWindow.js')
const isDev = require('electron-is-dev')

const emitters = {
    events: require('./modules/event.js')(),
    ipcMain
}

const navBar = require('./navbar/navBar.js')
const icons = require('./modules/readicons.js')()

const dialog        = require('./modules/dialog.js')(emitters)
const dataCore      = require('./database/dataCore')(emitters)
const userManege    = require('./modules/userManage.js')(emitters)
const scannerServer = require('./modules/scanerServer')(emitters)


if(false){
    require("electron-reload")(__dirname, {
        electron: require(`${__dirname}/node_modules/electron`),
    });
} 

const windows = createBrowserWindows({
    BrowserWindow,
    ipcMain,
    devTools: isDev,
    icon: path.join(__dirname, './src/icon.png')
})

app.disableHardwareAcceleration()

app.on('ready', ()=>{
    windows.createMain({
        width: 1000, 
        height: 655,
        source: path.join(__dirname, './windows/main'),
    }, init)
})
app.on('window-all-closed', ()=>{
    app.exit();
    app.quit();
}); 

!isDev && app.on('browser-window-focus', ()=>{
    globalShortcut.register('CommandOrControl+R', ()=>{})
    globalShortcut.register('F5', ()=>{})
})

async function init(){
    emitters.events.on('getWindows', (event, args)=>{
        event.returnValue = windows[args]
    })

    dialog.setIpc(windows)

    navBar.main(windows)

    await dataCore.init()?  
    true:console.log('erro in dataCore')
    
    scannerServer.init(windows)
    await scannerServer.start()
    userManege.init()

    windows.main.show()
    windows.main.maximize()
}