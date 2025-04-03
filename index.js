const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');
const connection = require('./utils/connection');
const PORT=require('./config').PORT;
const userRoutes = require('./routes/userRoutes');
const app = express();


app.use(express.json());
app.use(cors()); 
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
});