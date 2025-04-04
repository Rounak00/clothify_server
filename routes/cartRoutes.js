const express = require("express");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");
const Products = require("../models/Products");
const Cart = require("../models/Cart");
const router = express.Router();

const getCart = async (userId, guestId) => {
  if (userId) {
    return await Cart.findOne({ user: userId });
  } else if (guestId) {
    return await Cart.findOne({ guestId: guestId });
  } else {
    return null;
  }
};
router.post("/", async (req, res, next) => {
  try {
    const { userId, guestId, color, size, quantity, productId } = req.body;
    const product = await Products.findById(productId);
    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    let cart = await getCart(userId, guestId);
    if (cart) {
      const productIndex = cart.products.findIndex(
        (p) =>
          p.productId.toString() === productId &&
          p.size === size &&
          p.color === color
      );
      if (productIndex > -1) {
        cart.products[productIndex].quantity += quantity;
      } else {
        cart.products.push({
          productId,
          name: product.name,
          image: product.images[0].url,
          price: product.price,
          size,
          color,
          quantity,
        });
      }
      cart.totalPrice = cart.products.reduce((acc, item) => {
        return acc + item.price * item.quantity;
      }, 0);

      await cart.save();
      return res.status(200).json({
        success: true,
        message: "Product added to cart",
        data: cart,
      });
    } else {
      const newCart = await Cart.create({
        user: userId ? userId : undefined,
        guestId: guestId ? guestId : "guest_" + new Date().getTime(),
        products: [
          {
            productId,
            name: product.name,
            image: product.images[0].url,
            price: product.price,
            size,
            color,
            quantity,
          },
        ],
        totalPrice: product.price * quantity,
      });
      return res.status(200).json({
        success: true,
        message: "Product added to cart",
        data: newCart,
      });
    }
  } catch (err) {
    next(err);
  }
});

router.put("/", async (req, res, next) => {
  const { productId, quantity, size, color, guestId, userId } = req.body;
  try {
    let cart = await getCart(userId, guestId);
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }
    const productIndex = cart.products.findIndex(
      (p) =>
        p.productId.toString() === productId &&
        p.size === size &&
        p.color === color
    );

    if (productIndex > -1) {
      if (quantity > 0) {
        cart.products[productIndex].quantity = quantity;
      } else {
        cart.products.splice(productIndex, 1);
      }

      cart.totalPrice = cart.products.reduce((acc, item) => {
        return acc + item.price * item.quantity;
      }, 0);
      await cart.save();
      return res.status(200).json({
        success: true,
        message: "Cart updated successfully",
        data: cart,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "Product not found in cart",
      });
    }
  } catch (err) {
    next(err);
  }
});

router.delete("/", async (req, res, next) => {
  const { productId, size, color, guestId, userId } = req.body;
  try {
    let cart = await getCart(userId, guestId);
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }
    const productIndex = cart.products.findIndex(
      (p) =>
        p.productId.toString() === productId &&
        p.size === size &&
        p.color === color
    );

    if (productIndex > -1) {
      cart.products.splice(productIndex, 1);
      cart.totalPrice = cart.products.reduce((acc, item) => {
        return acc + item.price * item.quantity;
      }, 0);
      await cart.save();
      return res.status(200).json({
        success: true,
        message: "Product removed from cart",
        data: cart,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "Product not found in cart",
      });
    }
  } catch (err) {
    next(err);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const { userId, guestId } = req.query;
    if (!userId && !guestId) {
      return res.status(400).json({
        success: false,
        message: "UserId or GuestId is required",
      });
    }
    let cart = await getCart(userId, guestId);
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Cart fetched successfully",
      data: cart,
    });
  } catch (err) {
    next(err);
  }
});
router.post("/merge", verifyToken, async (req, res, next) => {
  const { guestId } = req.body;
  try {
    const guestCart = await Cart.findOne({ guestId });
    const userCart = await Cart.findOne({ user: req.user.id });

    if (guestCart) {
      //merge in usercart
      if (guestCart.products.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Guest cart is empty",
        });
      }
      if (userCart) {
        guestCart.products.forEach((item) => {
          const productIndex = userCart.products.findIndex(
            (p) =>
              p.productId.toString() === item.productId.toString() &&
              p.size === item.size &&
              p.color === item.color
          );
          if (productIndex > -1) {
            userCart.products[productIndex].quantity += item.quantity;
          } else {
            userCart.products.push(item);
          }
        });
        userCart.totalPrice = userCart.products.reduce((acc, item) => {
          return acc + item.price * item.quantity;
        }, 0);
        await userCart.save();
        await Cart.findOneAndDelete({ guestId });
        return res.status(200).json({
          success: true,
          message: "Cart merged successfully",
          data: userCart,
        });
      }else{
        guestCart.user = req.user.id;
        guestCart.guestId = undefined;
        await guestCart.save();
        return res.status(200).json({
          success: true,
          message: "Cart merged successfully",
          data: guestCart,
        });
      }
    }else{
        if(userCart){
            return res.status(200).json({
                success: true,
                message: "Cart fetched successfully",
                data: userCart,
              });
        }
        return res.status(404).json({
            success: false,
            message: "Cart not found",
        });
    }
  } catch (err) {
    next(err);
  }
});
module.exports = router;
