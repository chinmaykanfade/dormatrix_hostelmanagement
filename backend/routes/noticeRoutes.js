const express = require('express');
const router = express.Router();
const Notice = require('../models/Notice');

// Get all notices
router.get('/', async (req, res) => {
    try {
        const notices = await Notice.find().sort({ date: -1 });
        res.status(200).json(notices);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create notice (Admin)
router.post('/', async (req, res) => {
    try {
        const { title, content, author } = req.body;
        const newNotice = new Notice({ title, content, author });
        const savedNotice = await newNotice.save();
        res.status(201).json(savedNotice);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update notice (Admin)
router.put('/:id', async (req, res) => {
    try {
        const { title, content } = req.body;
        const notice = await Notice.findByIdAndUpdate(
            req.params.id,
            { title, content },
            { new: true }
        );
        res.status(200).json(notice);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete notice (Admin)
router.delete('/:id', async (req, res) => {
    try {
        await Notice.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Notice deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
