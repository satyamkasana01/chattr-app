import express from 'express'
import dotenv from 'dotenv'
import { connectDb } from './config/db.js'
import routes from './routes/chat.js'
import cors from 'cors'
import { app, server } from './config/socket.js'

dotenv.config()
connectDb()



app.use(express.json())

app.use(cors())
app.use("/api/v1", routes)

const port = process.env.PORT

server.listen(port, ()=>{
    console.log(`Server is running on port ${port}`)
})
