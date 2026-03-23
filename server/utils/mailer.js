import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASS,
  },
});

export const sendMail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: `"CuraNova" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html,
  });
};
