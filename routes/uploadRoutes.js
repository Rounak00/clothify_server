const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const { verifyToken,isAdmin } = require('../middleware/authMiddleware');
const {CLOUDINARY_CLOUD_NAME,CLOUDINARY_API_KEY,CLOUDINARY_API_SECRET} = require('../config');
cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/',  upload.single('image'), async(req, res,next) => {
    try{
        if(!req.file){
            return res.status(400).json({
                success:false,
                message:"No file uploaded",
            })
        }
        const streamUpload = (fileBuffer) => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream({folder:"Clothify"},(error, result) => {
                    if (result) {
                        resolve(result);
                    } else {
                        reject(error);
                    }
                });
                streamifier.createReadStream(fileBuffer).pipe(stream);
            });
        }

        const result = await streamUpload(req.file.buffer);
        return res.status(200).json({
            success:true,
            message:"File uploaded successfully",
            data:result.secure_url,
        })  
    }catch(err){
        next(err);
    }
})

router.delete('/cloudinary-delete', verifyToken, isAdmin, async (req, res, next) => {
    try {
      const { imageUrl } = req.body;
  
      if (!imageUrl) {
        return res.status(400).json({
          success: false,
          message: 'Image URL is required',
        });
      }
  
      // Extract public ID from URL
      const parts = imageUrl.split('/');
      const fileName = parts[parts.length - 1].split('.')[0]; // without extension
      const folderName = parts[parts.length - 2]; // "Clothify"
      const publicId = `${folderName}/${fileName}`;
  
      const result = await cloudinary.uploader.destroy(publicId);
  
      if (result.result !== 'ok') {
        return res.status(500).json({
          success: false,
          message: 'Failed to delete image from Cloudinary',
          result,
        });
      }
  
      return res.status(200).json({
        success: true,
        message: 'Image deleted successfully',
        result,
      });
    } catch (err) {
      next(err);
    }
  });


 
module.exports = router;