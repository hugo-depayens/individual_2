const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.register = (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    User.findByEmail(email, (err, user) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err.message });
        if (user) return res.status(400).json({ message: 'Email already exists' });

        User.create({ username, email, password }, (err, result) => {
            if (err) return res.status(500).json({ message: 'Error registering user', error: err.message });
            res.status(201).json({ message: 'User registered successfully', userId: result.id });
        });
    });
};

exports.login = (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    User.findByEmail(email, (err, user) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err.message });
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });

        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) return res.status(500).json({ message: 'Error comparing passwords', error: err.message });
            if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

            const tokenPayload = {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            };
            const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.json({ message: 'Login successful', token, user: tokenPayload });
        });
    });
};