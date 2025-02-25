const nodemailer = require('nodemailer');
const path = require('path');

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD // Use App Password for Gmail
  }
});

// Function to send email with video attachment
const sendVideoEmail = async (userEmail, videoPath, messageText) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: 'Your Avatar Video is Ready!',
      text: messageText || 'Here is your generated avatar video.',
      attachments: [
        {
          filename: 'avatar-video.mp4',
          path: videoPath
        }
      ]
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = {
  sendVideoEmail
};