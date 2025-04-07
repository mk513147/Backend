import multer from "multer";

const storage = multer.diskStorage({// stores the file in disk storage as the name says
    destination: function (req, file, cb) {
        cb(null, "./public/temp")  // A callback for address of the file
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname) // A callback for path/name of the file
    }
})

export const upload = multer({
    storage,
})