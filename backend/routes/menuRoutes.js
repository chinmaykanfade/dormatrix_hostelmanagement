const express = require('express');
const router = express.Router();
const Menu = require('../models/Menu');

// Get all menus
router.get('/', async (req, res) => {
    try {
        const menus = await Menu.find().sort({ date: -1 });
        res.status(200).json(menus);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get menu for a specific date (e.g., YYYY-MM-DD)
router.get('/date/:date', async (req, res) => {
    try {
        const menu = await Menu.findOne({ date: req.params.date });
        if (!menu) return res.status(404).json({ message: 'No menu for this date' });
        res.status(200).json(menu);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create or Update Menu (Admin)
router.post('/', async (req, res) => {
    try {
        const { date, breakfast, lunch, dinner } = req.body;
        
        let menu = await Menu.findOne({ date });
        if (menu) {
            // Update existing
            menu.breakfast = breakfast;
            menu.lunch = lunch;
            menu.dinner = dinner;
            await menu.save();
        } else {
            // Create new
            menu = new Menu({ date, breakfast, lunch, dinner });
            await menu.save();
        }
        res.status(200).json(menu);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Submit a Vote/Rating (Tenant)
router.post('/:id/vote', async (req, res) => {
    try {
        const { tenantId, tenantName, mealType, rating, feedback } = req.body;
        const menu = await Menu.findById(req.params.id);
        
        if (!menu) return res.status(404).json({ message: 'Menu not found' });
        
        // Remove previous vote for same tenant and mealType
        menu.votes = menu.votes.filter(v => !(v.tenantId === tenantId && v.mealType === mealType));
        
        // Add new vote
        menu.votes.push({ tenantId, tenantName, mealType, rating, feedback });
        await menu.save();
        
        res.status(200).json(menu);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
