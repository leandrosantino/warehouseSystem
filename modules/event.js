function createEventEmitter(){ 

    const events = {}

    function on(event, callback){
        events[event] = callback
    } 

    async function sendAsync(event, args){
        const func = events[event]
        if(func){
            const Obj = {returnValue: false}
            await func(Obj, args)
            return Obj.returnValue
        }else{
            console.error(`"${event}" event does not exist`)
        }
    }

    function sendSync(event, args){
        const func = events[event]
        if(func){
            const Obj = {returnValue: false}
            func(Obj, args)
            return Obj.returnValue
        }else{
            console.error(`"${event}" event does not exist`)
        }
    }

    function send(event, args){
        const func = events[event]
        if(func){
            func(args)
        }else{
            console.error(`"${event}" event does not exist`)
        }
    }

    function DOM(event, element, callback){
        element.addEventListener(event, callback)
    }

    return {
        on,
        sendSync,
        sendAsync,
        send,
        DOM,
        events,
    }

}

module.exports = createEventEmitter