// require('dotenv').config({ path: "./.env" }) old way
import dotenv from 'dotenv'

import connectDB from "../src/db/index.js"

import { app } from './app.js';



dotenv.config({
    path: "./.env",
})

connectDB()
    .then(() => {
        app.on("error", (error) => {
            console.log(`Error while starting the app:${error}`);
            throw error;
        })

        app.listen(process.env.PORT || 8000, () => {
            console.log(`Server is running on port :${process.env.PORT}`);
        })
    })
    .catch((error) => {
        console.log("Database connection failed in main file!!!", error);
        throw error;
    });





/*
// One way to connect to database but is not optimal approach
import express from "express"

const app = express();

; (async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}}`)
        app.on("erroror", (erroror) => {
            console.log("erroror: ", erroror);
            throw erroror;
        })

        app.listen(process.env.PORT, () => {
            console.log(`App listening on port: ${process.env.PORT}`);

        })

    } catch (erroror) {
        console.log("erroror: ", erroror);
        throw erroror;
    }
})()
*/