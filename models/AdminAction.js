const mongoose = require('mongoose');

// Admin Action Schema (Audit Logs)
const adminActionSchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Admin ID is required']
    },
    actionType: {
        type: String,
        required: [true, 'Action type is required'],
        enum: ['approve_user', 'block_user', 'approve_pet', 'reject_pet']
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Target ID is required']
    },
    targetType: {
        type: String,
        required: [true, 'Target type is required'],
        enum: ['user', 'pet']
    },
    details: {
        type: String,
        trim: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

// Create index for faster queries
adminActionSchema.index({ timestamp: -1 });
adminActionSchema.index({ adminId: 1, timestamp: -1 });

// Export AdminAction model
module.exports = mongoose.model('AdminAction', adminActionSchema, 'admin_actions');
