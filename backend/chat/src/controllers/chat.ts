import TryCatch from "../config/TryCatch.js";
import type { AuthenticatedRequest } from "../middlewares/isAuth.js";
import { Chat } from "../models/chat.js";

export const createNewChat = TryCatch(async(req: AuthenticatedRequest, res)=>{
    const userId = req.user?._id;
    const {otherUserId} = req.body
    if(!otherUserId){
        res.status(400).json({
            message: "other userid is required"
        })
        return
    }

    const existingChat = await Chat.findOne({
        users: {$all:[userId, otherUserId], $size: 2}
    })
    
    if(existingChat){
        res.json({
            message: "chat already exist",
            chatId: existingChat._id
        })
        return
    }

    const newChat = await Chat.create({
        users: [userId, otherUserId]
    })

    res.status(201).json({
        message: "New chat created",
        chatId: newChat._id
    })
})