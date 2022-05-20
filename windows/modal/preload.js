const contextBridge = require('../../modules/globalPreload.js')({
    window: 'modal'
})

contextBridge.addPages({
    'home': require('./pages/home/create.js')
})

contextBridge.init()