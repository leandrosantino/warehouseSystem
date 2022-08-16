const {ipcRenderer}= require('electron')
const contextBridge = require('../../modules/globalPreload.js')({
    window: 'main',
})

contextBridge.addPages({
    'home': require('./pages/home/core.js'),
    'login': require('./pages/login/core.js'),
    'inventario': require('./pages/inventario/core.js')
})

contextBridge.init() 