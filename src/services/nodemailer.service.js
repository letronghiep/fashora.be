const nodemailer = require("nodemailer");

const sendMail = async ({ to, subject, text, html }) => {
  if (!to) {
    throw new Error("Email người nhận không được để trống");
  }
  if (!subject) {
    throw new Error("Tiêu đề email không được để trống");
  }
  if (!text && !html) {
    throw new Error("Nội dung email không được để trống");
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.NODEMAILER_HOST,
      port: process.env.NODEMAILER_PORT,
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.NODEMAILER_USERNAME,
        pass: process.env.NODEMAILER_PASSWORD,
      },
    });
    (async () => {
      const info = await transporter.sendMail({
        from: '"Fashora" <lehiep269@gmail.com>',
        to: to,
        subject: subject,
        text: text, // plain‑text body
        html: html, // HTML body
      });
    
      console.log("Message sent:", info.messageId);
    })();
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

module.exports = {
  sendMail,
};
