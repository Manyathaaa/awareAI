/**
 * SMS service — wire up Twilio, AWS SNS, or any SMS provider.
 */

/**
 * Send an SMS alert.
 * @param {Object} opts
 * @param {string} opts.to      - Recipient phone number (E.164 format, e.g. +1234567890)
 * @param {string} opts.body    - Message body
 */
export const sendSMS = async ({ to, body }) => {
  // TODO: replace stub with real Twilio / SNS client
  console.log(`[smsService] Sending SMS to ${to}: "${body}"`);
  return { success: true, to, body };
};

/**
 * Send a high-risk alert via SMS.
 */
export const sendRiskAlert = async ({ to, userName, riskLevel }) => {
  const body = `AwareAI Alert: ${userName} has been flagged as ${riskLevel.toUpperCase()} risk. Immediate review recommended.`;
  return sendSMS({ to, body });
};
