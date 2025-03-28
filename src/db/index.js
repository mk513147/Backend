import mongoose from "mongoose"
import { DB_NAME } from "../constants.js"

const connectDB = async () => {
    try {
        const response = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`Connection established!! \n DB host: ${response.connection.host}`);


    } catch (error) {
        console.log("MongoDB connection error in DB connection file:", error);
        process.exit(1);
    }
}

export default connectDB;