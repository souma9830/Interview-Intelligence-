const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
    port: process.env.SMTP_PORT || 2525,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const htmlTemplate = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${options.subject}</title>
        <style>
          body { font-family: 'Inter', Helvetica, Arial, sans-serif; background-color: #f6f9fc; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
          .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
          .header { background-color: #111111; padding: 32px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0; font-size: 20px; font-weight: 600; letter-spacing: -0.02em; }
          .content { padding: 40px 32px; line-height: 1.6; color: #333333; font-size: 15px; }
          .footer { background-color: #f9f9fb; padding: 24px; text-align: center; font-size: 12px; color: #888888; border-top: 1px solid #eeeeee; }
          .otp-code { font-size: 32px; font-weight: 700; color: #111111; letter-spacing: 6px; text-align: center; margin: 24px 0; padding: 16px; background-color: #f3f4f6; border-radius: 8px; border: 1px dashed #cccccc; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>CamSense AI</h1>
          </div>
          <div class="content">
            <h2 style="margin-top: 0; font-size: 18px; font-weight: 600; color: #111111;">${options.subject}</h2>
            <p>${options.message}</p>
            ${options.message.includes('OTP') || options.message.includes('code') ? `
              <div class="otp-code">
                ${(options.message.match(/\d{6}/) || [''])[0]}
              </div>
            ` : ''}
          </div>
          <div class="footer">
            <p>This is an automated notification from CamSense AI. Please do not reply to this email.</p>
            <p>&copy; ${new Date().getFullYear()} CamSense AI. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  // Define email options
  const mailOptions = {
    from: `${process.env.FROM_NAME || 'Interview Intelligence'} <${process.env.FROM_EMAIL || 'no-reply@interview-intelligence.com'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: htmlTemplate,
  };

  // Send email
  console.log(`[SMTP Transporter] Attempting delivery to: ${options.email}`);
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
