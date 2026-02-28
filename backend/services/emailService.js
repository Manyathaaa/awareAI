/**
 * Email service — wire up your preferred provider
 * (nodemailer + SMTP, SendGrid, AWS SES, etc.)
 */

/**
 * Send a phishing simulation email.
 * @param {Object} opts
 * @param {string} opts.to        - Recipient email address
 * @param {string} opts.subject   - Email subject
 * @param {string} opts.html      - HTML body (phishing template)
 */
export const sendPhishingEmail = async ({ to, subject, html }) => {
  // TODO: replace with real transport (e.g. nodemailer)
  console.log(`[emailService] Sending phishing email to ${to} | Subject: "${subject}"`);
  return { accepted: [to], rejected: [] };
};

/**
 * Send a training notification email.
 */
export const sendTrainingNotification = async ({ to, trainingTitle, link }) => {
  console.log(`[emailService] Notifying ${to} about training: "${trainingTitle}" → ${link}`);
  return { accepted: [to], rejected: [] };
};

/**
 * Send an alert email (e.g. high-risk user detected).
 */
export const sendAlertEmail = async ({ to, subject, body }) => {
  console.log(`[emailService] Alert to ${to} | ${subject}`);
  return { accepted: [to], rejected: [] };
};
