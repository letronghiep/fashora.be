const { connectToRabbitMQ } = require("../db/init.rabbit");

// consumer listen to Queue
const consumer = async (queue) => {
  try {
    const { channel, connection } = await connectToRabbitMQ();
    await channel.assertQueue(queue, { durable: true });
    console.log(` [*] Waiting for messages in ${queue}. To exit press CTRL+C`);
    channel.consume(queue, (msg) => {
      if (msg !== null) {
        const message = JSON.parse(msg.content.toString());
        console.log(` [x] Received ${message}`);
        // process message here
        channel.ack(msg);
      }
    });
    setTimeout(() => {
      connection.close();
    }, 500);
  } catch (e) {
    console.error("Error consuming message from queue", e);
  }
};

// producer send to Queue
// sendNotificationToQueue
const producer = async (message, queue) => {
  try {
    const { channel, connection } = await connectToRabbitMQ();
    await channel.assertQueue(queue, { durable: true });
    channel.sendToQueue(queue, Buffer.from(message), {
      persistent: true,
    });
    console.log(` [x] Sent to ${queue}: '${message}'`);
    setTimeout(() => {
      connection.close();
    }, 500);
  } catch (error) {
    console.error("Error sending message to queue", error);
  }
};
module.exports = {
  consumer,
  producer,
};
