import amqplib from 'amqplib'

let channel: amqplib.Channel;

export const connectRabbitMq = async() => {
    try {
        const connection = await amqplib.connect({
            protocol: "amqp",
            hostname: process.env.Rabbitmq_Host!,
            port:  5672,
            username: process.env.Rabbitmq_Username!,
            password: process.env.Rabbitmq_Password!,
        })

        channel = await connection.createChannel()

        console.log("✅ connected to rabbitmq")
    } catch (error) {
        console.log("Failed to connect to rabbitmq", error)
    }
}

export const publishToQueue = async (queueName: string, message: any) => {
    if (!channel) {
        console.log("Rabbit channel is not intialized");
        return;
    }

    await channel.assertQueue(queueName, { durable: true });

    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), {
        persistent: true,
    });
}