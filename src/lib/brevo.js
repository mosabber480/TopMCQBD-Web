const apiKey = process.env.BREVO_API_KEY;
const senderEmail = process.env.BREVO_SENDER_EMAIL || 'mosabber480@gmail.com';

/**
 * Send Password Reset Email via Direct Brevo REST API
 */
export async function sendResetEmail(user, resetLink) {
  if (!apiKey) {
    console.warn('⚠️ Brevo API Key not configured. Reset Link:', resetLink);
    return { success: true, mocked: true };
  }

  const payload = {
    sender: {
      name: "TopMCQBD",
      email: senderEmail
    },
    to: [{ email: user.email, name: user.name || "Student" }],
    subject: "Reset Your TopMCQBD Password",
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background: #ffffff;">
        <h2 style="color: #007bff; margin-bottom: 20px;">TopMCQBD Password Reset</h2>
        <p style="font-size: 16px; color: #333;">Hello <strong>${user.name || 'User'}</strong>,</p>
        <p style="font-size: 15px; color: #555; line-height: 1.6;">
          We received a request to reset your password for TopMCQBD. Click the button below to set a new password:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 15px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p style="font-size: 13px; color: #888;">This link will expire in 15 minutes. If you did not request this, you can safely ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #aaa; text-align: center;">&copy; ${new Date().getFullYear()} TopMCQBD. All rights reserved.</p>
      </div>
    `
  };

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': apiKey,
      'content-type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('Brevo API Error:', errorData);
    throw new Error(errorData.message || 'Failed to send reset email');
  }

  return response.json();
}
