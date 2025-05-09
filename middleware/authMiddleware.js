const JWT_SECRET = require("../config").JWT_SECRET;
const jwt = require("jsonwebtoken");
const CustomErrorHandler = require("../services/customErrorHandler");
const User = require("../models/User");
const redis_client = require("../utils/redisConnect");

const verifyToken = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else {
    return next(CustomErrorHandler.wrongCredentials("Not authorised, no token provieded"));
  }
  if (!token) {
    return next(CustomErrorHandler.wrongCredentials("Not authorised, no token provieded"));
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const redis_exists = await redis_client.exists(token);
    if(redis_exists){
        const redis_data = await redis_client.get(token);
        req.user = JSON.parse(redis_data);
        return next();
    }
    req.user = await User.findById(decoded.user.id).select("-password");
    next();
  } catch (err) {
    console.log(err.message);
    return next(
      CustomErrorHandler.wrongCredentials("Not authorised, Bearer token failed")
    );
  }
};

const isAdmin = async(req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return next(CustomErrorHandler.unAuthorized("Not authorized as an admin"));
  }
}
module.exports = {verifyToken,isAdmin};
