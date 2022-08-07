const app = document.querySelector('#app')

try{
    
    const home = window.pages.create('home', window)
    const container = home.mainCase

    const reqs = window.pages.create('requisitar', {window, container}) 
    const login = window.pages.create('login', {window, container})
    const inventario = window.pages.create('inventario', {window, container})

    function startScanner(){
        const resp = window.ipc.sendSync('scannerInit', 'main')
        if(resp){
            console.log('scanner server initializa')
        }else{
            console.log('device disconnected')
        }
        
    }
    setTimeout(startScanner, 0)

    //login.toCharge()
    //inventario.toCharge()

}catch(err){
    console.log('app-error', err)
}