const {ipcRenderer}= require('electron')
const contextBridge = require('../../modules/globalPreload.js')({
    window: 'main',
})

console.log(ipcRenderer.sendSync('userManage'))

contextBridge.newBridge('userManage', ipcRenderer.sendSync('userManage'))

contextBridge.addPages({
    'home': require('./pages/home/create.js'),
    'requisitar': require('./pages/requisitar/create.js'),
    'login': require('./pages/login/create.js'),
})

contextBridge.init()