const fs = require('fs');
const csv = require('csv');
const path = require('path');
const { Progress } = require('clui');

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
                    const progress = new Progress(20);
                    const readFiles = (i, dir, files, handler) => { 
                        if (i === files.length) {
                            return resolve();
                        }

                        let stream = readFromFile(path.join(dir, files[i]), handler);

                        stream.on('finish', () => {
                            let percentage = ((i+1)/files.length);

                            if(((percentage * 100) % 10) === 0)
                                console.log(progress.update(percentage.toFixed(2)));

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