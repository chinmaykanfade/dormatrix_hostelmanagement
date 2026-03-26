const express = require('express');
const router = express.Router();

// Mock SMS Sender
const sendSMS = (tenantName, phone, message) => {
    console.log(`[SMS API Simulation TO: ${phone}] -> Hi ${tenantName}, ${message}`);
};

// @route   POST /api/notifications/remind-rent
// @desc    Admin triggers rent reminder to all tenants
router.post('/remind-rent', async (req, res) => {
    try {
        // In a real app, we would query the database for all tenants whose rent is pending
        // For this hackathon simulation, we just log a mass SMS sending event.
        
        console.log("--- STARTING RENT REMINDER BROADCAST ---");
        
        // Mock tenants
        const pendingTenants = [
            { name: "John Student", phone: "+919876543210", room: "A-101", amount: "5000" },
            { name: "Alice Smith", phone: "+919876543211", room: "B-205", amount: "5000" }
        ];

        pendingTenants.forEach(t => {
            sendSMS(t.name, t.phone, `This is a reminder that your hostel rent of RS ${t.amount} for the current month is due. Please pay at the earliest to avoid late fees.`);
        });

        console.log("--- FINISHED RENT REMINDER BROADCAST ---");

        res.status(200).json({ 
            message: 'Rent reminders dispatched successfully!', 
            count: pendingTenants.length 
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to send rent reminders', details: err.message });
    }
});

module.exports = router;
