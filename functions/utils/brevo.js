export async function sendResetEmail(user, resetLink, env = {}) {
  const BREVO_API_KEY = env.BREVO_API_KEY || (typeof process !== 'undefined' && process.env?.BREVO_API_KEY) || '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';
  const BREVO_SENDER_EMAIL = env.BREVO_SENDER_EMAIL || (typeof process !== 'undefined' && process.env?.BREVO_SENDER_EMAIL) || 'mosabber480@gmail.com';

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #2563eb; text-align: center;">TopMCQBD পাসওয়ার্ড রিসেট</h2>
      <p>প্রিয় <strong>${user.name || 'ইউজার'}</strong>,</p>
      <p>আপনার অ্যাকাউন্ট পাসওয়ার্ড রিসেট করার জন্য একটি অনুরোধ পাওয়া গেছে। পাসওয়ার্ড নতুন করে সেট করতে নিচের বাটনে ক্লিক করুন:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">পাসওয়ার্ড রিসেট করুন</a>
      </div>
      <p style="color: #64748b; font-size: 14px;">লিংকটির মেয়াদ থাকবে ১৫ মিনিট। আপনি যদি পাসওয়ার্ড রিসেট করতে না চেয়ে থাকেন, তবে এই ইমেইলটি এড়িয়ে চলুন।</p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="color: #94a3b8; font-size: 12px; text-align: center;">TopMCQBD - সেরা অনলাইন প্রস্তুতি প্ল্যাটফর্ম</p>
    </div>
  `;

  const payload = {
    sender: { name: 'TopMCQBD Support', email: BREVO_SENDER_EMAIL },
    to: [{ email: user.email, name: user.name || 'User' }],
    subject: 'পাসওয়ার্ড রিসেট লিংক - TopMCQBD',
    htmlContent
  };

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': BREVO_API_KEY,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Brevo API Error:', errorText);
    throw new Error(`Brevo API responded with ${response.status}: ${errorText}`);
  }

  return await response.json();
}
