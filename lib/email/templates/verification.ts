interface VerificationEmailProps {
  fullName: string
  actionLink: string
  supportEmail?: string
  appName?: string
}

export function renderVerificationEmail({
  fullName,
  actionLink,
  supportEmail = "support@explorerwanda.com",
  appName = "Explore Rwanda",
}: VerificationEmailProps) {
  const greetingName = fullName?.trim() ? fullName : "Explorer"

  return `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Verify your ${appName} account</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          background-color: #f5f7fa;
          font-family: "Helvetica Neue", Arial, sans-serif;
          color: #0f172a;
        }
        a {
          color: inherit;
        }
        .container {
          max-width: 560px;
          margin: 40px auto;
          background-color: #ffffff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.25);
        }
        .header {
          background: linear-gradient(135deg, #047857, #0ea5e9, #f59e0b);
          padding: 32px 36px;
          color: #f8fafc;
        }
        .header h1 {
          margin: 0 0 8px;
          font-size: 28px;
          letter-spacing: 0.5px;
        }
        .header p {
          margin: 0;
          font-size: 16px;
          opacity: 0.9;
        }
        .content {
          padding: 36px;
        }
        .content p {
          line-height: 1.6;
          font-size: 15px;
          margin: 0 0 16px;
        }
        .button-wrapper {
          text-align: center;
          margin: 32px 0;
        }
        .button {
          display: inline-block;
          padding: 14px 36px;
          border-radius: 999px;
          font-weight: 600;
          font-size: 16px;
          letter-spacing: 0.3px;
          background: linear-gradient(135deg, #047857, #0ea5e9);
          color: #ffffff;
          text-decoration: none;
        }
        .divider {
          height: 1px;
          background-color: #e2e8f0;
          margin: 36px 0;
        }
        .footer {
          padding: 0 36px 36px;
          font-size: 13px;
          color: #475569;
        }
        .footer p {
          margin: 0 0 12px;
          line-height: 1.6;
        }
        .footer a {
          color: #0ea5e9;
          text-decoration: none;
          font-weight: 600;
        }
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background-color: rgba(4, 120, 87, 0.1);
          color: #047857;
          padding: 8px 14px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        @media (max-width: 600px) {
          .container {
            margin: 20px;
          }
          .header {
            padding: 28px 24px;
          }
          .content,
          .footer {
            padding: 28px 24px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="badge">Email Confirmation</div>
          <h1>Welcome to ${appName}</h1>
          <p>We just need to confirm your email to activate your account.</p>
        </div>
        <div class="content">
          <p>Hi ${greetingName},</p>
          <p>
            Thanks for joining ${appName}! We’re excited to help you discover unforgettable journeys throughout Rwanda.
            To keep your account secure and personalized, please confirm your email address.
          </p>
          <div class="button-wrapper">
            <a class="button" href="${actionLink}" target="_blank" rel="noopener">
              Confirm my email
            </a>
          </div>
          <p>
            This link will expire in 24 hours for security reasons. If it does, simply start the sign-up process again or
            contact us for assistance.
          </p>
          <div class="divider"></div>
        </div>
        <div class="footer">
          <p>
            If you didn’t create an account with ${appName}, you can safely ignore this message — your email won’t be added.
          </p>
          <p>
            Need help? Reach us anytime at <a href="mailto:${supportEmail}">${supportEmail}</a>. We’re here to make sure your
            experience is seamless.
          </p>
          <p>Warm regards,<br />The ${appName} Team</p>
        </div>
      </div>
    </body>
  </html>
  `
}

