const {app, BrowserWindow, ipcMain} = require('electron')
const createBrowserWindows = require('./modules/createWindow.js')
const createDialog = require('./modules/dialog.js')
const navBar = require('./navbar/navBar.js')
const dialog = createDialog(require('electron').dialog)
const path = require('path')

const reload = 1
if(reload == 1){
    require("electron-reload")(__dirname, {
        electron: require(`${__dirname}/node_modules/electron`),
    });
}

const windows = createBrowserWindows({
    BrowserWindow,
    ipcMain,
    devTool: true,
    icon: path.join(__dirname, './src/icon.png')
})

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

function init(){
    windows.main.show()
    windows.main.maximize()

    windows.create('modal',{
        width: 1170, 
        height: 655,
        source: path.join(__dirname, './windows/modal'),
        parent: windows.main
    })

    navBar.main(windows)
    dialog.setIpc(ipcMain, windows)
}