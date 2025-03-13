const cloudinary = require('../config/cloudinary');

const uploadToCloudinary = async (filePath) => {
    try {
        console.log("Uploading file to Cloudinary:", filePath); // Debugging step

        const result = await cloudinary.uploader.upload(filePath, {
            timeout: 120000 // Increase timeout to 120 seconds (2 minutes)
        });

        console.log("Upload successful:", result); // Debugging step

        return {
            url: result.secure_url,
            publicId: result.public_id
        };
    } catch (error) {
        console.error("Cloudinary Upload Error:", JSON.stringify(error, null, 2)); // Show full error details
        throw new Error(error.message || "Error while uploading to Cloudinary");
    }
};

module.exports = {
    uploadToCloudinary
};
