
import express from 'express';
import dotenv from 'dotenv';
import { connectDb } from './confing/db.js';
import { createClient } from 'redis';
import { router } from './routes/user.js';
import { connectRabbitMq } from './confing/rabbitmq.js';


dotenv.config();

connectDb();

connectRabbitMq()

export const redisClient = createClient({
     url: process.env.REDIS_URL as string,
})

redisClient.connect().then(() =>console.log("connected to redis")).catch((err) => console.log("error connecting to redis", err))

const app = express();

app.use("api/v1", router)

const port = process.env.PORT;

app.listen(port, () => {
    console.log(`server is running on port ${port}`)
})
