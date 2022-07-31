/*const xlsx = require('node-xlsx')
const path = require('path')
const fs = require('fs')

const workbook = xlsx.parse(path.join(__dirname, './CONTROLE DE SPARE PARTS.xlsm'))
const sheet = workbook[1].data

let labels = [
    'Codigo',
    'Descrição Tecnica',
    'ENDEREÇO',
    'Estoque',
    'Mínimo',
    'Maximo'
]
labels = labels.map(item=>{
    let index
    sheet[1].forEach((row, _index)=>{
        if(row == item){
            index = _index
            return
        }
    })
    return index
})

sheet.splice(0,2)
const data = []
sheet.forEach(row=>{
    data.push({
        codigo: row[labels[0]],
        descricao: row[labels[1]],
        endereco: row[labels[2]],
        estoque: row[labels[3]],
        minimo: row[labels[4]]?row[labels[4]]:0,
        maximo: row[labels[5]]?row[labels[5]]:0,
    })
})

//console.log(data)

const teste = [
    [
        'leandro',
        'google',
        'teste'
    ],
    [
        'avião',
        'carro',
        'foguete'
    ]
]

const buffer = xlsx.build([{name: 'Teste', data: teste}])
fs.writeFileSync(path.join(__dirname, './teste.xlsx'), buffer, {encoding: 'utf-8'})
*/


const date = new Date()
const meses = ['01','02','03','04','05','06','07','08','09','10','11','12']
console.log(`${date.getDate()}/${meses[date.getMonth()]}/${date.getFullYear()}`)