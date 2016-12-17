var mongoose = require('mongoose');

var NetworkSchema = new mongoose.Schema({
    Time: {
        type: Date,
        required: true,
        unique: true
    },
    Email:{
        type: String,
        required: true
    },
    Networks: [{
        NetworkSSID:{
            type: String,
            required: true,
            unique: true
        },
        Bandwidth: Number,
        SignalStrength: Number,
        SignalFrequency: Number,
        TimeToConnect: Number,
        Cost: Number,
        SecurityProtocol: String
    }]
});

// Export the model schema
module.exports = NetworkSchema;