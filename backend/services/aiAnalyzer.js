import PhishingEvent from '../models/PhishingEvent.js';
import RiskScore from '../models/RiskScore.js';
import Training from '../models/Training.js';

// ─────────────────────────────────────────────────────────────────────────────
// CYBERSECURITY KNOWLEDGE BASE
// Each entry has: patterns (regex), reply (string or fn), category (string)
// ─────────────────────────────────────────────────────────────────────────────
const KB = [
  // ── Greetings ──
  {
    patterns: [/\b(hi|hello|hey|howdy|greetings|good\s*(morning|afternoon|evening))\b/i],
    category: 'greeting',
    reply: () =>
      `👋 Hello! I'm your AwareAI Security Assistant. I can help you with:\n\n` +
      `• **Phishing** — how to spot and report suspicious emails\n` +
      `• **Passwords & MFA** — best practices for strong authentication\n` +
      `• **Ransomware** — prevention and response steps\n` +
      `• **Social Engineering** — recognising manipulation tactics\n` +
      `• **GDPR & Compliance** — data protection essentials\n` +
      `• **Risk Score** — understanding your personal security rating\n\n` +
      `What would you like to know about?`,
  },

  // ── Phishing ──
  {
    patterns: [/phish/i, /suspicious\s*email/i, /fake\s*email/i, /spam/i],
    category: 'phishing',
    reply: () =>
      `🎣 **Phishing Awareness**\n\n` +
      `Phishing is the #1 attack vector. Here's how to protect yourself:\n\n` +
      `**Spot the signs:**\n` +
      `• Sender address doesn't match the organisation's domain\n` +
      `• Urgency language — "Your account will be locked in 24 hours!"\n` +
      `• Generic greetings like "Dear Customer"\n` +
      `• Unexpected attachments or login links\n` +
      `• Hovering over links reveals mismatched URLs\n\n` +
      `**What to do:**\n` +
      `1. Do NOT click links or download attachments\n` +
      `2. Report it via the **Report** button in this app\n` +
      `3. Delete the email and notify your IT team\n` +
      `4. If you clicked — change your password immediately and inform IT\n\n` +
      `💡 *Tip: When in doubt, contact the sender via a known phone number.*`,
  },

  // ── Password ──
  {
    patterns: [/password/i, /passphrase/i, /credential/i, /login\s*detail/i],
    category: 'password',
    reply: () =>
      `🔑 **Password Security**\n\n` +
      `**Creating strong passwords:**\n` +
      `• Use at least **16 characters** — longer is stronger\n` +
      `• Mix uppercase, lowercase, numbers, symbols\n` +
      `• Use a **passphrase**: "Coffee!Umbrella#Rocket9"\n` +
      `• Never reuse passwords across sites\n\n` +
      `**Managing passwords:**\n` +
      `• Use a **password manager** (Bitwarden, 1Password, KeePass)\n` +
      `• Enable breach notifications (Have I Been Pwned)\n` +
      `• Change passwords after any suspected breach\n\n` +
      `**Password anti-patterns:**\n` +
      `❌ Using your name, birthday, or company name\n` +
      `❌ Keyboard patterns (qwerty, 123456)\n` +
      `❌ Writing passwords on sticky notes\n\n` +
      `💡 *Your password manager generates and stores unique passwords for every site.*`,
  },

  // ── MFA / 2FA ──
  {
    patterns: [/\b(mfa|2fa|two.?factor|multi.?factor|authenticat(or|ion app)|otp|one.?time\s*pass)\b/i],
    category: 'mfa',
    reply: () =>
      `🔐 **Multi-Factor Authentication (MFA)**\n\n` +
      `MFA adds a second layer beyond your password. Even if your password leaks, attackers can't log in without your second factor.\n\n` +
      `**MFA methods (strongest → weakest):**\n` +
      `1. 🥇 Hardware keys (YubiKey, Passkeys)\n` +
      `2. 🥈 Authenticator apps (Google Authenticator, Authy, Microsoft Authenticator)\n` +
      `3. 🥉 SMS/email codes — better than nothing, but SIM-swappable\n\n` +
      `**Always enable MFA on:**\n` +
      `• Email accounts\n` +
      `• Corporate VPN & SSO\n` +
      `• Financial accounts\n` +
      `• Cloud services (AWS, Azure, GCP)\n\n` +
      `💡 *Never share MFA codes — a real support agent will never ask for them.*`,
  },

  // ── Ransomware ──
  {
    patterns: [/ransom(ware)?/i, /encrypt(ed)?\s*files?/i, /files?\s*(locked|encrypted)/i],
    category: 'ransomware',
    reply: () =>
      `🔒 **Ransomware — Prevention & Response**\n\n` +
      `Ransomware encrypts your files and demands payment. Prevention is far easier than recovery.\n\n` +
      `**Prevent it:**\n` +
      `• Keep OS and software **fully patched**\n` +
      `• Never open unexpected attachments (even from colleagues)\n` +
      `• Back up data regularly — **3-2-1 rule**: 3 copies, 2 media types, 1 offsite\n` +
      `• Use endpoint detection software (EDR)\n` +
      `• Restrict admin privileges — principle of least privilege\n\n` +
      `**If you're hit:**\n` +
      `1. **Disconnect** from the network immediately\n` +
      `2. Do NOT pay the ransom\n` +
      `3. Report to IT Security / CISO immediately\n` +
      `4. Restore from clean backups\n` +
      `5. Report to relevant authorities (Action Fraud, NCSC)\n\n` +
      `⚠️ *Paying the ransom funds future attacks and doesn't guarantee file recovery.*`,
  },

  // ── Social Engineering ──
  {
    patterns: [/social\s*engineer/i, /pretexting/i, /vishing/i, /smishing/i, /impersonat/i, /manipulat/i],
    category: 'social-engineering',
    reply: () =>
      `🎭 **Social Engineering**\n\n` +
      `Attackers exploit human psychology rather than technical vulnerabilities.\n\n` +
      `**Common tactics:**\n` +
      `• **Pretexting** — fabricating a scenario to gain trust ("I'm from IT, I need your password to fix an issue")\n` +
      `• **Vishing** — voice phishing via phone calls\n` +
      `• **Smishing** — phishing via SMS ("Your parcel is held, click here")\n` +
      `• **Tailgating** — following someone through a secure door\n` +
      `• **Authority** — pretending to be a CEO or regulator\n\n` +
      `**Defence principles:**\n` +
      `1. **Verify identity** through a separate known channel before acting\n` +
      `2. Legitimate IT staff will **never** ask for your password\n` +
      `3. Slow down when pressured — urgency is a manipulation tactic\n` +
      `4. When in doubt, escalate to your manager\n\n` +
      `💡 *Your company will never call you to ask for credentials — ever.*`,
  },

  // ── GDPR / Data Protection ──
  {
    patterns: [/gdpr/i, /data\s*protect/i, /personal\s*data/i, /privacy/i, /data\s*breach/i, /ico/i],
    category: 'gdpr',
    reply: () =>
      `🏛️ **GDPR & Data Protection**\n\n` +
      `The General Data Protection Regulation (GDPR) protects EU/UK citizens' personal data.\n\n` +
      `**Key principles:**\n` +
      `• **Lawful basis** — you must have a legal reason to process data\n` +
      `• **Data minimisation** — collect only what you need\n` +
      `• **Purpose limitation** — use data only for its stated purpose\n` +
      `• **Storage limitation** — don't keep data longer than necessary\n` +
      `• **Security** — protect data with appropriate technical measures\n\n` +
      `**If you suspect a data breach:**\n` +
      `1. Report to your Data Protection Officer (DPO) or IT immediately\n` +
      `2. The organisation has **72 hours** to notify the ICO if required\n` +
      `3. Affected individuals must be notified without undue delay\n\n` +
      `💡 *Even accidentally emailing personal data to the wrong person is a reportable breach.*`,
  },

  // ── VPN ──
  {
    patterns: [/\bvpn\b/i, /virtual\s*private\s*network/i, /remote\s*access/i, /public\s*wi.?fi/i],
    category: 'vpn',
    reply: () =>
      `🌐 **VPN & Remote Access Security**\n\n` +
      `A VPN encrypts your internet traffic, protecting you on untrusted networks.\n\n` +
      `**Always use VPN when:**\n` +
      `• Working on public Wi-Fi (cafés, airports, hotels)\n` +
      `• Accessing corporate systems remotely\n` +
      `• Travelling internationally\n\n` +
      `**VPN best practices:**\n` +
      `• Use your company-provided VPN, not free public ones\n` +
      `• Enable VPN before accessing any corporate resource\n` +
      `• Don't split-tunnel sensitive work traffic outside the VPN\n` +
      `• Log out of VPN when not in use on shared devices\n\n` +
      `⚠️ *Free VPNs often sell your browsing data — avoid them for work.*`,
  },

  // ── Malware ──
  {
    patterns: [/malware/i, /virus/i, /trojan/i, /spyware/i, /keylogger/i, /worm/i, /infected/i],
    category: 'malware',
    reply: () =>
      `🦠 **Malware Protection**\n\n` +
      `Malware is malicious software designed to damage, disrupt, or gain unauthorised access.\n\n` +
      `**Types you'll encounter:**\n` +
      `• **Virus** — attaches to files and spreads\n` +
      `• **Trojan** — disguised as legitimate software\n` +
      `• **Spyware/Keylogger** — records your activity secretly\n` +
      `• **Worm** — self-replicates across networks\n\n` +
      `**Prevention:**\n` +
      `• Keep antivirus/EDR software updated and running\n` +
      `• Only install software from official/approved sources\n` +
      `• Don't plug in unknown USB drives\n` +
      `• Apply OS and app patches promptly\n\n` +
      `**If you suspect infection:**\n` +
      `1. Disconnect from the network\n` +
      `2. Don't power off — preserves forensic evidence\n` +
      `3. Contact IT Security immediately\n\n` +
      `💡 *Your IT team can remotely isolate and scan the device.*`,
  },

  // ── Risk Score ──
  {
    patterns: [/risk\s*(score|level|rating)/i, /my\s*risk/i, /security\s*score/i, /score/i],
    category: 'risk',
    reply: () =>
      `📊 **Your Risk Score**\n\n` +
      `Your risk score (0–100) reflects your security behaviour. **Lower is better.**\n\n` +
      `**How it's calculated:**\n` +
      `• Phishing link clicks → increases score\n` +
      `• Reported threats → decreases score\n` +
      `• Training completion → decreases score\n` +
      `• Overdue training → increases score\n\n` +
      `**Risk levels:**\n` +
      `🟢 **Low (0–39)** — great security posture\n` +
      `🟡 **Medium (40–69)** — some improvement needed\n` +
      `🔴 **High (70–100)** — urgent action required\n\n` +
      `**How to improve:**\n` +
      `1. Complete all assigned training modules\n` +
      `2. Report phishing attempts (don't just delete them)\n` +
      `3. Never click simulated phishing links\n` +
      `4. Go to **Risk Score** page → click **Recalculate**\n\n` +
      `💡 *Your score updates in real time after each training completion.*`,
  },

  // ── Incident Reporting ──
  {
    patterns: [/report/i, /incident/i, /suspicious/i, /what\s*(should|do)\s*i\s*do/i, /help/i],
    category: 'incident',
    reply: () =>
      `🚨 **Reporting a Security Incident**\n\n` +
      `When to report:\n` +
      `• You clicked a suspicious link or opened an attachment\n` +
      `• You shared credentials accidentally\n` +
      `• Your device behaves oddly (slow, unknown processes)\n` +
      `• You receive unusual login alerts\n` +
      `• You spot a colleague's unattended unlocked screen\n\n` +
      `**How to report in AwareAI:**\n` +
      `1. Go to **Phishing** page → find the event → mark as Reported\n` +
      `2. Or contact your IT Security team directly\n\n` +
      `**Golden rule:** It is always better to report something that turns out to be nothing, than to say nothing about a real attack.\n\n` +
      `⚡ *Early reports save organisations hundreds of thousands of pounds in breach costs.*`,
  },

  // ── Training ──
  {
    patterns: [/training/i, /course/i, /module/i, /learn/i, /aware(ness)?/i],
    category: 'training',
    reply: () =>
      `🎓 **Security Awareness Training**\n\n` +
      `Regular training is the most effective defence against cyber threats.\n\n` +
      `**Your training dashboard:**\n` +
      `• Go to **Training** in the sidebar to see assigned modules\n` +
      `• Complete each module and pass the quiz to mark it done\n` +
      `• Your risk score decreases with each completion\n\n` +
      `**Recommended modules:**\n` +
      `1. 🎣 Phishing Awareness — spot and report threats\n` +
      `2. 🔑 Password Security — create and manage strong passwords\n` +
      `3. 🎭 Social Engineering — resist manipulation\n` +
      `4. 🔒 Ransomware Prevention — protect your files\n` +
      `5. 🏛️ GDPR Essentials — handle data responsibly\n\n` +
      `💡 *New modules are added regularly. Keep your completion rate at 100%.*`,
  },

  // ── Zero Trust ──
  {
    patterns: [/zero\s*trust/i, /least\s*privile/i, /access\s*control/i, /iam\b/i],
    category: 'zero-trust',
    reply: () =>
      `🏰 **Zero Trust Security Model**\n\n` +
      `"Never trust, always verify" — assume every request could be malicious, even from inside the network.\n\n` +
      `**Core principles:**\n` +
      `• **Verify explicitly** — authenticate every request with identity + device health\n` +
      `• **Least privilege** — grant minimum permissions needed for the task\n` +
      `• **Assume breach** — design systems so a breach in one area doesn't cascade\n\n` +
      `**In practice this means:**\n` +
      `• Use MFA everywhere\n` +
      `• Don't use admin accounts for daily tasks\n` +
      `• Request access only for as long as you need it\n` +
      `• Keep software and OS updated\n\n` +
      `💡 *Ask your IT team if your organisation has a Zero Trust policy.*`,
  },

  // ── Thanks ──
  {
    patterns: [/\b(thank(s| you)|cheers|great|awesome|helpful|perfect|good bot)\b/i],
    category: 'thanks',
    reply: () =>
      `😊 Glad I could help! Stay safe and remember:\n\n` +
      `🎣 **Think before you click**\n` +
      `🔑 **Use a password manager**\n` +
      `🔐 **Enable MFA everywhere**\n` +
      `📢 **Report anything suspicious**\n\n` +
      `Feel free to ask me anything else about cybersecurity!`,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// CHAT ENGINE — matches user message against knowledge base
// ─────────────────────────────────────────────────────────────────────────────
export const answerChat = (message) => {
  const text = message.trim();

  for (const entry of KB) {
    if (entry.patterns.some((p) => p.test(text))) {
      return {
        reply: typeof entry.reply === 'function' ? entry.reply() : entry.reply,
        category: entry.category,
        matched: true,
      };
    }
  }

  // Fallback — unrecognised topic
  return {
    reply:
      `🤔 I'm not sure about that specific topic yet. Here's what I can help with:\n\n` +
      `• **Phishing** — spotting and reporting suspicious emails\n` +
      `• **Passwords & MFA** — strong authentication practices\n` +
      `• **Ransomware** — prevention and response\n` +
      `• **Social Engineering** — recognising manipulation\n` +
      `• **GDPR** — data protection essentials\n` +
      `• **VPN** — safe remote working\n` +
      `• **Malware** — protection and response\n` +
      `• **Risk Score** — understanding your rating\n` +
      `• **Training** — completing your security modules\n` +
      `• **Incident Reporting** — what to do if something goes wrong\n\n` +
      `Try asking about any of these topics!`,
    category: 'unknown',
    matched: false,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// USER BEHAVIOUR ANALYSIS
// ─────────────────────────────────────────────────────────────────────────────
export const analyzeUserBehavior = async (userId) => {
  const [events, latestRisk, trainings] = await Promise.all([
    PhishingEvent.find({ user: userId }).sort('-timestamp').limit(50),
    RiskScore.findOne({ user: userId }).sort('-calculatedAt'),
    Training.find({ assignedTo: userId }),
  ]);

  const clickCount     = events.filter((e) => e.eventType === 'clicked').length;
  const reportCount    = events.filter((e) => e.eventType === 'reported').length;
  const openedCount    = events.filter((e) => e.eventType === 'opened').length;
  const submittedCount = events.filter((e) => e.eventType === 'submitted').length;

  const completedCount = trainings.filter((t) =>
    t.completedBy?.some((c) => String(c.user) === String(userId))
  ).length;

  const totalTrainings = trainings.length;
  const completionPct  = totalTrainings > 0 ? Math.round((completedCount / totalTrainings) * 100) : 100;

  const behaviorFlags = [];
  if (clickCount > 0)               behaviorFlags.push({ flag: 'Phishing links clicked', severity: clickCount > 3 ? 'high' : 'medium' });
  if (submittedCount > 0)           behaviorFlags.push({ flag: 'Credentials submitted on phishing page', severity: 'high' });
  if (reportCount === 0 && clickCount > 0) behaviorFlags.push({ flag: 'No threat reports despite phishing exposure', severity: 'medium' });
  if (completionPct < 50)           behaviorFlags.push({ flag: 'Low training completion rate', severity: 'high' });
  else if (completionPct < 80)      behaviorFlags.push({ flag: 'Training partially complete', severity: 'medium' });
  if (openedCount > 5)              behaviorFlags.push({ flag: 'High rate of opening suspicious emails', severity: 'low' });

  // Positive flags
  const positiveFlags = [];
  if (reportCount > 0)              positiveFlags.push('Reported phishing attempts ✅');
  if (completionPct === 100 && totalTrainings > 0) positiveFlags.push('All training modules complete ✅');
  if (clickCount === 0 && openedCount > 0) positiveFlags.push('Opened but did not click phishing links ✅');

  // Insight narrative
  let insight = '';
  if (behaviorFlags.length === 0 && positiveFlags.length > 0) {
    insight = 'Excellent security behaviour! Keep it up.';
  } else if (behaviorFlags.some((f) => f.severity === 'high')) {
    insight = 'Your behaviour shows some high-risk patterns. Please review the flagged areas and complete your training.';
  } else {
    insight = 'Your security posture is developing. Address the flagged areas to lower your risk score.';
  }

  return {
    userId,
    analyzedAt: new Date(),
    riskLevel: latestRisk?.level ?? 'unknown',
    riskScore: latestRisk?.score ?? null,
    summary: {
      phishingClicks:      clickCount,
      phishingOpened:      openedCount,
      credentialsSubmitted: submittedCount,
      threatsReported:     reportCount,
      trainingsAssigned:   totalTrainings,
      trainingsCompleted:  completedCount,
      completionPct,
    },
    behaviorFlags,
    positiveFlags,
    insight,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// PERSONALISED TRAINING RECOMMENDATIONS
// ─────────────────────────────────────────────────────────────────────────────
export const generateRecommendations = async (userId) => {
  const [events, trainings, latestRisk] = await Promise.all([
    PhishingEvent.find({ user: userId }),
    Training.find({ assignedTo: userId }),
    RiskScore.findOne({ user: userId }).sort('-calculatedAt'),
  ]);

  const clicked     = events.some((e) => e.eventType === 'clicked');
  const submitted   = events.some((e) => e.eventType === 'submitted');
  const neverReport = events.length > 0 && !events.some((e) => e.eventType === 'reported');
  const completedIds = new Set(
    trainings
      .filter((t) => t.completedBy?.some((c) => String(c.user) === String(userId)))
      .map((t) => String(t._id))
  );
  const hasIncomplete = trainings.some((t) => !completedIds.has(String(t._id)));
  const riskScore = latestRisk?.score ?? 50;

  const recommendations = [];

  if (submitted) {
    recommendations.push({
      category: 'phishing',
      reason: 'You submitted credentials on a simulated phishing page — this is a critical risk. Complete the phishing awareness module immediately.',
      priority: 'high',
    });
  } else if (clicked) {
    recommendations.push({
      category: 'phishing',
      reason: 'You clicked a simulated phishing link. Completing the phishing awareness module will help you recognise attack patterns.',
      priority: 'high',
    });
  }

  if (neverReport) {
    recommendations.push({
      category: 'incident-reporting',
      reason: 'You have never reported a suspicious email. Reporting threats is critical to protecting the whole organisation.',
      priority: 'high',
    });
  }

  if (hasIncomplete) {
    recommendations.push({
      category: 'training',
      reason: 'You have incomplete training modules. Finish them to improve your risk score and security awareness.',
      priority: 'medium',
    });
  }

  if (riskScore >= 70) {
    recommendations.push({
      category: 'risk-reduction',
      reason: 'Your risk score is high. Focus on completing all training and reporting any suspicious activity you encounter.',
      priority: 'high',
    });
  }

  // Always recommend core modules
  recommendations.push({
    category: 'password',
    reason: 'Password hygiene is a core security skill. Enable a password manager and review your password practices.',
    priority: clicked || submitted ? 'high' : 'medium',
  });

  recommendations.push({
    category: 'mfa',
    reason: 'Enable Multi-Factor Authentication on all work accounts to add a critical second layer of protection.',
    priority: 'medium',
  });

  recommendations.push({
    category: 'social-engineering',
    reason: 'Understanding social engineering tactics helps you resist manipulation — a skill equally important as spotting phishing.',
    priority: 'low',
  });

  // De-duplicate by category, keep highest priority
  const priorityRank = { high: 0, medium: 1, low: 2 };
  const deduplicated = Object.values(
    recommendations.reduce((acc, r) => {
      if (!acc[r.category] || priorityRank[r.priority] < priorityRank[acc[r.category].priority]) {
        acc[r.category] = r;
      }
      return acc;
    }, {})
  ).sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority]);

  return { userId, generatedAt: new Date(), recommendations: deduplicated };
};
