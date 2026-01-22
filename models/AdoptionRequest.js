const mongoose = require('mongoose');

// Adoption Request Schema
const adoptionRequestSchema = new mongoose.Schema({
    petId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pet',
        required: [true, 'Pet ID is required']
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    status: {
        type: String,
        default: 'pending',
        enum: ['pending', 'approved', 'rejected']
    },
    requestDate: {
        type: Date,
        default: Date.now
    },
    approvedDate: {
        type: Date
    }
});

// Export AdoptionRequest model
module.exports = mongoose.model('AdoptionRequest', adoptionRequestSchema);
