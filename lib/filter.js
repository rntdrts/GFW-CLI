const { prompt } = require('inquirer');
const fs = require('fs');
const path = require('path');
const csv = require('csv').parse;

const readFromDirectory = (directory, props) => {
    fs.readdirSync(directory).forEach(file => {
        readFromFile(`${directory}/${file}`, props);
    });
}

const readFromFile = (file, props) => {
    fs.createReadStream(file)
    .pipe(csv())
    .on('data', (data) => {
        if (props.boundaries[0].lat <= data[1] &&
            data[2] >= props.boundaries[0].lng &&
            props.boundaries[1].lat <= data[1] &&
            data[2] <= props.boundaries[1].lng
        ) {
                console.log('Date: %s Flag: %s', data[1], data[2])
        }
    })
}

const filter = (props, options) => {
    const input = !options.input ? process.cwd() : path.resolve(options.input),
        valid = fs.lstatSync(input);

    if (props.boundaries) {
        props.boundaries = Object.assign({}, JSON.parse(props.boundaries));
    }

    console.log(props.boundaries[0].lat);
    console.log(props.boundaries[1].lng);

    if(valid.isFile()) {
        readFromFile(input, props);
    }

    if (valid.isDirectory()) {
        readFromDirectory(input, props);
    }    
}

const questions = [
    {
        type : 'input',
        name : 'boundaries',
        message : `Filter by boundaries [Press ENTER to skip or specifie the value [{lat: <val>, lng: <val>}, {lat: <val>, lng: <val>}] ]:`
    },
    {
        type : 'input',
        name : 'flag',
        message : `Filter by flag [Press ENTER to skip or <flag> ]:`
    },
    {
        type : 'input',
        name : 'geartype',
        message : `Filter by gear type [Press ENTER to skip or <gear type> ]:`
    },
    {
        type : 'checkbox',
        name : 'custums',
        message : `Custom filters [Press ENTER to skip or press <space> to select each]: `,
        choices: ['Aggregate fishing hours per lat_bin, lng_bin']
    },
    {
        type : 'checkbox',
        name : 'attributes',
        message : `Select the output attributes [Press ENTER to skip or press <space> to select each]: `,
        choices: ['date', 'lat_bin', 'long_bin', 'flag', 'geartype', 'vessel_hours', 'fixing_hours', 'mmsi_present']
    }
]

module.exports = (options) => {
    prompt(questions).then((answers) => {
        filter(answers, options);
    });
}

//[{"lat": 4047, "lng": -886}, {"lat": 4087, "lng": -868}]