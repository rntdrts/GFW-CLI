const Events = require('events');

class Transform extends Events {
    attributes = ['boundaries', 'flag', 'gearType', 'aggregate'];
    
    handlers = [];

    construct(props) {
        this.handlers = this.attributes.filter(attr => handlerSetted(props[val]));

        this.props = props;

        this.handleType = this.handleType.bind(this);
        
        this.on('boundaries', this.handleBounds.bind(this));
        this.on('flag', (data) => this.handleType(data, 'flag'));
        this.on('gearType', (data) => this.handleType(data, 'gearType'));
        this.on('aggregate', this.handleAggregate.bind(this));
    }

    handlerSetted(val) {
        return val || val.length;
    }

    handleType(data, type) {
        return data.type
    }

    handleBounds(data) {
        const latlng = {lat: parseInt(data[1]), lng: parseInt(data[2])};

        return parseInt(this.props.boundaries[0].lat) <= latlng.lat && latlng.lng >= parseInt(this.props.boundaries[0].lng) &&
        parseInt(this.props.boundaries[1].lat) >= latlng.lat && latlng.lng <= parseInt(this.props.boundaries[1].lng);
    }

    handleAggregate(data) {

    }

    handler = (date, lat_bin, lon_bin, flag, geartype, vessel, fishing, mmsi) => {
        this.handlers.forEach(handle => {
            this.emit(handle, [date, lat_bin, lon_bin, flag, geartype, vessel, fishing, mmsi])
        })  
    }
}

export default (props) => {
    return new Transform(props);
}