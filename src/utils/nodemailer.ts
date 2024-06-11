import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();


const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.NODEMAILER_USER,
    pass: process.env.NODEMAILER_PASSWORD,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error('Transporter configuration error:', error);
  } else {
    console.log('Transporter is configured correctly');
  }
});

const sendOtp = async (email: string, otp: number): Promise<void> => {
  const mailOptions = {
    from: process.env.NODEMAILER_USER,
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP is ${otp}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

export {
  sendOtp
};
