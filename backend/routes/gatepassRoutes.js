const express = require('express');
const router = express.Router();
const GatePass = require('../models/GatePass');

// Dummy SMS Service for Hackathon Module
const sendSMS = (tenantName, status) => {
    console.log(`[SMS API Simulation] -> Sending SMS to parent of ${tenantName}: Gate Pass has been ${status}.`);
};

// @route   POST /api/gatepass/request
// @desc    Tenant requests a gate pass
router.post('/request', async (req, res) => {
    try {
        const { tenantId, tenantName, date, outTime, inTime, reason } = req.body;
        
        const newGatePass = new GatePass({
            tenantId,
            tenantName,
            date,
            outTime,
            inTime,
            reason,
            status: 'Pending'
        });

        const savedRequest = await newGatePass.save();
        res.status(201).json({ message: 'Gate pass requested successfully', gatePass: savedRequest });
    } catch (err) {
        res.status(500).json({ error: 'Failed to request gate pass', details: err.message });
    }
});

// @route   GET /api/gatepass
// @desc    Get all gate passes (Admin) or specific tenant's passes (if tenantId is provided via query)
router.get('/', async (req, res) => {
    try {
        const { tenantId } = req.query;
        let query = {};
        if (tenantId) {
            query.tenantId = tenantId;
        }
        
        const passes = await GatePass.find(query).sort({ createdAt: -1 });
        res.status(200).json(passes);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch gate passes', details: err.message });
    }
});

// @route   PUT /api/gatepass/:id/status
// @desc    Admin updates gate pass status
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body; // 'Approved' or 'Rejected'
        if (!['Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const pass = await GatePass.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!pass) {
            return res.status(404).json({ error: 'Gate pass not found' });
        }

        // Trigger Parent SMS Notification on Approval/Rejection
        sendSMS(pass.tenantName, status);

        res.status(200).json({ message: `Gate pass ${status} successfully`, gatePass: pass });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update gate pass status', details: err.message });
    }
});

module.exports = router;
