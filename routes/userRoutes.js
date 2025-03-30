const express = require('express');
const router = express.Router();    
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const JWT_SECRET = require('../config').JWT_SECRET;

router.post('/register', async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        let user= await User.findOne({ email });
        if (user) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }
        user = new User({ name, email, password });
        await user.save();

        const payload = {user : {id: user._id, role: user.role}};
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
        const { password: _, ...data } = user._doc;
    
        res.status(201).json({ success: true, message: 'User registered successfully', token, data });
        
    } catch (error) {
        next(error);
    }
});

module.exports= router;