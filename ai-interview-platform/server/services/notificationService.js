const sendEmail = require('../utils/emailService');

const MAX_RETRIES = 2;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const send = async ({ to, subject, message, channel = 'email' }) => {
  console.log(`[Notification] Dispatching to: ${to} via ${channel}`);

  if (channel === 'email') {
    let lastError = null;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        await sendEmail({ email: to, subject, message });
        return { success: true, channel: 'email' };
      } catch (err) {
        lastError = err;
        console.warn(`[Notification] Email attempt ${attempt}/${MAX_RETRIES} failed: ${err.message}`);
        if (attempt < MAX_RETRIES) {
          await sleep(1000 * attempt);
        }
      }
    }
    console.warn(`[Notification] All email attempts exhausted. Falling back to console log.`);
  }

  console.log(`[Notification Fallback] TO: ${to} | SUBJECT: ${subject} | MESSAGE: ${message}`);
  return { success: true, channel: 'console' };
};

const sendOTP = async (email, otp) => {
  return await send({
    to: email,
    subject: 'Password Reset OTP - CamSense AI',
    message: `Your password reset OTP is ${otp}. It is valid for 5 minutes. Do not share this code with anyone.`
  });
};

const sendInterviewConfirmation = async (email, date, role) => {
  return await send({
    to: email,
    subject: 'Interview Scheduled - CamSense AI',
    message: `Your ${role} interview has been scheduled for ${date}. Please log in at the scheduled time to begin your session.`
  });
};

module.exports = {
  send,
  sendOTP,
  sendInterviewConfirmation
};