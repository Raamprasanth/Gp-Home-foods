const express = require('express');
const router = express.Router();
const User = require('../models/User');

// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        // First try to check the database
        let user = null;
        try {
            user = await User.findOne({ username });
        } catch (dbError) {
            console.error('DB not connected yet, falling back to hardcoded default...');
        }

        // Hardcoded default check requested by user
        if (!user && username === 'GP Admin' && password === 'gphf@123') {
            return res.status(200).json({ message: 'Login successful (Default Admin)', token: 'mock-jwt-token' });
        }

        // Database user check
        if (user && user.password === password) {
            // In a real app, verify hashed password and generate a JWT token here
            return res.status(200).json({ message: 'Login successful', token: 'mock-jwt-token' });
        } else {
            return res.status(401).json({ error: 'Invalid username or password' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
});

module.exports = router;
