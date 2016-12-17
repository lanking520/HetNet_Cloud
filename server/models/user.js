var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
    Email: {
        type: String,
        required: true,
        unique: true
    },
    Password:{
        type: String,
        required: true
    },
    Name:{
        type: String,
        required: true
    }
});

// Export the model schema
module.exports = UserSchema;
