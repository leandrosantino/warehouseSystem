const app = document.querySelector('#app')

try{
    
    const home = window.pages.create('home', window)
    const reqs = window.pages.create('requisitar', window)

    window.events.DOM('click', home.btReqs, ()=>{
        window.events.send('renderReqs', {
            container: home.mainCase
        })

    })

    

}catch(err){
    console.log('app-error', err)
}