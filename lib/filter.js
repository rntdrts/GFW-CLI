const { prompt } = require('inquirer');
const read = require('./read');
const write = require('./write');

//TODO: Separate this logic, turn it more modular
let data = {};

const aggregateVessel = (date, lat_bin, lon_bin, flag, geartype, vessel, fishing, mmsi) => {
    const key = lat_bin + '/' + lon_bin;
    
    if (data[key]) {
        return [date, lat_bin, lon_bin, flag, geartype, data[key][5] + parseFloat(vessel), parseFloat(fishing), mmsi];
    }

    return [date, lat_bin, lon_bin, flag, geartype, parseFloat(vessel), parseFloat(fishing), mmsi];
}

const aggregateFishing = (date, lat_bin, lon_bin, flag, geartype, vessel, fishing, mmsi) => {
    const key = lat_bin + '/' + lon_bin;
    
    if (data[key]) {
        return [date, lat_bin, lon_bin, flag, geartype, parseFloat(vessel), data[key][6] + parseFloat(fishing), mmsi];
    }

    return [date, lat_bin, lon_bin, flag, geartype, parseFloat(vessel), parseFloat(fishing), mmsi];
}

const inBoundaries = (boundaries, latlng ) => {
    return parseInt(boundaries[0].lat) <= latlng.lat && latlng.lng >= parseInt(boundaries[0].lng) &&
        parseInt(boundaries[1].lat) >= latlng.lat && latlng.lng <= parseInt(boundaries[1].lng);
}

const filter = (props, options) => {
    const handler = (date, lat_bin, lon_bin, flag, geartype, vessel, fishing, mmsi) => {

        if (
            (!props.boundaries || inBoundaries(props.boundaries, {lat: parseInt(lat_bin), lng: parseInt(lon_bin)})) &&
            (!props.flag || props.flag.toLowerCase() === flag) && 
            (!props.gearType || props.gearType.toLowerCase() === geartype)
        ) {
            let result = [date, lat_bin, lon_bin, flag, geartype, vessel, fishing, mmsi];

            for (let i = 0; i < props.aggregate.length; i++) {
                if (props.aggregate[i] === 'vessel_hours') {
                     result = aggregateVessel(date, lat_bin, lon_bin, flag, geartype, vessel, fishing, mmsi)
                }
    
                if (props.aggregate[i] === 'fishing_hours') {
                    result = aggregateFishing(date, lat_bin, lon_bin, flag, geartype, vessel, fishing, mmsi)
                }
            }

            result[1] = (result[1] / 100).toFixed(2);
            result[2] = (result[2] / 100).toFixed(2);

            data[lat_bin + '/' + lon_bin] = result;
        }
        return ;
    }

    if (props.boundaries) {
        props.boundaries = Object.assign({}, JSON.parse(props.boundaries));

        if (props.boundaries[0].lat >= props.boundaries[1].lat || props.boundaries[0].lng >= props.boundaries[1].lng)
            return false;
    }

    read({...options, ...props}, handler).then(() => {
        write({...options, ...props}, data);
    });
}

const questions = [
    {
        type : 'input',
        name : 'boundaries',
        message : `Filter by boundaries [{"lat": <val>, "lng": <val>}, {"lat": <val>, "lng": <val>}]:`
    },
    {
        type : 'input',
        name : 'flag',
        message : `Filter by flag:`
    },
    {
        type : 'input',
        name : 'geartype',
        message : `Filter by gear type:`
    },
    {
        type : 'checkbox',
        name : 'aggregate',
        message : `Aggregate lat lng by: `,
        choices: ['vessel_hours', 'fishing_hours']
    },
    {
        type : 'checkbox',
        name : 'attributes',
        message : `Select the output attributes: `,
        choices: ['date', 'lat_bin', 'long_bin', 'flag', 'geartype', 'vessel_hours', 'fishing_hours', 'mmsi_present']
    }
]

module.exports = (options) => {
    prompt(questions).then((answers) => {
        filter(answers, options);
    });
}
