const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'Natures.Palette099@gmail.com',
    pass: 'edtf trae flab nrit',
  },
});

function sendMail(to, subject, text, retries = 3) {
  const mailOptions = {
    from: 'Natures.Palette099@gmail.com',
    to: to,
    subject: subject,
    text: text,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log('Error sending email:', error);
      if (retries > 0) {
        console.log(`Retrying... (${retries} retries left)`);
        sendMail(to, subject, text, retries - 1);
      }
    } else {
      console.log('Email sent:', info.response);
    }
  });
}

module.exports = { sendMail };
