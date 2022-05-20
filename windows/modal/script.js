const app = document.querySelector('#app')

try{
    
    const home = window.pages.create('home', window)
    home.render()

}catch(err){
    console.log('app-error', err)
}