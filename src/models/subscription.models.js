import mongoose, { Schema, model } from "mongoose";

const subscritptionSchema = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    channel: {
        type: Schema.Types.ObjectId,
        ref: "User",
    }
}, { timestamps: true });

export const Subscription = model("Subscription", subscritptionSchema);