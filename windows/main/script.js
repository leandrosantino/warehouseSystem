const app = document.querySelector('#app')

function closed(){
    const resp = window.ipc.sendSync('scannerclose')
    if(!resp){
        console.log('erro')
    }
}

try{
    
    const home = window.pages.create('home', window)
    const container = home.mainCase

    const reqs = window.pages.create('requisitar', {window, container}) 
    const login = window.pages.create('login', {window, container})

    window.ipc.on('scanner', (event, args)=>{
        console.log(args)
    })

    setTimeout(() => {
        const resp = window.ipc.sendSync('scannerInit', 'main')
        if(resp){
            console.log('scanner server initializa', resp)
        }else{
            console.log('device disconnectedds')
        }
    }, 0);

    login.toCharge()

}catch(err){
    console.log('app-error', err)
}