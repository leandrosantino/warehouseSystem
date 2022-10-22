module.exports = ()=>{
    
    const puppe = require('puppeteer')
    const ejs = require('../ejs')()
    const json = require('../../database/jsonCore')()

    const path = require('path')
    const fs = require('fs')

    const htmlPath = path.join(__dirname, 'pdf.html')
    const savePath = path.join(__dirname, 'requisição.pdf')
    const ejsPath = path.join(__dirname, 'template.ejs')

    function renderHTML(data){
        const html =  ejs.createPDFtemplate({
            source: ejsPath,
            data
        })
        fs.writeFileSync(htmlPath, html, 'utf-8')
    }
    
    async function generate(data){
        const browser = await puppe.launch()
        const page = await browser.newPage()

        renderHTML(data)

        await page.goto(`File://${htmlPath}`, {
            waitUntil: 'networkidle0'
        })
        
        const pdf = await page.pdf({
            printBackground: true,
            format: 'A4',
        })

        fs.writeFileSync(savePath, pdf ,'binary');
        await browser.close()

    }
    
    return {
        generate
    }
}