const nodemailer = require('nodemailer');

//to get gmail password, go to app passwords in gmail user account information and generate a new password to send email programatically
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASSWORD
  }
});

const sendEmail = (fullname, balance, email) => {
  try{
    let mailOptions = {
      from: process.env.NODEMAILER_EMAIL,
      to: email,
      subject: 'Expense Tracker Balance Alert',
      text: `Hello ${fullname}, \n\n This mail is sent to let you know that your balance has fallen below $0 to $${balance}.`
    };
    
    transporter.sendMail(mailOptions);
  }
  catch(err){}
};


exports.sendEmail = sendEmail;