var mongoose = require('mongoose');

var LocationSchema = new mongoose.Schema({
    Time: {
        type: Date,
        required: true,
        unique: true
    },
    Email:{
        type: String,
        required: true
    },
    Longtitude: Number,
    Latitude: Number
});

// Export the model schema
module.exports = LocationSchema;