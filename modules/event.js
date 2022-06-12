function createEventEmitter(){ 

    const events = {}

    function on(event, callback){
        events[event] = callback
    }

    function sendSync(event, args){
        const func = events[event]
        if(func){
            const Obj = {returnValue: false}
            func(Obj, args)
            return Obj.returnValue
        }else{
            console.error('event not exsists')
        }
    }

    function send(event, args){
        const func = events[event]
        if(func){
            func(args)
        }else{
            console.error('event not exsists')
        }
    }

    function DOM(event, element, callback){
        element.addEventListener(event, callback)
    }

    return {
        on,
        sendSync,
        send,
        DOM,
    }

}

module.exports = createEventEmitter