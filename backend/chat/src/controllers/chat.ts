import axios from "axios";
import TryCatch from "../config/TryCatch.js";
import type { AuthenticatedRequest } from "../middlewares/isAuth.js";
import { Chat } from "../models/chat.js";
import { Message } from "../models/Message.js";

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

export const getAllChats = TryCatch(async(req:AuthenticatedRequest, res)=>{
    const userId = req.user?._id;
    if(!userId){
        res.status(400).json({
            message: "UserId missing"
        })
        return 
    }

    const chats = await Chat.find({users: userId}).sort({updatedAt: -1})

    const chatWithUserData = await Promise.all(
        chats.map(async(chat)=>{
            const otherUserId = chat.users.find((id)=> id.toString() !== userId.toString())

            const unseenCount = await Message.countDocuments({
                chatId: chat._id,
                sender:{$ne: userId},
                seen: false,
            })

            try {
                const {data} = await axios.get(`${process.env.USER_SERVICE}/api/v1/user/${otherUserId}`)
                return {
                    user: data,
                    chat: {
                        ...chat.toObject(),
                        latestMessage: chat.latestMessage || null,
                        unseenCount,
                    }
                }
            } catch (error) {
                console.log(error)
                return {

                    user:{_id:otherUserId, name: "Unknow user"},
                    chat: {
                        ...chat.toObject(),
                        latestMessage: chat.latestMessage || null,
                        unseenCount,
                    }
                }
            }
        })
    )

    res.json({
        chats: chatWithUserData
    })
})

export const sendMessage = TryCatch(async(req:AuthenticatedRequest, res)=>{
    const senderId = req.user?._id
    const {chatId, text} = req.body
    const imageFile = req.file;

    if(!senderId){
        res.status(401).json({
            message: "unauthorized"
        })
        return
    }
    if(!chatId){
        res.status(400).json({
            message: "ChatId Required"
        })
        return
    }

    if(!text && !imageFile){
       res.status(400).json({
            message: "Either text or image is required"
        })
        return 
    }

    const chat = await Chat.findById(chatId)
    if(!chat){
        res.status(4004).json({
            message: "chat not found"
        })
        return;
    }

    const isUserInChat = chat.users.some(
        (userId) => userId.toString() === senderId.toString()
    )
    if(!isUserInChat){
        res.status(403).json({
            messaeg: "You are not participant of this chat"
        })
        return 
    }

    const otherUserId = chat.users.find(
        (userId) => userId.toString() !== senderId.toString()
    )
    if(!otherUserId){
        res.status(401).json({
            message: "No other user"
        })
        return
    }

    //socket setup

    const messageData: any = {
        chatId: chatId,
        sender: senderId,
        seen: false,
        seenAt: undefined
    }

    if(imageFile){
        messageData.image = {
            url: imageFile?.path,
            publicId: imageFile?.filename
        }
        messageData.messageType = "image"
        messageData.text = text || ""
    }else{
        messageData.text = text;
        messageData.messageType = "text"
    }

    const message = new Message(messageData);
    const saveMessage = await message.save()
    const latestMessageText = imageFile ? "📷 image" : text

    await Chat.findByIdAndUpdate(chatId, {
        latestMessage: {
            text: latestMessageText,
            sender: senderId
        },
        updatedAt: new Date()
    }, { new: true})

    res.status(201).json({
        message: "Message sent",
        data: saveMessage
    })

    //emit to socket
    res.status(201).json({
        message: saveMessage,
        sender: senderId
    })

})

export const getMessagesByChats = TryCatch(async(req:AuthenticatedRequest, res)=>{
    const userId = req.user?._id
    const {chatId} = req.params;

    if(!userId){
        res.status(401).json({
            message: "unauthorised"
        })
        return
    }

    if(!chatId){
        res.status(400).json({
            message: "ChatId Required"
        })
        return
    }

    const chat = await Chat.findById(chatId)

    if(!chat){
        res.status(404).json({
            message: "chat not found"
        })
        return
    }

     const isUserInChat = chat.users.some(
        (userId) => userId.toString() === userId.toString()
    )
    if(!isUserInChat){
        res.status(403).json({
            messaeg: "You are not participant of this chat"
        })
        return 
    }

    const messagesToMarkSeen = await Message.find({
        chatId: chatId,
        sender: {$ne: userId},
        seen: false,
    })

    await Message.updateMany(
        {
            chatId: chatId,
            sender: {$ne: userId},
            seen: false,
        },
        {
            $set: {
                seen: true,
                seenAt: new Date(),
            },
        }
    )

    const messages = await Message.find({chatId}).sort({createdAt: 1})

    const otherUserId = chat.users.find((id)=> id !== userId)

    try {
         const {data} = await axios.get(`${process.env.USER_SERVICE}/api/v1/user/${otherUserId}`) // Get other user's details

         if(!otherUserId) {
            res.status(400).json({
            message: "No other user"
            })
        }

        //socket work

        res.json({
            messages,
            user: data
        })
    } catch (error) {
        console.log(error)
        res.json({
            messages,
            user: {_id: otherUserId, name: "Unlnown user"}
        })
    }

})