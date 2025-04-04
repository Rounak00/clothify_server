const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Products = require('../models/Products');
const Order = require('../models/Order');

router.get("/all-users", verifyToken, isAdmin, async (req, res, next) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: users,
    });
  } catch (err) {
    next(err);
  }
});
router.post("/add-user", verifyToken, isAdmin, async (req, res, next) => {
    try{
        const {name,email,role,password}=req.body;
        let user= await User.findOne({email});
        if(user){
            return res.status(400).json({
                success:false,
                message:"User already exists",
            });
        }
        user= new User({name,email,role:role||"customer",password});
        await user.save();
        return res.status(201).json({
            success:true,
            message:"User created successfully",
            data:user,
        });
    }catch(err){
        next(err);
    }
});

router.put("/update-user/:id", verifyToken, isAdmin, async (req, res, next) => {
  const { id } = req.params;
  const { name, email, role } = req.body;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;
    await user.save();
    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  } catch (err) {
    next(err);
  }
});

router.delete("/delete-user/:id", verifyToken, isAdmin, async (req, res, next) => {
    const {id}=req.params;
    try{
        const user= await User.findById(id);
        if(!user){
            return res.status(404).json({
                success:false,
                message:"User not found",
            });
        }
        await user.deleteOne();
        return res.status(200).json({
            success:true,
            message:"User deleted successfully",
        });
    }catch(err){
        next(err);
    }   
});

router.get("/all-products", verifyToken, isAdmin, async (req, res, next) => {
    try {
        const products = await Products.find({}).sort({ createdAt: -1 });
        return res.status(200).json({
        success: true,
        message: "Products fetched successfully",
        data: products,
        });
    } catch (err) {
        next(err);
    }
})

router.get("/all-orders", verifyToken, isAdmin, async (req, res, next) => {
    try {
        const orders = await Order.find({}).sort({ createdAt: -1 }).populate("user", "name email");
        return res.status(200).json({
            success: true,
            message: "Orders fetched successfully",
            data: orders,
        });
    } catch (err) {
        next(err);
    }
})

router.put("/update-order-status/:id", verifyToken, isAdmin, async (req, res, next) => {
    try{
        const order=await Order.findById(req.params.id);
        if(!order){
            return res.status(404).json({
                success:false,
                message:"Order not found",
            });
        }
        order.status=req.body.status || order.status;
        order.isDelivered=req.body.status==="Delivered" ? true : order.isDelivered;
        order.deliveredAt=req.body.status==="Delivered" ? Date.now() : order.deliveredAt;
        const updatedOrder=await order.save();
        return res.status(200).json({
            success:true,
            message:"Order status updated successfully",
            data:updatedOrder,
        });
    }catch(err){
        next(err);
    }
})

router.delete("/delete-order/:id", verifyToken, isAdmin, async (req, res, next) => {
    const {id}=req.params;
    try{
        const order= await Order.findById(id);
        if(!order){
            return res.status(404).json({
                success:false,
                message:"Order not found",
            });
        }
        await order.deleteOne();
        return res.status(200).json({
            success:true,
            message:"Order deleted successfully",
        });
    }catch(err){
        next(err);
    }   
});

module.exports = router;