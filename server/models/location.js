var mongoose = require('mongoose');

var LocationSchema = new mongoose.Schema({
    Time: {
        type: Date,
        required: true
    },
    Email:{
        type: String,
        required: true
    },
    Longtitude: Number,
    Latitude: Number
});
LocationSchema.index({Time:1, Email:1},{unique:true});
// Export the model schema
module.exports = LocationSchema;