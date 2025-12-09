
import nodemailer from 'nodemailer';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  // Set up nodemailer with Gmail
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS, // your 16-char app password
    },
  });

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: process.env.RECEIVER_EMAIL,
    subject: `New Contact Form Submission: ${subject}`,
    text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ message: 'Email sent successfully!' });
  } catch (error) {
    console.error('❌ Gmail SMTP error:', error);
    return res.status(500).json({ error: 'Failed to send email. Check server logs.' });
  }
}