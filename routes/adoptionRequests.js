const express = require('express');
const router = express.Router();
const AdoptionRequest = require('../models/AdoptionRequest');
const Pet = require('../models/Pet');

// Middleware to check if user is logged in
const requireAuth = (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    next();
};

// POST /api/adoption-requests - Create a new adoption request
router.post('/adoption-requests', requireAuth, async (req, res) => {
    try {
        const { petId } = req.body;

        // Validate required fields
        if (!petId) {
            return res.status(400).json({ 
                error: 'Pet ID is required' 
            });
        }

        // Check if pet exists
        const pet = await Pet.findById(petId);
        if (!pet) {
            return res.status(404).json({ 
                error: 'Pet not found' 
            });
        }

        // Check if pet is approved
        if (pet.status !== 'approved') {
            return res.status(400).json({ 
                error: 'This pet is not available for adoption' 
            });
        }

        // Check if user already has a pending request for this pet
        const existingRequest = await AdoptionRequest.findOne({
            petId: petId,
            userId: req.session.userId,
            status: 'pending'
        });

        if (existingRequest) {
            return res.status(400).json({ 
                error: 'You already have a pending request for this pet' 
            });
        }

        // Create new adoption request with status = "pending"
        const adoptionRequest = new AdoptionRequest({
            petId: petId,
            userId: req.session.userId,
            status: 'pending'
        });

        await adoptionRequest.save();

        // Populate pet and user info
        await adoptionRequest.populate('petId', 'name type age photo');
        await adoptionRequest.populate('userId', 'name email');

        res.status(201).json({ 
            message: 'Adoption request submitted successfully',
            adoptionRequest 
        });
    } catch (error) {
        console.error('Error creating adoption request:', error);
        res.status(500).json({ 
            error: 'Failed to submit adoption request. Please try again.' 
        });
    }
});

// GET /api/adoption-requests/user/:userId - Get all adoption requests for a user
router.get('/adoption-requests/user/:userId', requireAuth, async (req, res) => {
    try {
        const { userId } = req.params;

        // Verify that the userId matches the session userId (users can only see their own requests)
        if (userId !== req.session.userId) {
            return res.status(403).json({ 
                error: 'Access denied' 
            });
        }

        // Get all adoption requests for this user
        const adoptionRequests = await AdoptionRequest.find({ userId: userId })
            .populate('petId', 'name type age photo description')
            .sort({ requestDate: -1 }); // Sort by newest first

        res.json({ adoptionRequests });
    } catch (error) {
        console.error('Error fetching adoption requests:', error);
        res.status(500).json({ 
            error: 'Failed to fetch adoption requests' 
        });
    }
});

module.exports = router;
