const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
    visitorName: { type: String, required: true },
    studentName: { type: String, required: true },
    roomNo: { type: String, required: true },
    entryTime: { type: Date, default: Date.now },
    exitTime: { type: Date },
    status: { type: String, enum: ['Active', 'Exited'], default: 'Active' },
    passCode: { type: String, required: true, unique: true }
}, { timestamps: true });

module.exports = mongoose.model('Visitor', visitorSchema);
