import { sendMail } from "../utils/mailer.js";

export const sendVerificationMail = async (email, rawToken, role) => {
  try {
    await sendMail({
      to: email,
      subject: "Email verification for onboarding",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; background-color: #f7f7f7;">
          <div style="max-width: 600px; margin: auto; background: white; padding: 30px; border-radius: 8px; border: 1px solid #e2e2e2;">
            <h2 style="color: #333; margin-top: 0;">Verify Your Email</h2>
            <p style="color: #555; font-size: 15px;">
              Thank you for signing up. Please verify your email address to activate your CuraNova account.
            </p>
            <a href="http://localhost:5173/auth/verify-email/${rawToken}?role=${role}"
               style="display: inline-block; padding: 12px 20px; background-color: #9b87f5; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: 600;">
              Verify Email
            </a>
            <p style="color: #777; font-size: 14px;">
              If the button above does not work, paste this link in your browser:
            </p>
            <p style="color: #9b87f5; font-size: 14px; word-break: break-all;">
              http://localhost:5173/auth/verify-email/${rawToken}?role=${role}
            </p>
            <p style="color: #999; font-size: 13px; margin-top: 30px;">
              If you did not request this, you can safely ignore this email.
            </p>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error("Email error:", error.message);
  }
};
