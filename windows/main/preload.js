const contextBridge = require('../../modules/globalPreload.js')({
    window: 'main',
})

contextBridge.addPages({
    'home': require('./pages/home/create.js'),
    'requisitar': require('./pages/requisitar/create.js'),
})

contextBridge.init()