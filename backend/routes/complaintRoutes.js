const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');

// Helper to calculate SLA deadline
const calculateSLA = (priority) => {
    const hours = priority === 'High' ? 24 : priority === 'Medium' ? 48 : 72;
    const deadline = new Date();
    deadline.setHours(deadline.getHours() + hours);
    return deadline;
};

// Auto-escalate helper based on SLA
const checkAndEscalate = async (complaints) => {
    const now = new Date();
    let mutated = false;
    for (let c of complaints) {
        if (c.status !== 'Resolved' && c.status !== 'Escalated' && now > c.slaDeadline) {
            c.status = 'Escalated';
            await c.save();
            mutated = true;
        }
    }
    return mutated;
};

// Create a new complaint (Tenant)
router.post('/', async (req, res) => {
    try {
        const { tenantId, tenantName, room, title, description, priority } = req.body;
        const slaDeadline = calculateSLA(priority);
        
        const newComplaint = new Complaint({
            tenantId,
            tenantName,
            room,
            title,
            description,
            priority,
            slaDeadline
        });
        
        const savedComplaint = await newComplaint.save();
        res.status(201).json(savedComplaint);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all complaints for Admin
router.get('/', async (req, res) => {
    try {
        const complaints = await Complaint.find().sort({ createdAt: -1 });
        await checkAndEscalate(complaints);
        
        // Re-fetch to return potentially escalated statuses
        const updatedComplaints = await Complaint.find().sort({ createdAt: -1 });
        res.status(200).json(updatedComplaints);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get complaints by Tenant ID
router.get('/tenant/:tenantId', async (req, res) => {
    try {
        const complaints = await Complaint.find({ tenantId: req.params.tenantId }).sort({ createdAt: -1 });
        await checkAndEscalate(complaints);
        
        const updatedComplaints = await Complaint.find({ tenantId: req.params.tenantId }).sort({ createdAt: -1 });
        res.status(200).json(updatedComplaints);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update complaint status (Admin)
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const complaint = await Complaint.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        res.status(200).json(complaint);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
