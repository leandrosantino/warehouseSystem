function createDialog(events){

    const {dialog} = require('electron')

    function directory(args = {
        title,
        openFile,
        openDirectory,
        multSelection,
        window,
        sync: false,
    }){

        const options = {
            title: args.title,
            properties: []
        }

        args.openFile ? options.properties.push('openFile' ): null
        args.openDirectory ? options.properties.push('openDirectory'): null
        args.multSelection ? options.properties.push('multiSelections'): null


        if(args.sync){
            return dialog.showOpenDialogSync(args.window, options)
        }else{
            return dialog.showOpenDialog(args.window, options)
        }
    }
    
    function success(args={
        msg,
        type,
        window,
        sync: false,
        
    }){
        const options = {
            title: 'WarehouseSystem',
            message: args.msg,
            type:  args.type,
        }

        if(args.sync){
            return dialog.showMessageBoxSync(args.window, options);
        }else{
            return dialog.showMessageBox(args.window, options);
        }


    }

    function question(args={
        msg,
        detail,
        window,
        sync: false,
    }, callback){

        const options = {
            title: 'WarehouseSystem',
            message: args.msg,
            detail: args.detail,
            type:  'question',
            buttons: ['Yes', 'No']
        }

        if(args.sync){
            return dialog.showMessageBoxSync(args.window, options);
        }else{
            return dialog.showMessageBox(args.window, options, callback);
        }
    };
 
    function error(msg){
        dialog.showErrorBox('Alerta!!', msg)
    }

    function setIpc(windows){

        events.on('dialogPath', (event, args)=>{
     
            const resp = directory({
                title: args.title,
                window: windows[args.window],
                openDirectory: args.type = 'file'? true:false ,
                openFile: args.type = 'folder'? true:false ,
                sync: true,
            })
    
            if(resp){
                event.returnValue = resp[0]
            }else{
                event.returnValue = false
            }
    
        })

        events.on('dialogSuccess', (event, args)=>{
            const resp = success({
                msg: args.msg,
                detail: args.detail,
                window: windows[args.window],
                sync: true,
            })

            event.returnValue = resp
            
        })
        
        events.on('dialogQuestion', (event, args)=>{
            const resp = question({
                msg: args.msg,
                detail: args.detail,
                sync: true,
                window: windows[args.window],
            })

            event.returnValue = resp == 0 ? true: false
            
        })

        events.on('dialogError', (event, args)=>{
            error(args)
        })

    }

    return {
        directory,
        success,
        error,
        question,
        setIpc
    }

}

module.exports = createDialog