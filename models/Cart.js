const mongoose= require('mongoose');
const User = require('./User');

const CartItemSchema = new mongoose.Schema({
    productId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Products',
        required: true
    },
    name:String,
    image:String,
    price:String,
    size:String,
    color:String,
    quantity:{
        type:Number,
        default:1
    },
}, {_id:false});

const CartSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: User,
    },
    guestId:{
        type:String,
    },
    products:[CartItemSchema],
    totalPrice:{
        type:Number,
        default:0,
        required:true
    },
},{timestamps:true});

module.exports= mongoose.model('Cart', CartSchema);