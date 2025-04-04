const mongoose = require('mongoose');
const products = require('./data/products');
const User = require('./models/User');
const Products = require('./models/Products');
const DB_URL = require('./config').DB_URL;

mongoose.connect(DB_URL)

const seedData=async()=>{
    try {
        await Products.deleteMany();
        await User.deleteMany();

        const createUser = await User.create({
            name:"Admin User",
            email:"admin@gmail.com",
            password:"123456",
            role:"admin",
        })

        const userId=createUser._id;
        const sampleProducts = products.map((product) => {
            return { ...product, user: userId };
        });

        const createdProducts = await Products.insertMany(sampleProducts);
        console.log('Data seeded successfully:', createdProducts.length, 'products added.');
        process.exit();
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);    
    } 
}

seedData();