const express = require('express');
const router = express.Router();
const Pet = require('../models/Pet');
const User = require('../models/User');
const upload = require('../config/upload');
const path = require('path');

// Middleware to check if user is logged in
const requireAuth = (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    next();
};

// GET /api/pets - Get all approved pets
router.get('/pets', async (req, res) => {
    try {
        // Get all pets with status = "approved"
        const pets = await Pet.find({ status: 'approved' })
            .populate('addedBy', 'name email')
            .sort({ createdAt: -1 }); // Sort by newest first

        res.json({ pets });
    } catch (error) {
        console.error('Error fetching pets:', error);
        res.status(500).json({ 
            error: 'Failed to fetch pets' 
        });
    }
});

// GET /api/pets/user/:userId - Get all pets added by the logged-in user (all statuses)
router.get('/pets/user/:userId', requireAuth, async (req, res) => {
    try {
        const { userId } = req.params;
        const sessionUserId = req.session.user ? req.session.user._id : req.session.userId;

        if (userId !== sessionUserId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const pets = await Pet.find({ addedBy: userId })
            .populate('addedBy', 'name email')
            .sort({ createdAt: -1 });

        res.json({ pets });
    } catch (error) {
        console.error('Error fetching user pets:', error);
        res.status(500).json({ error: 'Failed to fetch your pets' });
    }
});

// POST /api/pets - Add a new pet with photo upload (requires authentication)
router.post('/pets', requireAuth, upload.single('photo'), async (req, res) => {
    try {
        // Extract pet details from request body (multipart/form-data)
        const { name, type, ageYears, ageMonths, description } = req.body;

        // Validate required fields
        if (!name || !type || !description) {
            return res.status(400).json({ 
                error: 'Name, type, and description are required' 
            });
        }
        const years = parseInt(ageYears, 10);
        const months = parseInt(ageMonths, 10);
        if (isNaN(years) || years < 0) {
            return res.status(400).json({ error: 'Age years must be 0 or greater' });
        }
        if (isNaN(months) || months < 0 || months > 11) {
            return res.status(400).json({ error: 'Age months must be between 0 and 11' });
        }

        // Check if file was uploaded
        let photoPath = 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=400&h=300&fit=crop'; // Default image
        
        if (req.file) {
            // File was uploaded - construct URL path
            // The file is saved in /uploads/pets/ directory
            photoPath = `/uploads/pets/${req.file.filename}`;
        }

        // Get user ID from session (use req.session.user._id if available, otherwise req.session.userId)
        const userId = req.session.user ? req.session.user._id : req.session.userId;
        
        if (!userId) {
            return res.status(401).json({ 
                error: 'User not authenticated' 
            });
        }

        // Create new pet with status = "pending"
        const pet = new Pet({
            name: name.trim(),
            type: type.trim(),
            ageYears: years,
            ageMonths: months,
            description: description.trim(),
            photo: photoPath,
            addedBy: userId,
            status: 'pending',
            createdAt: new Date()
        });

        // Save pet to MongoDB 'pets' collection
        await pet.save();
        
        // Verify pet was saved
        if (!pet._id) {
            return res.status(500).json({ 
                error: 'Failed to save pet to database' 
            });
        }

        // Populate addedBy field
        await pet.populate('addedBy', 'name email');

        res.status(201).json({ 
            message: 'Pet added successfully. Waiting for admin approval.',
            pet 
        });
    } catch (error) {
        console.error('Error adding pet:', error);
        
        // If multer error (file upload issue)
        if (error.message && error.message.includes('Only image files')) {
            return res.status(400).json({ 
                error: 'Only image files are allowed' 
            });
        }
        
        res.status(500).json({ 
            error: 'Failed to add pet. Please try again.' 
        });
    }
});

module.exports = router;
