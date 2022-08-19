const dataCore = require('../database/dataCore')()

async function main(){
    await dataCore.init()? 
    true:console.log('erro in dataCore')
}

main()