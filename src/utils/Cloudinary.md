# What is Cloudinary ?

Cloudinary is a cloud-based media management platform that provides tools for storing, optimizing, and delivering images and videos efficiently. It offers a CDN (Content Delivery Network), automatic image/video transformations, and AI-powered optimizations to enhance performance.

# Why use Cloudinary instead of a Database ?

## Comparison Table

| Feature              | Cloudinary (or CDN)               | Database (SQL/NoSQL)       |
|----------------------|---------------------------------|----------------------------|
| **Performance**      | Fast, optimized delivery via CDN | Slower retrieval due to large file sizes |
| **Storage Cost**     | Cost-effective for media storage | Expensive for storing large binary data |
| **Image Optimization** | Automatic resizing, compression, and transformations | No built-in optimization features |
| **Scalability**      | Easily scalable with global caching | Hard to scale with large media files |
| **Storage Type**     | Cloud-based, URL-accessible media | Stored as BLOBs (binary large objects) |
| **Backup & Restore** | Simple backups, separate from app data | Large media increases backup/restore times |
| **Security**         | Secure URL access and transformations | Needs proper DB security configurations |
| **Ease of Access**   | Accessible via URL with various transformations | Requires additional processing to serve media |

### Best Practice: Hybrid Approach
- **Store only file URLs in the database**.
- **Use Cloudinary, AWS S3, or Firebase Storage** for actual file storage.

# How to use it ?

```javascript
import { v2 as cloudinary } from "cloudinary"; // Import Cloudinary SDK
import fs from "fs"; // Node.js built-in file system module

// Configure Cloudinary with credentials stored in environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME, // Cloudinary account name
    api_key: process.env.CLOUDINARY_API_KEY, // API key for authentication
    api_secret: process.env.CLOUDINARY_API_SECRET // API secret for secure access
});

/**
 * Function to upload a file to Cloudinary.
 * Process:
 * 1. Store the file temporarily on the local system.
 * 2. Upload the file to Cloudinary.
 * 3. Delete the temporary file after successful upload.
 *
 * @param {string} localFilePath - Path to the locally stored file.
 * @returns {object|null} - Cloudinary response or null if upload fails.
 */
const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null; // Return null if no file is provided

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto", // Automatically detect file type (image, video, etc.)
        });

        // Delete the local file after successful upload
        fs.unlinkSync(localFilePath);
        return response;
    } catch (error) {
        // If upload fails, remove the temporary file
        fs.unlinkSync(localFilePath);
        return null;
    }
};

export { uploadOnCloudinary };
```
