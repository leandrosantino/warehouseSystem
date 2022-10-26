module.exports = ()=>{
    
    const puppe = require('puppeteer')
    const ejs = require('../ejs')()
    const json = require('../../database/jsonCore')()

    const path = require('path')
    const fs = require('fs')

    const htmlPath = path.join(__dirname, 'pdf.html')
    const ejsPath = path.join(__dirname, 'template.ejs')

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
    
    async function generate(data){
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