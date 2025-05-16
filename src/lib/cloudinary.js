import {v2 as cloudinary} from "cloudinary";
import "dotenv/config";

console.log("cloudinary/ end", process.env.CLOUDINARY_API_KEY.slice(-5)); 

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;