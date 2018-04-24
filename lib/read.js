const fs = require('fs');
const csv = require('csv');
const path = require('path');

//ler ficheiros
//escrever em ficheiro(s)
//handle filters
//[{"lat": 4047, "lng": -886}, {"lat": 4087, "lng": -868}]
//['date', 'lat_bin', 'long_bin', 'flag', 'geartype', 'vessel_hours', 'fixing_hours', 'mmsi_present']
const readFromFile = (file, handler, promise) => {
    let transformer = csv.transform((data) => handler(...data)),
    parser = csv.parse();

    const stream = fs.createReadStream(file)
        .pipe(parser)
        .pipe(transformer);

    return stream;
}

const validateInput = (inp) => {
    const input = !inp ? process.cwd() : path.resolve(inp),
        valid = fs.lstatSync(inp);

    return {file: input, stat: valid};
}

const read = (props, handler) => {
    const input = validateInput(props.input);

    return new Promise((resolve, reject) => {
        try {
            if(input.stat.isFile()) {
                const stream = readFromFile(input.file, handler);
    
                stream.on('finish', () => {
                    resolve();
                })
            }
        
            if (input.stat.isDirectory()) {
                fs.readdir(input.file, (err, files) => {
                    const readFiles = (i, dir, files, handler) => { 
                        console.log(i);  
                        if (i === files.length - 1) {
                            return resolve();
                        }
                    
                        let stream = readFromFile(`${dir}/${files[i]}`, handler);
                    
                        stream.on('finish', () => {
                            readFiles((i+1), dir, files, handler);
                        });
                    }

                    readFiles(0, input.file, files, handler);
                });
            }
        } catch(error) {
            reject(error);
        }
    });
}

module.exports = read;