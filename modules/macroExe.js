module.exports = ({filePath, macroName, args})=>{

    const {PythonShell} = require('python-shell')

    const  options = {
        mode: 'text',
        pythonPath: './python/python.exe',
        pythonOptions: ['-u'],
        scriptPath: './python',
        args: [filePath, macroName, args]
    };
      
    PythonShell.run('pymacro.py', options, (err, results)=>{
        if(err){console.log(err)};
        console.log('results: %j', results);
    });

}