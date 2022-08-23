module.exports = ()=>{
    
    const {DateTime, } = require('luxon')

    const fullMonth = []
    const MonthNum = ['01','02','03','04','05','06','07','08','09','10','11','12']

    function getDateforHistorico(){

        const date = {}
        const now = new Date()

        date.semana = DateTime.now().weekNumber
        date.dia = now.getDate()
        date.mes = now.getMonth()
        date.ano = now.getFullYear()
        date.date = getDateStr()

        return date
    }

    function getNumWeek(dia, mes, ano){
        currentdate = new Date(ano, mes, dia);
        var oneJan = new Date(currentdate.getFullYear(),0,1);
        var numberOfDays = Math.floor((currentdate - oneJan) / (24 * 60 * 60 * 1000));
        var result = Math.ceil(( currentdate.getDay() + 1 + numberOfDays) / 7);
        return result
    }

    function getDateStr(){
        const now = new Date()
        const dia = now.getDate()
        const mes = MonthNum[now.getMonth()]
        const ano = now.getFullYear()
        return `${dia}/${mes}/${ano}`
    }

    function getDate(){
        const now = new Date()
        return {
            dia: now.getDate(),
            mes: now.getMonth(),
            ano: now.getFullYear()
        }
    }

    function formatDateStr(date){
        const {dia, mes, ano} = date
        return `${dia}/${MonthNum[mes]}/${ano}`
    }
    
    return {
        formatDateStr,
        getDateforHistorico,
        getDateStr,
        getDate,
        getNumWeek,
        MonthNum,
        fullMonth,
    }
}