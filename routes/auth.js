const express = require('express');
const router = express.Router();
const User = require('../models/User');

// POST /api/register - Register a new user
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({ 
                error: 'Name, email, and password are required' 
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ 
                error: 'Email already registered' 
            });
        }

        // Create new user (password will be hashed by pre-save hook)
        const user = new User({
            name,
            email: email.toLowerCase(),
            password,
            phone: phone || '',
            status: 'pending' // Set status to pending by default
        });

        await user.save();

        // Return success (do not log in automatically)
        res.status(201).json({ 
            message: 'Registration successful. Your account is pending approval.',
            userId: user._id
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            error: 'Registration failed. Please try again.' 
        });
    }
});

// POST /api/login - Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({ 
                error: 'Email and password are required' 
            });
        }

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({ 
                error: 'Invalid email or password' 
            });
        }

        // Verify password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ 
                error: 'Invalid email or password' 
            });
        }

        // Check account status and respond accordingly
        if (user.status === 'pending') {
            return res.json({ 
                redirect: 'status',
                message: 'Your account is pending approval'
            });
        } else if (user.status === 'blocked') {
            return res.status(403).json({ 
                error: 'Your account has been blocked. Please contact support.' 
            });
        } else if (user.status === 'active') {
            // Create session for active users
            req.session.userId = user._id.toString();
            req.session.userEmail = user.email;
            req.session.userName = user.name;
            
            return res.json({ 
                redirect: 'dashboard',
                message: 'Login successful'
            });
        } else {
            return res.status(500).json({ 
                error: 'Unknown account status' 
            });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            error: 'Login failed. Please try again.' 
        });
    }
});

// GET /api/user/status - Get current user's status
router.get('/user/status', async (req, res) => {
    try {
        // Check if user is logged in via session
        if (req.session.userId) {
            const user = await User.findById(req.session.userId);
            if (user) {
                return res.json({ 
                    status: user.status,
                    email: user.email
                });
            }
        }

        // If no session, check if email is provided in query
        const { email } = req.query;
        if (email) {
            const user = await User.findOne({ email: email.toLowerCase() });
            if (user) {
                return res.json({ 
                    status: user.status,
                    email: user.email
                });
            }
        }

        // No user found
        return res.status(404).json({ 
            error: 'User not found' 
        });
    } catch (error) {
        console.error('Status check error:', error);
        res.status(500).json({ 
            error: 'Failed to check status' 
        });
    }
});

module.exports = router;
