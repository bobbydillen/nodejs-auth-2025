const Image = require('../models/Image');
const {uploadToCloudinary} = require('../helpers/cloudinaryHelpers');
const fs = require('fs');
const cloudinary = require('../config/cloudinary')


const uploadImageController = async(req, res)=>{
    try {
        //check if file is missing
        if(!req.file){
            return res.status(400).json({
                success : false,
                message : 'File is required. Please Upload Image'
            })
        }
        //upload
        const {url, publicId} = await uploadToCloudinary(req.file.path)

        //store the image
        const newlyUploadedImage = new Image({
            url,
            publicId,
            uploadedBy : req.userInfo.userId
        })
        await newlyUploadedImage.save();

        //delete the image from local storage
        fs.unlinkSync(req.file.path);

        res.status(201).json({
            success : true,
            message : 'Image Uploaded Successfully',
            image : newlyUploadedImage
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success : false,
            message : 'Something Went Wrong!'
        })
    }
}

const fetchImagesController = async(req, res)=>{
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) ||5;
        const skip = (page-1) * limit;

        const sortBy = req.query.sortBy || 'createdAt';
        const sortOrder = req.query.sortOrder === 'asc'? 1 : -1;
        const totalImages = await Image.countDocuments();
        const totalPages = Math.ceil(totalImages/limit)

        const sortObj = {};
        sortObj[sortBy] = sortOrder
        const images = await Image.find().sort(sortObj).skip(skip).limit(limit);

        if(images){
            res.status(200).json({
                status : true,
                currentPage : page,
                totalPages : totalPages,
                totalImages : totalImages,
                data : images
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success : false,
            message : 'Something Went Wrong!'
        })
    }
}

const deleteImageController = async(req, res) =>{
    try {
        const getCurrentIfOfImageToBeDeleted = req.params.id;
        const userId = req.userInfo.userId;
        
        const image = await Image.findById(getCurrentIfOfImageToBeDeleted);
        if(!image){
            return res.status(400).json({
                success : false,
                message : 'Image is not found '
            })
        }
        //check if image is uploaded by current user 
        if(image.uploadedBy.toString()!==userId){
            return res.status(400).json({
                success : false,
                message : 'You are not allowed to delete the image '
            })
        }
        //delete the image from cloudinary
        await cloudinary.uploader.destroy(image.publicId);

        //delete image from  mongo db
        await Image.findByIdAndDelete(getCurrentIfOfImageToBeDeleted);

        res.status(200).json({
            success : true,
            message : 'Image deleted successfully'
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success : false,
            message : 'Something Went Wrong!'
        })
    }
}

module.exports = {
       uploadImageController,
       fetchImagesController,
       deleteImageController
};