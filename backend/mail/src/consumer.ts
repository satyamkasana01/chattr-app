import amqp from 'amqplib'
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config()

export const StartSendOtpConsumer = async() => {
    try {
        const connection = await amqp.connect({
            protocol: "amqp",
            hostname: process.env.Rabbitmq_Host!,
            port:  5672,
            username: process.env.Rabbitmq_Username!,
            password: process.env.Rabbitmq_Password!,
        })

        const channel = await connection.createChannel() //  Creates a Channel (a lightweight virtual pipe) inside the Connection.

        const queueName = "send-otp"
        await channel.assertQueue(queueName, { durable: true})

        console.log("✅ Mail service consumer started, listenting for otp emails")

        channel.consume(queueName, async(msg)=>{  // consume? It tells RabbitMQ: "Whenever a new message arrives in 'send-otp', run this callback function."
            if(msg){
                try {
                    const {to, subject, body} = JSON.parse(msg.content.toString())

                    const transporter = nodemailer.createTransport({
                        host: "smtp.gmail.com",
                        port: 465,
                        secure: true,
                        auth: {
                            user: process.env.USER,
                            pass: process.env.PASSWORD
                        }
                    })

                    await transporter.sendMail({
                        from:"Chat app",
                        to,
                        subject,
                        text: body
                    })

                    console.log(`OTP mail sent to ${to}`)
                    channel.ack(msg)
                } catch (error) {
                    console.log("Failed to send OTP", error)
                }
            }
        })
    } catch (error) {
        console.log("Failed to start rabbitmq consumer", error)
    }
}