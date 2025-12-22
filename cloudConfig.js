// TOP of cloudConfig.js (for debugging)
// console.log("Cloud Name:", process.env.CLOUD_NAME); 
// console.log("API Key:", process.env.CLOUD_API_KEY);

const cloudinary = require('cloudinary');
const CloudinaryStorage = require('multer-storage-cloudinary');

cloudinary.v2.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
})

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'wanderlust_DEV',
      allowedFormat: ["png","jpg","jpeg"], // supports promises as well
    },
});

module.exports = {
    cloudinary,
    storage
}