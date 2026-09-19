const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/petmate';

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('✅ Connected to MongoDB');
})
.catch((error) => {
    console.error('❌ MongoDB connection error:', error);
});

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true in production with HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname)));

// Serve uploaded images from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import routes
const authRoutes = require('./routes/auth');
const petRoutes = require('./routes/pets');
const adoptionRequestRoutes = require('./routes/adoptionRequests');
const adminRoutes = require('./routes/admin');

app.use('/api', authRoutes);
app.use('/api', petRoutes);
app.use('/api', adoptionRequestRoutes);
app.use('/api', adminRoutes);

// Serve HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/register.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'register.html'));
});

app.get('/status.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'status.html'));
});

app.get('/dashboard.html', async (req, res) => {
    // Check if user is logged in
    if (!req.session.userId) {
        return res.redirect('/login.html');
    }
    
    try {
        const User = require('./models/User');
        const user = await User.findById(req.session.userId);
        
        // If user is admin, redirect to admin dashboard
        if (user && user.role === 'admin' && user.status === 'active') {
            return res.redirect('/admin-dashboard.html');
        }
        
        res.sendFile(path.join(__dirname, 'dashboard.html'));
    } catch (error) {
        console.error('Error checking user access:', error);
        res.sendFile(path.join(__dirname, 'dashboard.html'));
    }
});

app.get('/admin-dashboard.html', async (req, res) => {
    // Check if user is logged in and is admin
    if (!req.session.userId) {
        return res.redirect('/login.html');
    }
    
    try {
        const User = require('./models/User');
        const user = await User.findById(req.session.userId);
        
        if (!user || user.role !== 'admin' || user.status !== 'active') {
            // Not an admin, redirect to appropriate dashboard
            if (user && user.role === 'user') {
                return res.redirect('/dashboard.html');
            }
            return res.redirect('/login.html');
        }
        
        res.sendFile(path.join(__dirname, 'admin-dashboard.html'));
    } catch (error) {
        console.error('Error checking admin access:', error);
        res.redirect('/login.html');
    }
});

// Logout route
app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to logout' });
        }
        res.clearCookie('connect.sid');
        res.json({ message: 'Logged out successfully' });
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
