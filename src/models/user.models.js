import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";// Used for hashing password
import jwt from "jsonwebtoken";// Used for generating tokens(think of it like a ticket you need to get while entering a park)

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        index: true,// use this when you want to search through the item but not in many as it is a bit heavy operation
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    fullName: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    avtar: {
        type: String, //cloudinary url
        required: true,
    },
    coverImage: {
        type: String, //cloudinary url
    },
    password: {
        type: String,
        required: [true, "Password is required"],
    },
    watchHistory: [{
        type: Schema.Types.ObjectId,
        ref: "Video",
        required: true,
    }],
    refreshTokens: {
        type: String,
    }

}, { timestamps: true })

// This function/middleware runs just before saving the data into the database
// and it accepts an property and a function (use async as doing work with the database may take time)
// NOTE: do not use an arrow function here as it does not give us the context of current object(this)
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();// The is modified function 
    this.password = await bcrypt.hash(this.password, 10);
    next();
})


//We can define our own functions in mongoose like this
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt(password, this.password);
}


// JWT (jsonwebtokens)
// Generates tokens with the mention field
userSchema.methods.generateAccessToken = function () {
    return jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username,
        fullName: this.fullName,
    },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: ACCESS_TOKEN_EXPIRY,
        })
};

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign({
        _id: this._id,
    },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: REFRESH_TOKEN_EXPIRY,
        })
};



export const User = mongoose.model("User", userSchema)
