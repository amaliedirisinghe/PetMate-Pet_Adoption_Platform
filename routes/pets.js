const express = require('express');
const router = express.Router();
const Pet = require('../models/Pet');
const User = require('../models/User');

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

// POST /api/pets - Add a new pet (requires authentication)
router.post('/pets', requireAuth, async (req, res) => {
    try {
        const { name, type, age, description, photo } = req.body;

        // Validate required fields
        if (!name || !type || !age || !description) {
            return res.status(400).json({ 
                error: 'Name, type, age, and description are required' 
            });
        }

        // Create new pet with status = "pending"
        const pet = new Pet({
            name,
            type,
            age: parseInt(age),
            description,
            photo: photo || 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=400&h=300&fit=crop',
            addedBy: req.session.userId,
            status: 'pending' // Set status to pending for admin approval
        });

        await pet.save();

        // Populate addedBy field
        await pet.populate('addedBy', 'name email');

        res.status(201).json({ 
            message: 'Pet added successfully. Waiting for admin approval.',
            pet 
        });
    } catch (error) {
        console.error('Error adding pet:', error);
        res.status(500).json({ 
            error: 'Failed to add pet. Please try again.' 
        });
    }
});

module.exports = router;
