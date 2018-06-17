const fs = require('fs');
const path = require('path');
 
const createDir = (paths, index = 0, current = '') => {
    if (index < paths.length) {
        if (paths[index] && paths[index].length) {
            current += '/' + paths[index];

            if (!fs.existsSync(current)) {
                fs.mkdirSync(current);
            }
        }
        createDir(paths, index + 1, current);
    }
}

const validateOutput = (output) => {
    if (!output) {
        return {dir: process.cwd(), file: null, stat: fs.lstatSync(process.cwd())}; 
    }

    const val = path.resolve(output),
        dir = path.dirname(val),
        filename = path.basename(val);
    
    createDir(dir.split('/'));

    return {dir: dir, file: filename};
}

const write = (props, obj) => {
    const output = validateOutput(props.output),
        writer = fs.createWriteStream(`${output.dir}/${output.file}`, {flags: 'a'}),
        keys = Object.keys(obj);
    
    writer.write('date,lat_bin,lon_bin,flag,geartype,vessel_hours,fishing_hours,mmsi_present\r\n');
    
    for(const key of keys) {
        writer.write(`${obj[key].join()}\r\n`);
    }
    
    writer.end();    
}

module.exports = write;