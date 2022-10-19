const app = document.querySelector('#app')

const screens = {}

function main(){
    screens.home = window.pages.create('home', window)
    container = screens.home.mainCase

    screens.login = window.pages.create('login', {window, container})
    screens.inventario = window.pages.create('inventario', {window, container})
    screens.requisitar = window.pages.create('requisitar', {window, container})

    //requisitar.toCharge()
    //screens.login.toCharge()
}

window.ipc.on('resetMain', (event, args)=>{
    main()
    try{screens[args].toCharge()}catch{}
    console.log('update')
})

main()