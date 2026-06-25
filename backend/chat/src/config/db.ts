import mongoose from "mongoose";

import dns from "dns";

dns.setServers(["1.1.1.1","8.8.8.8"]);


 export const connectDb = async () => {
    const url = process.env.MONGO_URL;

    if (!url) {
        throw new Error("MONGO_URL is not defined in environment variables");
    }

    try {
        await mongoose.connect(url, {
            dbName: "Chatapp",
        });
        console.
        log("Connected to mongodb");
    } catch (error) {
        console.error("Failed to connect to Mongodb", error);
        process.exit(1);
    }
}