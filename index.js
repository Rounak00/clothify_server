const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');
const connection = require('./utils/connection');
const PORT=require('./config').PORT;
const userRoutes = require('./routes/userRoutes');
const cartRoutes = require('./routes/cartRoutes');
const checkoutRoutes = require('./routes/checkoutRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const subscriberRoutes = require('./routes/subscriberRoute');
const adminRoutes = require('./routes/adminRoutes');
const redis_client = require('./utils/redisConnect');
const FRONTEND_URL=require('./config').FRONTEND_URL
const app = express();


app.use(express.json());
app.use(cors({
    origin: true,
    credentials: true,
  }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/clothify', (req, res, next) => {
    try{
        const health = {
			uptime: process.uptime(),
			responsetime: process.hrtime(),
			status: "All good",
			timestamp: Date.now(),
		};
        return res.status(200).send({success:true,message:"Welcome to Clothify REAST API Server", lisence:"MIT", health});
    }catch(err){
        next(err)
    }
})
app.use('/api/user', userRoutes);
app.use('/api/product', productRoutes);
app.use('/api/cart', cartRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/subscribe", subscriberRoutes);
app.use("/api/admin", adminRoutes);
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
    });
});

app.use(errorHandler);
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await connection();
  await redis_client;
});
