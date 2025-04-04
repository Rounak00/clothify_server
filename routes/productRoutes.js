const express = require("express");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");
const Products = require("../models/Products");
const router = express.Router();

router.post("/", verifyToken, isAdmin, async (req, res, next) => {
  try {
    const {
      name,
      description,
      price,
      discountPrice,
      countInStock,
      category,
      brand,
      sizes,
      colors,
      material,
      gender,
      images,
      collections,
      tags,
      sku,
      isFeatured,
      isPublished,
      dimensions,
      weight,
    } = req.body;

    const product = new Products({
      name,
      description,
      price,
      discountPrice,
      countInStock,
      category,
      brand,
      sizes,
      colors,
      material,
      gender,
      images,
      collections,
      tags,
      sku,
      isFeatured,
      isPublished,
      dimensions,
      weight,
      user: req.user._id,
    });

    const createdProduct = await product.save();
    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: createdProduct,
    });
  } catch (err) {
    next(err);
  }
});

router.put(
  "/:id",
  verifyToken,
  isAdmin,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const {
        name,
        description,
        price,
        discountPrice,
        countInStock,
        category,
        brand,
        sizes,
        colors,
        material,
        gender,
        images,
        collections,
        tags,
        sku,
        isFeatured,
        isPublished,
        dimensions,
        weight,
      } = req.body;
      const product = await Products.findById(id);
      if (product) {
        product.name = name || product.name;
        product.description = description || product.description;
        product.price = price || product.price;
        product.discountPrice = discountPrice || product.discountPrice;
        product.countInStock = countInStock || product.countInStock;
        product.category = category || product.category;
        product.brand = brand || product.brand;
        product.sizes = sizes || product.sizes;
        product.colors = colors || product.colors;
        product.material = material || product.material;
        product.collections = collections || product.collections;
        product.tags = tags || product.tags;
        product.sku = sku || product.sku;
        product.isFeatured = isFeatured !== undefined? isFeatured:product.isFeatured;
        product.isPublished = isPublished !== undefined? isPublished: product.isPublished;
        product.dimensions = dimensions || product.dimensions;
        product.weight = weight || product.weight;
        product.gender= gender|| product.gender;
        product.images = images || product.images;

        const updatedProduct = await product.save();
        res.status(200).json({
          success: true,
          message: "Product updated successfully",
          data: updatedProduct,
        });
      }else {
        res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }
    
    } catch (err) {
      next(err);
    }
  }
);

router.delete("/:id", verifyToken, isAdmin, async (req, res, next) => {
   try{
    const prouct= await Products.findById(req.params.id);
    if(!prouct){
        return res.status(404).json({
            success:false,
            message:"Product not found",
        });
    }
    await prouct.deleteOne();
    res.status(200).json({
        success:true,
        message:"Product deleted successfully",
    });
   }catch(err){next(err)};
});

router.get("/", async (req, res, next) => {
  try{
    const {collection,size,gender,color,minPrice,maxPrice, sortBy, search,category, material,brand,limit} = req.query;

    let query = {};
    let sort={};

    if(collection && collection.toLowerCase() !== "all"){
       query.collection = collection;
    }
    if(category && category.toLowerCase() !== "all"){
        query.category = category;
    }
    if(material){
        query.material ={$in:material.split(",")};
    }
    if(brand){
        query.brand ={$in:brand.split(",")};
    }
    if(size){
        query.sizes ={$in:size.split(",")};
    }

    if(color){
        query.colors ={$in:[color]};
    }
    if(gender){
        query.gender =gender;
    }
    if(minPrice || maxPrice){
        query.price = {};
        if(minPrice){
            query.price.$gte = minPrice;
        }
        if(maxPrice){
            query.price.$lte = maxPrice;
        } 
    }
    if(search){
        query.$or=[
          {name:{$regex:search,$options:"i"}},
          {description:{$regex:search,$options:"i"}}
        ];
    }
    if(sortBy){
      switch(sortBy){
        case "priceAsc":
          sort={price:1};
          break;
        case "priceDesc":
          sort={price:-1};
          break;
        case "popularity": 
          sort={rating:-1};
          break;
        default:
          break;
      }
    }
   
    let products=await Products.find(query).sort(sort).limit(Number(limit) || 0);
    res.status(200).json({
        success:true,
        data:products,
    });
  }catch(err){
    next(err);
  }
});
router.get("/new-arrivals", async (req, res, next) => {
  try{
    const products= await Products.find().sort({createdAt:-1 }).limit(8);
    res.status(200).json({
        success:true,
        data:products,
    });
  }catch(err){
    next(err);
  }
});
router.get("/best-seller", async (req, res, next) => {
  try{
    const bestSeller= await Products.findOne().sort({rating:-1});
    if(!bestSeller){
        return res.status(404).json({
            success:false,
            message:"Best seller not found",
        });
    }

    res.status(200).json({
        success:true,
        data:bestSeller,
    });
  }catch(err){
    next(err);
  }
});
router.get("/:id", async (req, res, next) => {
  try{
    const product= await Products.findById(req.params.id);
    if(!product){
        return res.status(404).json({
            success:false,
            message:"Product not found",
        });
    }
    res.status(200).json({
        success:true,
        data:product,
    });
  }catch(err){
    next(err);
  }
});

router.get("/similar/:id", async (req, res, next) => {
    try{
      const product= await Products.findById(req.params.id);
      if(!product){
          return res.status(404).json({
              success:false,
              message:"Product not found",
          });
      }
      const similarProducts= await Products.find({
        _id:{$ne:product._id},
        gender:product.gender,
        category:product.category,
      }).limit(4);

      res.status(200).json({
          success:true,
          data:similarProducts,
      }); 
    }catch(err){
        next(err);
    }
});

router.get("/best-seller", async (req, res, next) => {
  try{
    const products= await Products.find({isFeatured:true}).limit(4);
    res.status(200).json({
        success:true,
        data:products,
    });
  }catch(err){
    next(err);
  }
});
module.exports = router;