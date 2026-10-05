class EmailService {
  /**
   * Send verification email
   * @param {string} to - recipient email
   * @param {string} subject - email subject
   * @param {string} text - email body text
   * @param {string} html - email body HTML (optional)
   */
  static async sendVerificationEmail(to, subject, text, html) {
    // In development, we'll log to console instead of actually sending email
    // This can be replaced with nodemailer or another email service in production
    console.log('--- EMAIL SIMULATION ---');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Text: ${text}`);
    if (html) {
      console.log(`HTML: ${html}`);
    }
    console.log('--- END EMAIL ---');
    
    // Simulate network delay
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, messageId: 'simulated-email-id' });
      }, 500);
    });
  }

  /**
   * Send welcome email after verification
   * @param {string} to - recipient email
   * @param {string} name - user's name
   */
  static async sendWelcomeEmail(to, name) {
    const subject = 'Welcome to EduMart!';
    const text = `
Hello ${name},

Welcome to EduMart! We're excited to have you join our learning marketplace.

Your account has been successfully verified and is now ready to use.

Best regards,
The EduMart Team
`;
    
    const html = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2>Welcome to EduMart!</h2>
  <p>Hello ${name},</p>
  <p>Welcome to EduMart! We're excited to have you join our learning marketplace.</p>
  <p>Your account has been successfully verified and is now ready to use.</p>
  <hr>
  <p>Best regards,<br>The EduMart Team</p>
</div>
`;
    
    return this.sendVerificationEmail(to, subject, text, html);
  }
}

export default EmailService;
