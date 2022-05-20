const contextBridge = require('../../modules/globalPreload.js')({
    window: 'main'
})

contextBridge.addPages({
    'home': require('./pages/home/create.js')
})

contextBridge.init()