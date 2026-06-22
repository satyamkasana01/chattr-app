import { generateToken } from "../confing/generateToken.js"
import { publishToQueue } from "../confing/rabbitmq.js"
import TryCatch from "../confing/TryCatch.js"
import { redisClient } from "../index.js"
import type { AuthenticatedRequest } from "../middleware/isAuth.js"
import { User } from "../model/user.js"

export const loginUser = TryCatch(async(req, res)=>{
    const {email} = req.body

    const rateLimitKey = `otp:ratelimit:${email}`
    const rateLimit = await redisClient.get(rateLimitKey)
    if(rateLimit){
        res.status(429).json({
            message:"Too many request. Please wait before requesting new otp"
        })
        return
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    const otpKey = `otp:${email}`
    await redisClient.set(otpKey, otp, {
        EX: 300,
    })
    await redisClient.set(rateLimitKey, "true", {
        EX: 60,
    })

    const message = {
        to: email,
        subject: "your otp code",
        body: `Your OTP is ${otp}. It is valid for 5 min`
    }

    await publishToQueue("send-otp", message)

    res.status(200).json({
        message:"OTP sent to your mail"
    })
})


export const verifyUser = TryCatch(async(req, res)=> {
    const { email, otp: enteredOtp } = req.body

    if(!email || !enteredOtp ) {
        res.status(400).json({
            message: "Email and OTP Required"
        })
        return
    }

    const otpKey = `otp:${email}`

    const storedOtp = await redisClient.get(otpKey)

    if(!storedOtp || storedOtp !== enteredOtp) {
        res.status(400).json({
            message: "Invalid or expired OTP"
        })
        return 
    }
    await redisClient.del(otpKey)

    let user = await User.findOne({email})
    if(!user){
        const name = email.slice(0,8)
        user = await User.create({name, email})
    }

    const token = generateToken(user)

    res.json({
        message: "User Verfied",
        user,
        token
    })
})


export const myProfile = TryCatch(async(req: AuthenticatedRequest, res)=> {
    const user = req.user

    res.json(user)
})