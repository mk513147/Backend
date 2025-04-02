## File Upload with Multer Explained

### **What is Multer?**  
Multer is a middleware for handling **multipart/form-data**, commonly used for uploading files in Node.js applications.

Think of **Multer** as a **file handler** that:
- Accepts a file from the client.
- Stores it in a specified location.
- Gives it a unique name (if needed).

---

### **Step-by-Step Explanation of File Upload Code**

#### **1️⃣ Import Multer**
```javascript
import multer from "multer";
```
- This imports `multer`, which is required for file uploads.

---

#### **2️⃣ Configure Storage for Uploaded Files**
```javascript
const storage = multer.diskStorage({
```
- `.diskStorage()` tells Multer to store files **on disk** instead of memory.

---

#### **3️⃣ Define the Destination for Uploaded Files**
```javascript
destination: function (req, file, cb) {
    cb(null, "./public/temp")
},
```
- This function sets the **destination folder** where uploaded files are stored.
- `cb(null, "./public/temp")` means files will be saved in the `public/temp` directory.

---

#### **4️⃣ Define the Filename Format**
```javascript
filename: function (req, file, cb) {
    cb(null, file.originalname)
}
```
- This function sets the **file name** when saved.
- `file.originalname` keeps the original file name (can be modified for uniqueness).

---

#### **5️⃣ Create the Multer Upload Middleware**
```javascript
export const upload = multer({
    storage,
});
```
- `multer({ storage })` initializes Multer with the defined **storage settings**.
- `upload` can now be used in routes to handle file uploads.

---

### **How This Middleware Works in a Route**

```javascript
import express from "express";
import { upload } from "./middlewares/uploadMiddleware.js";

const router = express.Router();

router.post("/upload", upload.single("file"), (req, res) => {
    res.json({ message: "File uploaded successfully", filename: req.file.filename });
});

export default router;
```

- When a `POST` request is made to `/upload`:
  1. `upload.single("file")` **accepts a single file** from the form input named `file`.
  2. Multer **stores the file** in `public/temp`.
  3. The route handler responds with a success message.

---

### **Summary**
✅ **Multer** is used to handle file uploads in Node.js.  
✅ `.diskStorage()` saves files to disk instead of memory.  
✅ Files are stored in `./public/temp` with their **original name**.  
✅ `upload` middleware can be used in routes to process file uploads.  

Would you like to add file validation or size limits? 🚀
