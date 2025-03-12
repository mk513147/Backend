import { v2 as cloudinary } from "cloudinary";// Online service like AWS to stores files
import fs from "fs";// Node inbuilt file system

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// FUnction to upload file on cloudinary
// store file locally(temp) ---> upload online ---> unlink/delete local file
const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",// tells wwhat is the file type
        })
        console.log(`File uploaded successfully!!`);
        console.log(`File url: ${response.url}`);
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}

export { uploadOnCloudinary }