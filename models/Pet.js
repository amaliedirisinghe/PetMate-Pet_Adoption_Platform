const mongoose = require('mongoose');

// Pet Schema
const petSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Pet name is required'],
        trim: true
    },
    type: {
        type: String,
        required: [true, 'Pet type is required'],
        trim: true,
        enum: ['dog', 'cat', 'bird', 'rabbit', 'hamster', 'other']
    },
    age: {
        type: Number,
        required: [true, 'Pet age is required'],
        min: [0, 'Age must be a positive number']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true
    },
    photo: {
        type: String,
        default: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=400&h=300&fit=crop'
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        default: 'pending',
        enum: ['pending', 'approved', 'rejected']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Export Pet model
module.exports = mongoose.model('Pet', petSchema);
