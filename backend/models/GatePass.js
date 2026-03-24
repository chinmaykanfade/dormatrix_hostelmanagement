const mongoose = require('mongoose');

const gatePassSchema = new mongoose.Schema({
    tenantId: {
        type: String,
        required: true,
    },
    tenantName: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    outTime: {
        type: String,
        required: true,
    },
    inTime: {
        type: String,
        required: true,
    },
    reason: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending',
    },
}, { timestamps: true });

module.exports = mongoose.model('GatePass', gatePassSchema);
