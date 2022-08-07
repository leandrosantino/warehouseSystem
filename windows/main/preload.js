const {ipcRenderer}= require('electron')
const contextBridge = require('../../modules/globalPreload.js')({
    window: 'main',
})

contextBridge.addPages({
    'home': require('./pages/home/create.js'),
    'requisitar': require('./pages/requisitar/create.js'),
    'login': require('./pages/login/create.js'),
    'inventario': require('./pages/inventario/create.js')
})

contextBridge.init()