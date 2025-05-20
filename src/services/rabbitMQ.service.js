const { connectToRabbitMQ } = require("../db/init.rabbit");
const smsService = require("./sms.service");

// Cấu hình RabbitMQ
const RABBITMQ_CONFIG = {
  smsQueue: "sms_queue",
  dlx: "dlx",
  dlxQueue: "dlx.sms",
  messageTTL: 60 * 1000, // 60s
  maxRetries: 3,
};

// Khởi tạo Dead Letter Exchange và Queue
const initDeadLetterQueue = async (channel) => {
  try {
    // Tạo Dead Letter Exchange
    await channel.assertExchange(RABBITMQ_CONFIG.dlx, "direct", {
      durable: true,
    });

    // Tạo Dead Letter Queue
    await channel.assertQueue(RABBITMQ_CONFIG.dlxQueue, {
      durable: true,
    });

    // Bind Dead Letter Queue với Exchange
    await channel.bindQueue(
      RABBITMQ_CONFIG.dlxQueue,
      RABBITMQ_CONFIG.dlx,
      RABBITMQ_CONFIG.dlxQueue
    );

    console.log("Dead Letter Queue initialized successfully");
  } catch (error) {
    console.error("Error initializing Dead Letter Queue:", error);
    throw error;
  }
};

// consumer listen to Queue
const consumer = async (queue) => {
  try {
    console.log("Starting consumer for queue:", queue);
    const { channel, connection } = await connectToRabbitMQ();

    // Khởi tạo Dead Letter Queue
    await initDeadLetterQueue(channel);

    // Khai báo queue với các tham số cố định
    await channel.assertQueue(queue, {
      durable: true,
      arguments: {
        "x-message-ttl": RABBITMQ_CONFIG.messageTTL,
        "x-dead-letter-exchange": RABBITMQ_CONFIG.dlx,
        "x-dead-letter-routing-key": RABBITMQ_CONFIG.dlxQueue,
      },
    });

    console.log(` [*] Waiting for messages in ${queue}. To exit press CTRL+C`);

    // Xử lý message từ main queue
    channel.consume(queue, async (msg) => {
      if (msg !== null) {
        try {
          console.log("Received raw message:", msg.content.toString());
          const message = JSON.parse(msg.content.toString());
          console.log(` [x] Received parsed message:`, message);

          if (queue === RABBITMQ_CONFIG.smsQueue) {
            console.log("Processing SMS message for queue:", queue);
            console.log(
              "Sending SMS to:",
              message.phone,
              "with content:",
              message.content
            );
            const phone = message.phone.replace(/^0/, "+84");
            console.log({ 1: phone});
            await smsService.sendSMS(phone, message.content);
            console.log("SMS sent successfully");
          }

          channel.ack(msg);
          console.log("Message acknowledged");
        } catch (error) {
          console.error("Error processing message:", error);
          channel.nack(msg, false, false);
          console.log("Message rejected and sent to dead letter queue");
        }
      }
    });

    // Xử lý message từ dead letter queue
    channel.consume(RABBITMQ_CONFIG.dlxQueue, async (msg) => {
      if (msg !== null) {
        try {
          const message = JSON.parse(msg.content.toString());
          console.log("Processing message from dead letter queue>>", message);

          // Thử gửi lại SMS
          if (message.phone && message.content) {
            await smsService.sendSMS(message.phone, message.content);
            console.log(
              "Successfully processed message from dead letter queue"
            );
          }

          channel.ack(msg);
        } catch (error) {
          console.error("Error processing dead letter message:", error);
          // Nếu vẫn thất bại, giữ message trong dead letter queue
          channel.nack(msg, false, false);
        }
      }
    });

    process.on("SIGINT", () => {
      console.log("Closing connection...");
      connection.close();
      process.exit(0);
    });
  } catch (e) {
    console.error("Error in consumer:", e);
  }
};

// producer send to Queue
const producer = async (message, queue) => {
  let connection = null;
  let channel = null;

  try {
    const { channel: ch, conn } = await connectToRabbitMQ();
    channel = ch;
    connection = conn;

    // Sử dụng cùng cấu hình queue với consumer
    await channel.assertQueue(queue, {
      durable: true,
      arguments: {
        "x-message-ttl": 60 * 1000, // 60s 86400000 1 ngay
        "x-dead-letter-exchange": "dlx",
        "x-dead-letter-routing-key": "dlx.sms",
      },
    });

    // Kiểm tra message có phải là object không
    const messageContent =
      typeof message === "object" ? JSON.stringify(message) : message;

    // Gửi message với các options
    const success = channel.sendToQueue(queue, Buffer.from(messageContent), {
      persistent: true,
      contentType: "application/json",
      contentEncoding: "utf-8",
      headers: {
        timestamp: Date.now(),
      },
    });

    if (!success) {
      throw new Error("Message was not sent to queue");
    }

    console.log(` [x] Sent to ${queue}:`, messageContent);

    return true;
  } catch (error) {
    console.error("Error sending message to queue:", error);
    throw error;
  } finally {
    // Đóng kết nối trong block finally để đảm bảo luôn được thực thi
    try {
      if (channel) {
        await channel.close();
      }
      if (connection) {
        await connection.close();
      }
    } catch (closeError) {
      console.error("Error closing connection:", closeError);
    }
  }
};

module.exports = {
  consumer,
  producer,
};
