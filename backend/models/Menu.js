const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
    tenantId: { type: String, required: true },
    tenantName: { type: String, required: true },
    mealType: { type: String, enum: ['Breakfast', 'Lunch', 'Dinner'], required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    feedback: { type: String }
});

const menuSchema = new mongoose.Schema({
    date: {
        type: String, // Storing as YYYY-MM-DD for uniqueness
        required: true,
        unique: true
    },
    breakfast: { type: String, required: true },
    lunch: { type: String, required: true },
    dinner: { type: String, required: true },
    votes: [voteSchema]
}, { timestamps: true });

module.exports = mongoose.model('Menu', menuSchema);
