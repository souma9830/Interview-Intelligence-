const nodemailer = require('nodemailer');

const createTransporter = () => {
  const smtpHost = process.env.SMTP_HOST || 'smtp.mailtrap.io';
  const smtpPort = parseInt(process.env.SMTP_PORT, 10) || 2525;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  // Use secure TLS on port 465 (Gmail/SendGrid production); STARTTLS on 587
  const useSecure = smtpPort === 465;

  if (!smtpUser || !smtpPass) {
    console.warn('[SMTP] Missing SMTP credentials. Emails will not be delivered.');
  }

  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: useSecure,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
    tls: {
      // Do not reject self-signed certs in development
      rejectUnauthorized: process.env.NODE_ENV === 'production',
    },
  });
};

const buildHtmlTemplate = (options) => {
  const otpMatch = options.message ? options.message.match(/\d{6}/) : null;
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${options.subject || ''}</title>
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
            <h2 style="margin-top: 0; font-size: 18px; font-weight: 600; color: #111111;">${options.subject || ''}</h2>
            <p>${options.message || ''}</p>
            ${otpMatch ? `
              <div class="otp-code">
                ${otpMatch[0]}
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
};

const sendEmail = async (options) => {
  const transporter = createTransporter();
  const recipientEmail = options.email || options.to;

  if (!recipientEmail) {
    throw new Error('Recipient email address is required');
  }

  const mailOptions = {
    from: `${process.env.FROM_NAME || 'Interview Intelligence'} <${process.env.FROM_EMAIL || 'no-reply@interview-intelligence.com'}>`,
    to: recipientEmail,
    subject: options.subject || 'No Subject',
    text: options.message || '',
    html: buildHtmlTemplate(options),
  };

  console.log(`[SMTP] Attempting delivery to: ${recipientEmail}`);
  
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[SMTP] Message sent successfully: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error(`[SMTP] Delivery failed: ${err.message}`);
    throw new Error(`Email delivery failed: ${err.message}`);
  }
};

module.exports = sendEmail;
