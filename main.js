const {app, BrowserWindow, ipcMain} = require('electron')
const path = require('path')

const createBrowserWindows = require('./modules/createWindow.js')

const events = require('./modules/event.js')()
const dialog = require('./modules/dialog.js')(events)
const navBar = require('./navbar/navBar.js')
const icons = require('./modules/readicons.js')()
const userManege = require('./modules/userManage.js')(ipcMain, events)
const dataBase = require('./database/create')()
const serialPort = require('./modules/sereialPort')(ipcMain, dataBase)
const excel = require('./modules/excel')(ipcMain, dataBase)

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

async function init(){

    const resp = await dataBase.init()
    if(resp){
        console.log('erro')
    }

    windows.main.show()
    windows.main.maximize()
    navBar.main(windows)
    dialog.setIpc(windows)
    serialPort.init()
 
    excel.populateDB()

    userManege.init()
}