var mongoose = require('mongoose');

var SystemSchema = new mongoose.Schema({
    Time: {
        type: Date,
        required: true
    },
    Email:{
        type: String,
        required: true
    },
    Applications: [{
        ProcessName: String,
        CpuUsage: Number,
        RxBytes: Number,
        TxBytes: Number,
        PrivateClean: Number,
        BatteryPercent: Number,
        Uss: Number,
        Pss: Number
    }]
});
SystemSchema.index({Time:1, Email:1},{unique:true});
// Export the model schema
module.exports = SystemSchema;