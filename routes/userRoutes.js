const express = require('express');
const router = express.Router();    
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const  CustomErrorHandler  = require('../services/customErrorHandler');
const {verifyToken} = require('../middleware/authMiddleware');
const redis_client = require('../utils/redisConnect');
const JWT_SECRET = require('../config').JWT_SECRET;
const {loginSchema, registerSchema}=require('../validators');


router.post('/register', async (req, res, next) => {
    try {
        await registerSchema.validateAsync(req.body);
        const { name, email, password } = req.body;
        let user= await User.findOne({ email });
        if (user) {
            return next(CustomErrorHandler.alreadyExist("User already exists"));
            // return res.status(400).json({ success: false, message: 'User already exists' });
        }
        user = new User({ name, email, password });
        await user.save();

        const payload = {user : {id: user._id, role: user.role}};
        const token = jwt.sign(payload, JWT_SECRET,{expiresIn: '7d'});
        const { password: _, ...data } = user._doc;
        await redis_client.set(token, JSON.stringify(data), 'EX', 180);
        res.status(201).json({ success: true, message: 'User registered successfully', token, data });
        
    } catch (error) {
        next(error);
    }
});

router.post('/login', async (req, res, next) => {
    const {email,password}=req.body;
    try{
        await loginSchema.validateAsync(req.body);
        let user= await User.findOne({email});
        if(!user){
            return next(CustomErrorHandler.wrongCredentials());
        }
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return next(CustomErrorHandler.wrongCredentials());
        }
        const payload = {user : {id: user._id, role: user.role}};
        const token = jwt.sign(payload, JWT_SECRET,{expiresIn: '7d'});
        const { password: _, ...data } = user._doc;
        await redis_client.set(token, JSON.stringify(data), 'EX', 180);
        res.status(200).json({ success: true, message: 'User logedin successfully', token, data });
    }catch(err){
        next(err);
    }
})

router.get('/profile', verifyToken, async(req, res, next) => {
     try{
     res.status(200).json({ success: true,  data:req.user });
     }catch(err){
        next(err);
     }
})

module.exports= router;