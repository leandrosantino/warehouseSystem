function createDialog({ipcMain, events}){

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
            type:  'info',
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

    function dialogPath(args, windows){
        const resp = directory({
            title: args.title,
            window: windows[args.window],
            openDirectory: args.type == 'folder'? true:false ,
            openFile: args.type == 'file'? true:false ,
            sync: true,
        })

        if(resp){
            return resp[0]
        }else{
            return false
        }
    }

    function dialogSuccess(args, windows){
        return success({
            msg: args.msg,
            window: windows[args.window],
            sync: true,
        })
    }

    function dialogQuestion(args, windows){
        const resp = question({
            msg: args.msg, 
            detail: args.detail,
            sync: true,
            window: windows[args.window],
        })
        return resp == 0 ? true: false
    }

    function setIpc(windows){

        events.on('dialogPath', (event, args)=>event.returnValue = dialogPath(args, windows))
        events.on('dialogSuccess', (event, args)=>event.returnValue = dialogSuccess(args, windows))
        events.on('dialogQuestion', (event, args)=>event.returnValue = dialogQuestion(args, windows))
        events.on('dialogError', (event, args)=>{
            error(args)
            event.returnValue = true 
        })

        ipcMain.on('dialogPath', (event, args)=>event.returnValue = dialogPath(args, windows))
        ipcMain.on('dialogSuccess', (event, args)=>event.returnValue = dialogSuccess(args, windows))
        ipcMain.on('dialogQuestion', (event, args)=>event.returnValue = dialogQuestion(args, windows))
        ipcMain.on('dialogError', (event, args)=>{
            error(args)
            event.returnValue = true 
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