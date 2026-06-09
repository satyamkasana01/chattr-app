
import express from 'express';
import dotenv from 'dotenv';
import { connectDb } from './confing/db.js';


dotenv.config();
connectDb();

const app = express();

const port = process.env.PORT;

app.listen(port, () => {
    console.log(`server is running on port ${port}`)
})