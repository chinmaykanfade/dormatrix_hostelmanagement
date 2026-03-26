const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Visitor = require('../models/Visitor');

// Generate unique ID for pass
const generatePassCode = () => {
    return crypto.randomBytes(4).toString('hex').toUpperCase();
};

// Get all visitors (Admin)
router.get('/', async (req, res) => {
    try {
        const visitors = await Visitor.find().sort({ entryTime: -1 });
        res.status(200).json(visitors);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add new visitor
router.post('/', async (req, res) => {
    try {
        const { visitorName, studentName, roomNo } = req.body;
        const passCode = generatePassCode();
        
        const newVisitor = new Visitor({
            visitorName,
            studentName,
            roomNo,
            passCode
        });
        
        const savedVisitor = await newVisitor.save();
        res.status(201).json(savedVisitor);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Mark visitor exit
router.put('/:id/exit', async (req, res) => {
    try {
        const visitor = await Visitor.findById(req.params.id);
        if (!visitor) return res.status(404).json({ message: 'Visitor not found' });
        
        visitor.status = 'Exited';
        visitor.exitTime = new Date();
        
        await visitor.save();
        res.status(200).json(visitor);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
