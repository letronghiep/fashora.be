const twilio = require('twilio');

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const sendSMS = async (to, message) => {
    console.log({to, message})
    try {
        const result = await client.messages.create({
            body: message,
            to: to,
            from: process.env.TWILIO_PHONE_NUMBER
        });
        return result;
    } catch (error) {
        console.error('Error sending SMS:', error);
        throw error;
    }
}

module.exports = {
    sendSMS
};