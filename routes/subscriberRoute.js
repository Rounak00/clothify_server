const express = require('express');
const router = express.Router();
const Subscriber = require('../models/Subscriber');

router.post('/', async (req, res, next) => {
    const { email } = req.body;
    try {
        let subscriber = await Subscriber.findOne({ email });
        if (subscriber) {
            return res.status(400).json({
                success: false,
                message: 'Subscriber already exists',
            });
        }
        subscriber = new Subscriber({ email });
        await subscriber.save();
        return res.status(201).json({
            success: true,
            message: 'Successfully subscribe to the newsletter!',
            data: subscriber,
        });
    } catch (err) {
        next(err);
    }
});
module.exports = router;