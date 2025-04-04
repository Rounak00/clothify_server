const mongoose = require('mongoose');
const express = require('express');
const Order = require('../models/Order');
const router = express.Router();
const { verifyToken,isAdmin } = require('../middleware/authMiddleware');

router.get("/my-orders", verifyToken, async (req, res, next) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({createdAt:-1});
        return res.status(200).json({
            success: true,
            message: "Orders fetched successfully",
            data: orders,
        });
    } catch (err) {
        next(err);
    }
});
router.get("/:id", verifyToken, async (req, res, next) => {
    const { id } = req.params;
    try {
        const order = await Order.findById(id).populate("user", "name email");
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }
        return res.status(200).json({
            success: true,
            message: "Order fetched successfully",
            data: order,
        });
    } catch (err) {
        next(err);
    }
});
module.exports = router;