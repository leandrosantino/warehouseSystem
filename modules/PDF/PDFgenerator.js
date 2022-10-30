module.exports = ()=>{
    
    const puppe = require('puppeteer')
    const ejs = require('../ejs')()
    const json = require('../../database/jsonCore')()
    const dateFetures = require('../dateFetures')()

    const path = require('path')
    const fs = require('fs')

    const htmlPath = path.join(__dirname, 'pdf.html')
    const ejsPath = path.join(__dirname, 'template.ejs')

    const naturezas = {
        'Quebra': 0, 'Preventiva': 1, 'Melhoria': 2, 'Segurança': 3, 'Outros': 4,
    }

    function renderHTML(data){
        const html =  ejs.createPDFtemplate({
            source: ejsPath,
            data
        })
        fs.writeFileSync(htmlPath, html, 'utf-8')
    }

    function setPDFname(dados){
        const date = dados.data.split('/')
        return `${date[0]}-${date[1]}-${date[2]}_Rec(${dados.numero}).pdf`
    }

    function formatData(dados){
        dados.data = dateFetures.getDateStr()
        dados.hora = dateFetures.getHourstr()
        dados.numero = json.getRequestNumber()
        dados.turno = dateFetures.getTurno()
        const arrayNat = ['', '', '', '', '']
        arrayNat[naturezas[dados.natureza]] = 'X'
        dados.natureza = arrayNat
        dados.material = []

        Object.keys(dados.itens).forEach((key, index)=>{
            const {nome, quantR, quantE} = dados.itens[key]
            index++
            dados.material.push({
                index, codigo: key, descricao: nome, quantR, quantE,
            })
        })

        const materialLen = dados.material.length
        if(materialLen < 6){
            const diff = 6 - materialLen
            let index = materialLen
            for(let i=1;i<=diff;i++){
                index++
                dados.material.push({
                    index, codigo:'', descricao:'', quantR:'', quantE:'',
                })
            }
        }

        return dados
    }
    
    async function generate(dados){ 

        const data = formatData(dados)

        const browser = await puppe.launch()
        const page = await browser.newPage()
        const savePath = json.getPDFpath()

        renderHTML(data)

        await page.goto(`File://${htmlPath}`, {
            waitUntil: 'networkidle0'
        })
        
        const pdf = await page.pdf({
            printBackground: true,
            format: 'A4',
        })

        fs.writeFileSync(path.join(savePath, setPDFname(data)), pdf ,'binary');
        await browser.close()

    }
    
    return {
        generate
    }
}