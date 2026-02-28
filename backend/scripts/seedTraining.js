/**
 * Seed script — inserts 5 cybersecurity training modules with full content + quizzes.
 * Run: node backend/scripts/seedTraining.js
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import Training from '../models/Training.js';

const MODULES = [
  // ─────────────────────────────────────────────────────────────────────────
  {
    title: 'Phishing Awareness',
    category: 'phishing',
    description:
      'Learn how to identify, avoid, and report phishing emails — the #1 attack vector in cybersecurity.',
    durationMinutes: 15,
    passingScore: 70,
    content: `
## What is Phishing?
Phishing is a social engineering attack where criminals send fraudulent emails pretending to be a trusted source — your bank, your CEO, or even IT support — to trick you into revealing credentials or clicking malicious links.

## How to Spot a Phishing Email
**Check the sender address carefully:**
- Legitimate emails from your bank will come from @yourbank.com — not @yourbank-support.net
- Look for subtle typos: "arnazon.com" instead of "amazon.com"

**Watch for urgency tactics:**
- "Your account will be suspended in 24 hours!"
- "Immediate action required — verify your identity now"

**Hover over links before clicking:**
- The URL shown in your browser's status bar may differ from the link text
- Phishing URLs often look similar but not identical to real ones

**Be suspicious of unexpected attachments:**
- Unexpected invoices, delivery notifications, or HR documents
- Never enable macros in Office files from unknown senders

**Generic greetings are a red flag:**
- "Dear Customer" instead of your actual name suggests a mass phishing campaign

## What To Do
1. Do NOT click any links or open attachments
2. Report the email using the Report button in your email client
3. Delete the email from your inbox and trash
4. If you accidentally clicked — change your password immediately and tell IT
`,
    questions: [
      {
        question: 'You receive an email from "support@your-bank-secure.net" asking you to verify your account. What should you do?',
        options: [
          'Click the link and verify immediately',
          'Ignore it and do nothing',
          'Report it as phishing and do not click any links',
          'Forward it to colleagues to warn them',
        ],
        correctIndex: 2,
      },
      {
        question: 'Which of the following is the most reliable way to check if a link in an email is safe?',
        options: [
          'The link text looks like a real website',
          'Hover over the link and check the actual URL in the status bar',
          'The email came from someone you recognise',
          'The email has a professional logo and formatting',
        ],
        correctIndex: 1,
      },
      {
        question: 'What is a common urgency tactic used in phishing emails?',
        options: [
          '"We hope this email finds you well"',
          '"Your account will be locked in 24 hours — act now!"',
          '"Please review the attached quarterly report"',
          '"Thank you for your recent purchase"',
        ],
        correctIndex: 1,
      },
      {
        question: 'You accidentally clicked a link in a phishing email. What is your FIRST action?',
        options: [
          'Restart your computer',
          'Do nothing — one click cannot cause harm',
          'Change your password immediately and notify IT Security',
          'Delete the email from your inbox',
        ],
        correctIndex: 2,
      },
      {
        question: 'A phishing email that targets a specific named individual using personal details is called:',
        options: [
          'Mass phishing',
          'Smishing',
          'Vishing',
          'Spear phishing',
        ],
        correctIndex: 3,
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    title: 'Password Security & Management',
    category: 'password',
    description:
      'Master the art of creating strong passwords, using password managers, and avoiding credential pitfalls.',
    durationMinutes: 12,
    passingScore: 70,
    content: `
## Why Passwords Matter
83% of data breaches involve compromised credentials. A weak or reused password is an open door to attackers.

## What Makes a Strong Password?
**Length is the most important factor:**
- 8 characters → cracked in hours
- 12 characters → cracked in weeks
- 16+ characters → centuries (with complexity)

**Use passphrases:**
- "Coffee!Umbrella#Rocket9" is both strong AND memorable
- Avoid keyboard patterns: qwerty, 123456, password1

**Never reuse passwords:**
- If one site is breached and you reuse that password, ALL your accounts are at risk
- This is called "credential stuffing" — automated tools test breached passwords on thousands of sites

## Password Managers
A password manager stores all your passwords encrypted behind one master password. You only ever need to remember one strong password.

**Recommended managers:**
- Bitwarden (free, open-source)
- 1Password (paid)
- KeePass (offline)

**They can:**
- Generate unique, random passwords for every site
- Auto-fill login forms
- Alert you when your credentials appear in a breach

## Multi-Factor Authentication
Even if your password leaks, MFA prevents attackers from logging in. Always enable MFA on:
- Work email and SSO
- Password manager
- Financial accounts
- Cloud storage

## Red Flags
- Writing passwords on sticky notes or in a plain text file
- Using your name, birthday, or company name
- Sharing passwords via email or chat
- Using the same password for work and personal accounts
`,
    questions: [
      {
        question: 'Which of these is the strongest password?',
        options: [
          'Password123!',
          'p@ssw0rd',
          'Coffee!Umbrella#Rocket9',
          'MyName2024',
        ],
        correctIndex: 2,
      },
      {
        question: 'What is "credential stuffing"?',
        options: [
          'Using the same password on multiple sites',
          'Using breached username/password combinations to attack other sites automatically',
          'Guessing common passwords like "123456"',
          'Creating a fake login page to steal credentials',
        ],
        correctIndex: 1,
      },
      {
        question: 'What is the main advantage of using a password manager?',
        options: [
          'It makes your passwords shorter and easier to remember',
          'It stores all passwords in a plain text file for easy access',
          'It generates and stores unique, strong passwords for every account',
          'It automatically changes your password every day',
        ],
        correctIndex: 2,
      },
      {
        question: 'You need to share a password with a colleague urgently. What is the safest method?',
        options: [
          'Send it in a WhatsApp message',
          'Email it with "CONFIDENTIAL" in the subject line',
          'Use a secure password-sharing feature in a password manager',
          'Write it on a sticky note and hand it over in person',
        ],
        correctIndex: 2,
      },
      {
        question: 'How often should you change your password?',
        options: [
          'Every 30 days regardless',
          'Only when you suspect it has been compromised or after a breach notification',
          'Never — changing passwords is bad practice',
          'Every 7 days for maximum security',
        ],
        correctIndex: 1,
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    title: 'Multi-Factor Authentication (MFA)',
    category: 'general',
    description:
      'Understand why MFA is your most powerful account protection and how to use it correctly.',
    durationMinutes: 10,
    passingScore: 70,
    content: `
## What is MFA?
Multi-Factor Authentication requires you to prove your identity using two or more of the following:
- **Something you know** — password or PIN
- **Something you have** — your phone, hardware key
- **Something you are** — fingerprint, face ID

Even if an attacker has your password, they cannot log in without your second factor.

## MFA Methods — Ranked by Security

### 1. Hardware Security Keys (Strongest)
- Physical USB/NFC devices (YubiKey, Google Titan)
- Immune to phishing — the key verifies the real website
- Best for high-value accounts

### 2. Authenticator Apps (Recommended)
- Google Authenticator, Microsoft Authenticator, Authy
- Generates a new 6-digit code every 30 seconds (TOTP)
- Not tied to your phone number — more secure than SMS

### 3. SMS / Email Codes (Adequate)
- A one-time code sent to your phone or email
- Vulnerable to SIM-swapping attacks
- Better than nothing, but use app-based MFA when possible

## Common MFA Attacks to Know
**MFA Fatigue (Push Bombing):**
Attackers send dozens of MFA push notifications hoping you'll approve one by accident.
→ Never approve an MFA request you didn't initiate. Call IT immediately.

**Real-time Phishing Proxy:**
A phishing site relays your credentials AND your MFA code to the real site in real time.
→ Hardware keys prevent this entirely.

## Golden Rules
- Never share your MFA code with anyone — support staff will never ask for it
- Set up backup codes when you enrol in MFA — store them securely
- Enable MFA on: email, VPN, banking, cloud storage, password manager
`,
    questions: [
      {
        question: 'You receive 10 MFA push notification requests in a row that you did not initiate. What should you do?',
        options: [
          'Approve one to make them stop',
          'Deny all and immediately notify IT Security',
          'Ignore them and they will stop eventually',
          'Disable MFA to prevent further notifications',
        ],
        correctIndex: 1,
      },
      {
        question: 'Which MFA method is most resistant to phishing attacks?',
        options: [
          'SMS one-time codes',
          'Email one-time codes',
          'Authenticator app TOTP codes',
          'Hardware security keys (e.g. YubiKey)',
        ],
        correctIndex: 3,
      },
      {
        question: 'A colleague calls asking for your MFA code because they\'re helping set up your account. What do you do?',
        options: [
          'Give them the code — they are a trusted colleague',
          'Refuse — legitimate staff will never ask for your MFA code',
          'Give them only the last 3 digits',
          'Email the code instead of reading it out loud',
        ],
        correctIndex: 1,
      },
      {
        question: 'What is SIM-swapping and which MFA type is vulnerable to it?',
        options: [
          'Replacing a phone battery — affects authenticator apps',
          'Convincing a carrier to transfer your phone number to a new SIM — makes SMS codes vulnerable',
          'Hacking a phone directly — affects hardware keys',
          'Cloning an app — affects all MFA types equally',
        ],
        correctIndex: 1,
      },
      {
        question: 'When setting up MFA, you are given backup codes. What should you do with them?',
        options: [
          'Delete them — they are not needed if you have your phone',
          'Store them securely offline (e.g. printed in a safe, or in a password manager)',
          'Save them in a note on your phone',
          'Email them to yourself for easy access',
        ],
        correctIndex: 1,
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    title: 'Ransomware Prevention & Response',
    category: 'general',
    description:
      'Learn what ransomware is, how it spreads, and the exact steps to prevent and respond to an attack.',
    durationMinutes: 18,
    passingScore: 70,
    content: `
## What is Ransomware?
Ransomware is malware that encrypts your files and demands payment (usually cryptocurrency) for the decryption key. Once encrypted, your files are inaccessible without the key.

## How Ransomware Spreads
**Email phishing (most common):**
- Malicious attachments (Word docs with macros, zip files)
- Links leading to drive-by download sites

**Remote Desktop Protocol (RDP) exploits:**
- Attackers scan for exposed RDP ports with weak passwords
- Common entry point for targeted corporate ransomware

**Unpatched software vulnerabilities:**
- WannaCry (2017) exploited an unpatched Windows vulnerability and infected 200,000 computers

**USB drives:**
- Infected USB drives left in car parks — people plug them in out of curiosity

## Prevention Checklist
✅ Keep your OS and all software fully patched (enable auto-updates)
✅ Follow the 3-2-1 backup rule: 3 copies, 2 different media, 1 offsite
✅ Never open unexpected attachments — even from known senders
✅ Use endpoint detection and response (EDR) software
✅ Don't plug in USB drives you did not purchase yourself
✅ Never allow macros in Office files from unknown sources
✅ Use the principle of least privilege — don't run as administrator daily

## If You Are Hit — Immediate Response
1. **DISCONNECT immediately** — unplug the ethernet cable and disable Wi-Fi
2. **Do NOT power off** — forensic evidence is preserved in memory
3. **Call IT Security immediately** — do not try to fix it yourself
4. **Do NOT pay the ransom** — payment funds future attacks and does not guarantee recovery
5. **Document everything** — take photos of the ransom note on screen

## Recovery
- Restore from clean backups
- Conduct a root-cause investigation before reconnecting
- Report to authorities (Action Fraud, NCSC)
- Notify affected parties as required by GDPR
`,
    questions: [
      {
        question: 'You notice files on your computer have strange extensions and a note appears demanding Bitcoin. What is your FIRST action?',
        options: [
          'Pay the ransom immediately to recover files',
          'Power off the computer to stop the encryption',
          'Disconnect from the network immediately and call IT Security',
          'Try to remove the malware using antivirus',
        ],
        correctIndex: 2,
      },
      {
        question: 'What does the 3-2-1 backup rule mean?',
        options: [
          '3 passwords, 2 devices, 1 cloud backup',
          '3 copies of data, 2 different storage media, 1 copy offsite',
          'Back up every 3 days, with 2 versions retained, 1 local copy',
          '3-minute, 2-hour, 1-day backup intervals',
        ],
        correctIndex: 1,
      },
      {
        question: 'Why is it NOT recommended to pay the ransom?',
        options: [
          'Cryptocurrency transactions are traceable',
          'Payment funds future attacks and does not guarantee file recovery',
          'Paying is illegal in all countries',
          'The decryption key is never provided after payment',
        ],
        correctIndex: 1,
      },
      {
        question: 'How did the WannaCry ransomware spread so rapidly in 2017?',
        options: [
          'Via phishing emails sent to millions of users',
          'Through unpatched Windows systems exploiting a known vulnerability',
          'By infecting USB drives distributed at conferences',
          'Via malicious apps on mobile phones',
        ],
        correctIndex: 1,
      },
      {
        question: 'You find a USB drive in the car park with your company\'s logo on it. What do you do?',
        options: [
          'Plug it in to see if it belongs to a colleague',
          'Plug it into a spare computer to check safely',
          'Hand it to IT Security without plugging it in',
          'Leave it where you found it',
        ],
        correctIndex: 2,
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    title: 'Social Engineering & Manipulation',
    category: 'social-engineering',
    description:
      'Recognise and resist psychological manipulation tactics used by attackers to bypass technical controls.',
    durationMinutes: 14,
    passingScore: 70,
    content: `
## What is Social Engineering?
Social engineering exploits human psychology rather than technical vulnerabilities. Attackers manipulate people into breaking security procedures or revealing confidential information.

**Famous example:** In 2020, Twitter was hacked via phone-based social engineering — attackers convinced Twitter employees to provide VPN credentials by impersonating IT staff.

## Core Manipulation Tactics

### Authority
Impersonating a CEO, HMRC, police, or IT department. The target feels pressure to comply without questioning.
→ Always verify identity through a separate, known channel.

### Urgency & Fear
"You will be audited tomorrow unless you transfer these funds now."
→ Slow down. Legitimate requests can always wait for proper verification.

### Reciprocity
Doing you a small favour first to make you feel obligated to comply.
→ Be aware of unsolicited help or gifts before a request.

### Social Proof
"Everyone else in your team has already approved this."
→ Verify independently — do not rely on claims about others.

### Liking & Trust
Building rapport over time (weeks or months) before making a malicious request. Known as a "long con."
→ Be cautious even with people you believe you know online.

## Attack Channels

**Vishing (voice phishing):**
Phone calls impersonating IT, HMRC, banks. They may already know some personal details (from LinkedIn, data breaches) to build credibility.

**Pretexting:**
Fabricating a scenario — "I'm from the audit team and need your login to complete the review."

**Tailgating / Piggybacking:**
Physically following an authorised person through a secure door.

**Baiting:**
Leaving infected USB drives or CDs with enticing labels ("Q4 Salaries") in public areas.

## Defence Principles
1. **Verify before you comply** — call back on a known number, not one they provide
2. **Slow down under pressure** — urgency is a manipulation tactic
3. **Never share credentials** — not even with IT (they don't need them)
4. **Report anything suspicious** — even incomplete attempts
5. **Protect your digital footprint** — limit what you share on LinkedIn and social media
`,
    questions: [
      {
        question: 'An attacker builds a friendly relationship with a target over several months before making a malicious request. This is called:',
        options: [
          'Pretexting',
          'Baiting',
          'A long con (sustained social engineering)',
          'Vishing',
        ],
        correctIndex: 2,
      },
      {
        question: 'You receive a call from someone claiming to be from IT, saying they need your password to fix an urgent server issue. What do you do?',
        options: [
          'Provide the password — IT needs it to help you',
          'Provide only your username, not the password',
          'Refuse — IT staff never need your password — report the call',
          'Change your password and then share the new one',
        ],
        correctIndex: 2,
      },
      {
        question: 'A stranger follows closely behind you as you badge through a secure door. This attack is called:',
        options: [
          'Vishing',
          'Tailgating / Piggybacking',
          'Pretexting',
          'Baiting',
        ],
        correctIndex: 1,
      },
      {
        question: 'Which psychological principle does this use: "Your CEO has already approved this — I just need your sign-off to proceed immediately"?',
        options: [
          'Reciprocity',
          'Liking',
          'Authority combined with urgency',
          'Social proof combined with urgency',
        ],
        correctIndex: 3,
      },
      {
        question: 'Someone calls claiming to be from HMRC saying you owe tax and will be arrested unless you buy iTunes vouchers in the next hour. This is:',
        options: [
          'A legitimate HMRC enforcement call',
          'A vishing attack using authority and urgency as manipulation tactics',
          'A phishing email forwarded to your phone',
          'A pretexting attack via baiting',
        ],
        correctIndex: 1,
      },
    ],
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // Remove existing training docs to avoid duplicates
  const deleted = await Training.deleteMany({});
  console.log(`🗑️  Deleted ${deleted.deletedCount} existing training modules`);

  const created = await Training.insertMany(MODULES);
  console.log(`✅ Inserted ${created.length} training modules:`);
  created.forEach((m) => console.log(`   • [${m.category}] ${m.title} (${m.questions.length} questions)`));

  await mongoose.disconnect();
  console.log('✅ Done — disconnected from MongoDB');
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
