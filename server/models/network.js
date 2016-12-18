var mongoose = require('mongoose');

var NetworkSchema = new mongoose.Schema({
    Time: {
        type: Date,
        required: true
    },
    Email:{
        type: String,
        required: true
    },
    Networks: [{
        NetworkSSID:String,
        Bandwidth: Number,
        SignalStrength: Number,
        SignalFrequency: Number,
        TimeToConnect: Number,
        Cost: Number,
        SecurityProtocol: String
    }]
});
NetworkSchema.index({Time:1, Email:1},{unique:true});
// Export the model schema
module.exports = NetworkSchema;