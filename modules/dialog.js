function createDialog(dialog){

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
        title,
        msg,
        type,
        window,
        sync: false,
        
    }){
        const options = {
            title: args.title,
            message: args.msg,
            type:  args.type,
        }

        if(args.sync){
            return dialog.showMessageBoxSync(args.window, options);
        }else{
            return dialog.showMessageBox(args.window, options);
        }


    }
 
    function error(msg){
        dialog.showErrorBox('Alerta!!', msg)
    }

    function setIpc(ipcMain, windows){

        ipcMain.on('dialogPath', (event, args)=>{
     
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

        ipcMain.on('dialogSuccess', (event, args)=>{
            const resp = success({
                title: args.title,
                msg: args.msg,
                sync: true,
                window: windows[args.window],
                type: 'info',
            })

            event.returnValue = resp
            
        })

        ipcMain.on('dialogError', (event, args)=>{
            error(args)
        })

    }

    return {
        directory,
        success,
        error,
        setIpc
    }

}

module.exports = createDialog