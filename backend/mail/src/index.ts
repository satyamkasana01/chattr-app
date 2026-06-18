import express from 'express';
import dotenv from 'dotenv'
import { StartSendOtpConsumer } from './consumer.js';

dotenv.config()

StartSendOtpConsumer()

const app = express()

const PORT = process.env.PORT

const server = app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`)
})
