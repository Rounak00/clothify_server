const { required } = require('joi');
const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name:{type:String, required:true, trim:true},
    description:{type:String, required:true, trim:true},
    price:{type:Number, required:true},
    discountPrice:{type:Number},
    countInStock:{type:Number, required:true, default:0},
    sku:{type:String, required:true, unique:true},
    category:{type:String, required:true},
    brand:{type:String},
    sizes:{type:[String], required:true},
    colors:{type:[String], required:true},
    material:{type:String},
    collections:{type:String,required:true},
    gender:{type:String, enum:["Men","Women","Unisex"]},
    images:[{url:{type:String},altText:{type:String}}],
    isFeatured:{type:Boolean, default:false},
    isPublished:{type:Boolean, default:false},
    rating:{type:Number, default:0},
    numReviews:{type:Number, default:0},
    tags:[String],
    user:{type:mongoose.Schema.Types.ObjectId, ref:'User',required:true},
    metaTitle:{type:String},
    metaDescription:{type:String},
    metaKeywords:{type:String},
    dimensions:{
        length:{type:Number},
        width:{type:Number},
        height:{type:Number},
    },
    weight:{type:Number},    
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);