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
        let dia = now.getDate()
        if(String(dia).length < 2) dia = `0${dia}`
        const mes = MonthNum[now.getMonth()]
        const ano = now.getFullYear()
        return `${dia}/${mes}/${ano}`
    }

    function getHourstr(){
        const now = new Date()
        let hour = now.getHours()
        let minute = now.getMinutes()
        if(String(hour).length < 2){hour = `0${hour}`}
        if(String(minute).length < 2){minute = `0${minute}`}
        return `${hour}:${minute}`
    }

    function getHourObj(){
        const now = new Date()
        const hour = now.getHours()
        const minute = now.getMinutes()
        return {hour, minute}
    }

    function getTurno(){
        let turno = '0'

        const now = new Date()
        const y = now.getFullYear()
        const m = now.getMonth()
        const d = now.getDate()
    
        const h1 = new Date(y, m, d, 6, 10, 00)
        const h2 = new Date(y, m, d, 15, 48, 00)
        const h3 = new Date(y, m, d, 23, 59, 00)
        const h4 = new Date(y, m, d, 0, 0, 00)
        const h5 = new Date(y, m, d, 1, 9, 00)
    
        if(now >= h1 && now < h2){turno = '1º Truno'}
        if(now >= h2 && now < h3){turno = '2º Truno'}
        if(now >= h4 && now < h5){turno = '2º Truno'}
        if(now >= h5 && now < h1){turno = '3º Truno'}
    
        return turno
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
        getHourstr,
        getHourObj,
        getTurno,
        MonthNum,
        fullMonth,
    }
}