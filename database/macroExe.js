module.exports = (events)=>{

    const {PythonShell} = require('python-shell')

    const path = require('path')

    const source = path.join(__dirname, '../python')

    function toString(data){

        let string = '' 

        let count1 = 0
        data.forEach(object => {
            const keys = Object.keys(object)
        
            let count = 0
            keys.forEach(iten=>{
                
                if(count == keys.length -1){
                    string += `${object[iten]}`
                }else{
                    string += `${object[iten]},`
                }
    
                count++
            })

            if(count1 != data.length -1){ string += '|' }

            count1++

        })

        return string

    }

    function executeMacro({filePath, macroName, args}){
        return new Promise((resolve, reject)=>{

            const  options = {
                mode: 'text',
                pythonPath: path.join(source, 'python.exe'),
                pythonOptions: ['-u'],
                scriptPath: source,
                args: [filePath, macroName, toString(args)]
            };
            
            PythonShell.run('pymacro.py', options, (err, results)=>{
                if(err){reject(err)};
                resolve(results);
            });
    
        })
    }

    return {
        executeMacro
    }
    
}