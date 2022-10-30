const app = document.querySelector('#app')

const screens = {}

function main(){
    screens.home = window.pages.create('home', window)
    container = screens.home.mainCase

    screens.login = window.pages.create('login', {window, container})
    screens.inventario = window.pages.create('inventario', {window, container})
    screens.requisitar = window.pages.create('requisitar', {window, container})
    screens.config = window.pages.create('config', {window, container})

    //screens.inventario.toCharge()
}

window.events.on('resetWindow', main)
window.ipc.on('resetMain', (event, args)=>{
    main()
    try{screens[args].toCharge()}catch{}
    console.log('update')
})

setTimeout(main, 500)