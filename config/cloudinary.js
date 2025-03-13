const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "MISSING",
  api_key: process.env.CLOUDINARY_API_KEY || "MISSING",
  api_secret: process.env.CLOUDINARY_API_SECRET || "MISSING",
  secure: true
});

console.log("Cloudinary Config Loaded:");
console.log("Cloud Name:", cloudinary.config().cloud_name);
console.log("API Key:", cloudinary.config().api_key ? "Loaded" : "Missing");
console.log("API Secret:", cloudinary.config().api_secret ? "Loaded" : "Missing");

module.exports = cloudinary;
