import express from 'express'
import dotenv from 'dotenv'
import { connectDb } from './config/db.js'
import routes from './routes/chat.js'

dotenv.config()
connectDb()

const app = express()

app.use(express.json())
app.use("/api/v1", routes)

const port = process.env.PORT

app.listen(port, ()=>{
    console.log(`Server is running on port ${port}`)
})
