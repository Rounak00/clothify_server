const express = require("express");
const Checkout = require("../models/Checkout");
const Order = require("../models/Order");
const Products = require("../models/Products");
const Cart = require("../models/Cart");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");

router.post("/", verifyToken, async (req, res, next) => {
  const { checkoutItems, shippingAddress, paymentMethod, totalPrice } =
    req.body;
  if (!checkoutItems || checkoutItems.length === 0) {
    return res.status(400).json({
      success: false,
      message: "No items in checkout",
    });
  }
  try {
    const checkout = await Checkout.create({
      user: req.user._id,
      checkoutItems,
      shippingAddress,
      paymentMethod,
      totalPrice,
      paymentSatus: "Pending",
      isPaid: false,
    });
    return res.status(200).json({
      success: true,
      message: "Checkout created successfully",
      data: checkout,
    });
  } catch (err) {
    next(err);
  }
});

router.put("/:id/pay", verifyToken, async (req, res, next) => {
  const { id } = req.params;
  const { paymentStatus, paymentDetails } = req.body;
  try {
    const checkout = await Checkout.findById(id);
    if (!checkout) {
      return res.status(404).json({
        success: false,
        message: "Checkout not found",
      });
    }
    if (paymentStatus === "Paid") {
      checkout.isPaid = true;
      checkout.paymentStatus = paymentStatus;
      checkout.paymentDetails = paymentDetails;
      checkout.paidAt = Date.now();
      await checkout.save();
      return res.status(200).json({
        success: true,
        message: "Checkout updated successfully",
        data: checkout,
      });
    }else{
        res.status(400).json({
            success: false,
            message: "Invalid payment status",
        });
    }
  } catch (err) {
    next(err);
  }
});

router.post("/:id/finalize", verifyToken, async (req, res, next) => {
    const { id } = req.params;
    try {
        const checkout = await Checkout.findById(id);
        if (!checkout) {
        return res.status(404).json({
            success: false,
            message: "Checkout not found",
        });
        }
        if(checkout.isPaid && !checkout.isFinalized){
            const order = await Order.create({
                user: req.user._id,
                orderItems: checkout.checkoutItems,
                shippingAddress: checkout.shippingAddress,
                paymentMethod: checkout.paymentMethod,
                totalPrice: checkout.totalPrice,
                isPaid: true,
                paidAt: checkout.paidAt,
                isDelivered: false,
                paymentStatus:"paid",
                paymentDetails: checkout.paymentDetails,
                });
            checkout.isFinalized = true;
            checkout.finalizedAt = Date.now();
            await checkout.save();
            await Cart.deleteMany({ user: req.user._id });
            return res.status(200).json({
                success: true,
                message: "Order created successfully",
                data: order,
                });
        }else if(checkout.isFinalized){
            return res.status(400).json({
                success: false,
                message: "Checkout already finalized",
            });
        }
        else{
            return res.status(400).json({
                success: false,
                message: "Checkout not paid",
            });
        }
    } catch (err) {
        next(err);
    }
});
module.exports = router;
