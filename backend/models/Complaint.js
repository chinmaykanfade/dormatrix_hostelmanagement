const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
    tenantId: {
        type: String,
        required: true,
    },
    tenantName: {
        type: String,
        required: true,
    },
    room: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Low',
    },
    status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Resolved', 'Escalated'],
        default: 'Pending',
    },
    slaDeadline: {
        type: Date,
        required: true,
    },
}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);
