const app = document.querySelector('#app')


const home = window.pages.create('home', window)
const container = home.mainCase

const login = window.pages.create('login', {window, container})
const inventario = window.pages.create('inventario', {window, container})
const requisitar = window.pages.create('requisitar', {window, container})


requisitar.toCharge()
//login.toCharge()
