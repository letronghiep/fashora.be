'use strict'
const amqp = require('amqplib')
const connectToRabbitMQ = async() => {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL)
        if (!connection) throw new Error('Connection not established')
        const channel = await connection.createChannel()
        return { channel, connection }
    } catch (error) {}
};
const connectToRabbitMQForTest = async() => {
    try {
        const { channel, connection } = await connectToRabbitMQ()
        const queue = 'test-queue'        

    } catch (error) {}
}
module.exports = {
    connectToRabbitMQ,
    connectToRabbitMQForTest,
 
}