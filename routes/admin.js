const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Pet = require('../models/Pet');
const AdoptionRequest = require('../models/AdoptionRequest');
const AdminAction = require('../models/AdminAction');
const mongoose = require('mongoose');

// Middleware to check if user is logged in and is admin
const requireAdmin = async (req, res, next) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        // Check if user is admin
        const user = await User.findById(req.session.userId);
        if (!user || user.role !== 'admin' || user.status !== 'active') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        req.adminId = req.session.userId;
        next();
    } catch (error) {
        console.error('Admin middleware error:', error);
        res.status(500).json({ error: 'Authorization check failed' });
    }
};

// ============================================
// STORED PROCEDURE SIMULATION - Functions
// ============================================

/**
 * Simulates a stored procedure to approve a user
 * Updates user status and logs action
 */
async function approveUserFunction(adminId, userId) {
    try {
        // Update user status
        const user = await User.findByIdAndUpdate(
            userId,
            { status: 'active' },
            { new: true }
        );

        if (!user) {
            throw new Error('User not found');
        }

        // Log admin action (audit)
        const adminAction = new AdminAction({
            adminId: adminId,
            actionType: 'approve_user',
            targetId: userId,
            targetType: 'user',
            details: `User ${user.name} (${user.email}) approved`,
            timestamp: new Date()
        });
        await adminAction.save();

        return { user, adminAction };
    } catch (error) {
        throw error;
    }
}

/**
 * Simulates a stored procedure to block a user
 * Updates user status and logs action
 */
async function blockUserFunction(adminId, userId) {
    try {
        // Update user status
        const user = await User.findByIdAndUpdate(
            userId,
            { status: 'blocked' },
            { new: true }
        );

        if (!user) {
            throw new Error('User not found');
        }

        // Log admin action (audit)
        const adminAction = new AdminAction({
            adminId: adminId,
            actionType: 'block_user',
            targetId: userId,
            targetType: 'user',
            details: `User ${user.name} (${user.email}) blocked`,
            timestamp: new Date()
        });
        await adminAction.save();

        return { user, adminAction };
    } catch (error) {
        throw error;
    }
}

/**
 * Simulates a stored procedure to approve a pet
 * Updates pet status and logs action
 */
async function approvePetFunction(adminId, petId) {
    try {
        // Update pet status
        const pet = await Pet.findByIdAndUpdate(
            petId,
            { status: 'approved' },
            { new: true }
        ).populate('addedBy', 'name email');

        if (!pet) {
            throw new Error('Pet not found');
        }

        // Log admin action (audit)
        const adminAction = new AdminAction({
            adminId: adminId,
            actionType: 'approve_pet',
            targetId: petId,
            targetType: 'pet',
            details: `Pet "${pet.name}" approved`,
            timestamp: new Date()
        });
        await adminAction.save();

        return { pet, adminAction };
    } catch (error) {
        throw error;
    }
}

/**
 * Simulates a stored procedure to reject a pet
 * Updates pet status and logs action
 */
async function rejectPetFunction(adminId, petId) {
    try {
        // Update pet status
        const pet = await Pet.findByIdAndUpdate(
            petId,
            { status: 'rejected' },
            { new: true }
        ).populate('addedBy', 'name email');

        if (!pet) {
            throw new Error('Pet not found');
        }

        // Log admin action (audit)
        const adminAction = new AdminAction({
            adminId: adminId,
            actionType: 'reject_pet',
            targetId: petId,
            targetType: 'pet',
            details: `Pet "${pet.name}" rejected`,
            timestamp: new Date()
        });
        await adminAction.save();

        return { pet, adminAction };
    } catch (error) {
        throw error;
    }
}

// ============================================
// CHANGE STREAMS (TRIGGERS SIMULATION)
// ============================================

// Initialize change streams for triggers
let changeStreamsInitialized = false;

function initializeChangeStreams() {
    if (changeStreamsInitialized) return;

    try {
        // Change stream for user approvals (trigger simulation)
        // Note: Change streams require MongoDB replica sets. This is a simulation.
        const userChangeStream = User.watch([{ $match: { 'fullDocument.status': 'active' } }], {
            fullDocument: 'updateLookup'
        });
        userChangeStream.on('change', async (change) => {
            if (change.operationType === 'update' && change.updateDescription?.updatedFields?.status === 'active') {
                console.log('🔔 Trigger: User approved -', change.documentKey._id);
                // In a real system, this could trigger notifications, emails, etc.
            }
        });
        userChangeStream.on('error', (error) => {
            console.warn('Change stream error (this is normal if replica sets are not configured):', error.message);
        });

        // Change stream for pet approvals (trigger simulation)
        const petChangeStream = Pet.watch([{ $match: { 'fullDocument.status': 'approved' } }], {
            fullDocument: 'updateLookup'
        });
        petChangeStream.on('change', async (change) => {
            if (change.operationType === 'update' && change.updateDescription?.updatedFields?.status === 'approved') {
                console.log('🔔 Trigger: Pet approved -', change.documentKey._id);
                // In a real system, this could trigger notifications, refresh available pets list, etc.
            }
        });
        petChangeStream.on('error', (error) => {
            console.warn('Change stream error (this is normal if replica sets are not configured):', error.message);
        });

        changeStreamsInitialized = true;
        console.log('✅ Change streams initialized (triggers simulation)');
    } catch (error) {
        // Change streams require replica sets - this is expected in development
        console.warn('⚠️ Change streams not available (replica sets required). Triggers simulation disabled.');
        console.warn('   This is normal for development. In production with replica sets, triggers will work.');
        changeStreamsInitialized = true; // Mark as initialized to prevent retries
    }
}

// Initialize on module load
initializeChangeStreams();

// ============================================
// ROUTES - PENDING USERS (VIEW SIMULATION)
// ============================================

// GET /api/admin/users/pending - Get all pending users (simulates VIEW with aggregation)
router.get('/admin/users/pending', requireAdmin, async (req, res) => {
    try {
        // Simulate VIEW using aggregation pipeline
        const pendingUsers = await User.aggregate([
            {
                $match: {
                    status: 'pending'
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    email: 1,
                    phone: 1,
                    createdAt: 1,
                    status: 1,
                    registrationDate: '$createdAt' // Alias for clarity
                }
            },
            {
                $sort: { createdAt: -1 } // Newest first
            }
        ]);

        res.json({ users: pendingUsers });
    } catch (error) {
        console.error('Error fetching pending users:', error);
        res.status(500).json({ error: 'Failed to fetch pending users' });
    }
});

// PATCH /api/admin/users/:id/approve - Approve a user (uses stored procedure function)
router.patch('/admin/users/:id/approve', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.adminId;

        // Use stored procedure function
        const result = await approveUserFunction(adminId, id);

        res.json({
            message: 'User approved successfully',
            user: result.user
        });
    } catch (error) {
        console.error('Error approving user:', error);
        if (error.message === 'User not found') {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(500).json({ error: 'Failed to approve user' });
    }
});

// PATCH /api/admin/users/:id/block - Block a user (uses stored procedure function)
router.patch('/admin/users/:id/block', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.adminId;

        // Use stored procedure function
        const result = await blockUserFunction(adminId, id);

        res.json({
            message: 'User blocked successfully',
            user: result.user
        });
    } catch (error) {
        console.error('Error blocking user:', error);
        if (error.message === 'User not found') {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(500).json({ error: 'Failed to block user' });
    }
});

// ============================================
// ROUTES - PENDING PETS (VIEW SIMULATION)
// ============================================

// GET /api/admin/pets/pending - Get all pending pets (simulates VIEW with aggregation)
router.get('/admin/pets/pending', requireAdmin, async (req, res) => {
    try {
        // Simulate VIEW using aggregation pipeline with user info
        const pendingPets = await Pet.aggregate([
            {
                $match: {
                    status: 'pending'
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'addedBy',
                    foreignField: '_id',
                    as: 'addedByUser'
                }
            },
            {
                $unwind: {
                    path: '$addedByUser',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    type: 1,
                    ageYears: 1,
                    ageMonths: 1,
                    description: 1,
                    photo: 1,
                    status: 1,
                    createdAt: 1,
                    addedBy: {
                        _id: '$addedByUser._id',
                        name: '$addedByUser.name',
                        email: '$addedByUser.email'
                    }
                }
            },
            {
                $sort: { createdAt: -1 } // Newest first
            }
        ]);

        res.json({ pets: pendingPets });
    } catch (error) {
        console.error('Error fetching pending pets:', error);
        res.status(500).json({ error: 'Failed to fetch pending pets' });
    }
});

// PATCH /api/admin/pets/:id/approve - Approve a pet (uses stored procedure function)
router.patch('/admin/pets/:id/approve', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.adminId;

        // Use stored procedure function
        const result = await approvePetFunction(adminId, id);

        // Change stream will automatically trigger (simulated)
        // Pet is now approved and will show in users' Available Pets section

        res.json({
            message: 'Pet approved successfully',
            pet: result.pet
        });
    } catch (error) {
        console.error('Error approving pet:', error);
        if (error.message === 'Pet not found') {
            return res.status(404).json({ error: 'Pet not found' });
        }
        res.status(500).json({ error: 'Failed to approve pet' });
    }
});

// PATCH /api/admin/pets/:id/reject - Reject a pet (uses stored procedure function)
router.patch('/admin/pets/:id/reject', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.adminId;

        // Use stored procedure function
        const result = await rejectPetFunction(adminId, id);

        res.json({
            message: 'Pet rejected successfully',
            pet: result.pet
        });
    } catch (error) {
        console.error('Error rejecting pet:', error);
        if (error.message === 'Pet not found') {
            return res.status(404).json({ error: 'Pet not found' });
        }
        res.status(500).json({ error: 'Failed to reject pet' });
    }
});

// ============================================
// ROUTES - ANALYTICS (AGGREGATION PIPELINES)
// ============================================

// GET /api/admin/analytics - Get dashboard analytics using aggregation pipelines
router.get('/admin/analytics', requireAdmin, async (req, res) => {
    try {
        // Use aggregation pipelines to count different entities
        const [
            pendingUsersCount,
            pendingPetsCount,
            approvedPetsCount,
            adoptionRequestsCount
        ] = await Promise.all([
            // Count pending users
            User.aggregate([
                { $match: { status: 'pending' } },
                { $count: 'count' }
            ]),
            // Count pending pets
            Pet.aggregate([
                { $match: { status: 'pending' } },
                { $count: 'count' }
            ]),
            // Count approved pets
            Pet.aggregate([
                { $match: { status: 'approved' } },
                { $count: 'count' }
            ]),
            // Count all adoption requests
            AdoptionRequest.aggregate([
                { $count: 'count' }
            ])
        ]);

        res.json({
            analytics: {
                pendingUsers: pendingUsersCount[0]?.count || 0,
                pendingPets: pendingPetsCount[0]?.count || 0,
                approvedPets: approvedPetsCount[0]?.count || 0,
                adoptionRequests: adoptionRequestsCount[0]?.count || 0
            }
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

// ============================================
// ROUTES - ADMIN ACTIONS (AUDIT LOGS)
// ============================================

// GET /api/admin/actions - Get recent admin actions (audit logs)
router.get('/admin/actions', requireAdmin, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        
        const actions = await AdminAction.find()
            .populate('adminId', 'name email')
            .sort({ timestamp: -1 })
            .limit(limit);

        res.json({ actions });
    } catch (error) {
        console.error('Error fetching admin actions:', error);
        res.status(500).json({ error: 'Failed to fetch admin actions' });
    }
});

module.exports = router;
