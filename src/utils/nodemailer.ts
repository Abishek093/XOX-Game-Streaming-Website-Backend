import nodemailer from 'nodemailer'


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


const sendOtp = async(email: string, otp:number): Promise<void>=>{
  const mailOptions = {
    from:process.env.NODEMAILER_USER,
    to: email,
    subject:'Your OTP Code',
    text: `Your otp is ${otp}`
  }
  await transporter.sendMail(mailOptions);
  console.log("Email send");
  
}

export {
  sendOtp
}