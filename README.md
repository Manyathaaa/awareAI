# 🛡️ AwareAI — Cybersecurity Awareness Platform

AwareAI is a full-stack cybersecurity awareness platform that helps organisations monitor, train, and protect employees against cyber threats. It combines phishing simulation, security training, AI-powered behaviour analysis, and real-time risk scoring into a single dashboard.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Installation](#installation)
  - [Running the App](#running-the-app)
- [API Reference](#-api-reference)
- [Frontend Pages](#-frontend-pages)
- [Data Models](#-data-models)
- [Role-Based Access Control](#-role-based-access-control)
- [Risk Score Engine](#-risk-score-engine)
- [AI Assistant](#-ai-assistant)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **Authentication** | JWT-based register/login with role-aware access control |
| 📊 **Dashboard** | Personal security overview with risk score, training progress, and campaign charts |
| 🎯 **Phishing Simulation** | Create campaigns, track sent/opened/clicked/reported events, view click-through rates |
| 🎓 **Security Training** | Module library with quizzes, auto-grading, badge rewards, and completion tracking |
| ⚠️ **Risk Scoring** | Algorithmic risk engine (0–100) factoring phishing behaviour and training completion |
| 🤖 **AI Assistant** | Rule-based cybersecurity chatbot covering phishing, passwords, MFA, ransomware & more |
| 🏅 **Badges** | Awarded automatically on training completion as gamification incentives |
| 🧑‍💼 **Role Management** | Employee / Manager / Admin access levels with route guards |

---

## 🧰 Tech Stack

### Backend
| Package | Purpose |
|---|---|
| [Express 5](https://expressjs.com/) | REST API framework |
| [Mongoose 9](https://mongoosejs.com/) | MongoDB ODM |
| [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) | JWT authentication |
| [bcryptjs](https://github.com/dcodeIO/bcrypt.js) | Password hashing |
| [dotenv](https://github.com/motdotla/dotenv) | Environment variable loading |
| [cors](https://github.com/expressjs/cors) | Cross-origin resource sharing |
| [nodemon](https://nodemon.io/) | Dev auto-restart |

### Frontend
| Package | Purpose |
|---|---|
| [React 18](https://react.dev/) | UI library |
| [Vite 5](https://vitejs.dev/) | Build tool & dev server |
| [React Router 6](https://reactrouter.com/) | Client-side routing |
| [Axios](https://axios-http.com/) | HTTP client |
| [Recharts](https://recharts.org/) | Chart visualisations |
| [Tailwind CSS 3](https://tailwindcss.com/) | Utility-first styling |

---

## 📁 Project Structure

```
awareAI/
├── package.json                  # Root package (backend deps + scripts)
├── README.md
│
├── backend/
│   ├── server.js                 # Express app entry point
│   │
│   ├── controllers/
│   │   ├── authController.js     # register, login, getMe, updateMe
│   │   ├── campaignController.js # CRUD for campaigns
│   │   ├── phishingController.js # Track events, get stats
│   │   ├── riskController.js     # Risk scores & recalculation
│   │   ├── trainingController.js # Training modules & quiz submission
│   │   └── aiController.js       # Behaviour analysis, recommendations, chat
│   │
│   ├── middlewares/
│   │   ├── auth.js               # JWT protect middleware
│   │   └── roles.js              # Role-based access guard
│   │
│   ├── models/
│   │   ├── User.js               # User schema (roles, badges, trainings)
│   │   ├── Campaign.js           # Phishing/awareness campaign schema
│   │   ├── PhishingEvent.js      # Individual phishing event (click, report…)
│   │   ├── RiskScore.js          # Risk score snapshot per user
│   │   ├── Training.js           # Training module with questions & completions
│   │   └── Badge.js              # Badge/achievement schema
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── campaignRoutes.js
│   │   ├── phishingRoutes.js
│   │   ├── riskRoutes.js
│   │   ├── trainingRoutes.js
│   │   └── aiRoutes.js
│   │
│   ├── services/
│   │   ├── aiAnalyzer.js         # Behaviour analysis + rule-based chat KB
│   │   ├── riskEngine.js         # Risk score calculation algorithm
│   │   ├── emailService.js       # Email delivery helper
│   │   └── smsService.js         # SMS delivery helper
│   │
│   └── scripts/
│       └── seedTraining.js       # Seed script for training modules
│
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── .env                      # Frontend env vars (VITE_API_URL)
    │
    └── src/
        ├── App.jsx               # Root router & route definitions
        ├── main.jsx              # React entry point
        ├── index.css             # Global Tailwind styles
        │
        ├── api/
        │   ├── client.js         # Axios instance with auth interceptor
        │   └── index.js          # API method exports (authAPI, riskAPI…)
        │
        ├── components/
        │   ├── Layout.jsx        # Shell with sidebar + outlet
        │   ├── Sidebar.jsx       # Navigation sidebar
        │   ├── ProtectedRoute.jsx# Auth & role guard HOC
        │   ├── StatCard.jsx      # Reusable metric card
        │   └── Spinner.jsx       # Loading spinner
        │
        ├── context/
        │   └── AuthContext.jsx   # Global auth state (user, login, logout)
        │
        └── pages/
            ├── Login.jsx         # Login form
            ├── Register.jsx      # Registration form
            ├── Dashboard.jsx     # Security overview & charts
            ├── Campaigns.jsx     # Campaign management (manager/admin)
            ├── Phishing.jsx      # Phishing events & stats (manager/admin)
            ├── Training.jsx      # Training modules & quiz UI
            ├── Risk.jsx          # Risk score leaderboard & history
            └── AIAssistant.jsx   # AI chatbot interface
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **MongoDB** (local instance or [MongoDB Atlas](https://www.mongodb.com/atlas))
- **npm** ≥ 9

---

### Environment Variables

#### Backend — create a `.env` file in the **project root**:

```env
PORT=3001
MONGO_URI=mongodb://localhost:27017/awareai
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

#### Frontend — the `frontend/.env` file:

```env
VITE_API_URL=http://localhost:3001
```

---

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Manyathaaa/awareAI.git
cd awareAI

# 2. Install backend dependencies
npm install

# 3. Install frontend dependencies
cd frontend
npm install
cd ..
```

---

### Running the App

**Backend** (from project root):
```bash
npm run dev        # development with nodemon
# or
npm start          # production
```

**Frontend** (from `frontend/` directory):
```bash
cd frontend
npm run dev        # starts Vite dev server on http://localhost:5173
```

**Seed training data** (optional):
```bash
node backend/scripts/seedTraining.js
```

---

## 📡 API Reference

All protected routes require an `Authorization: Bearer <token>` header.

### Auth — `/api/auth`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register a new user |
| `POST` | `/api/auth/login` | Public | Login and receive JWT |
| `GET` | `/api/auth/me` | Protected | Get current user profile |
| `PATCH` | `/api/auth/me` | Protected | Update name / department |

### Campaigns — `/api/campaigns`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/campaigns` | Manager/Admin | List all campaigns |
| `GET` | `/api/campaigns/:id` | Manager/Admin | Get campaign detail |
| `POST` | `/api/campaigns` | Manager/Admin | Create campaign |
| `PATCH` | `/api/campaigns/:id` | Manager/Admin | Update campaign |
| `DELETE` | `/api/campaigns/:id` | Admin | Delete campaign |

### Phishing — `/api/phishing`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/phishing/track` | Public | Track a phishing event (click, report…) |
| `GET` | `/api/phishing/events` | Manager/Admin | List all phishing events |
| `GET` | `/api/phishing/stats/:campaignId` | Manager/Admin | Click-through & report rates |

### Risk — `/api/risk`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/risk` | All | List risk scores (scoped by role) |
| `GET` | `/api/risk/:userId` | All | Latest score for a specific user |
| `GET` | `/api/risk/:userId/history` | All | Score history (up to 50 records) |
| `POST` | `/api/risk/calculate/:userId` | All | Trigger risk recalculation |

### Training — `/api/training`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/training` | All | List all training modules |
| `GET` | `/api/training/my` | All | Training assigned to the current user |
| `GET` | `/api/training/:id` | All | Get training detail (answers hidden for employees) |
| `POST` | `/api/training` | Manager/Admin | Create training module |
| `POST` | `/api/training/:id/submit` | All | Submit quiz answers & get score |

### AI — `/api/ai`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/ai/analyze/:userId` | All | Run AI behaviour analysis |
| `GET` | `/api/ai/recommendations/:userId` | All | Get personalised training recommendations |
| `POST` | `/api/ai/chat` | All | Chat with the AI security assistant |

---

## 🖥️ Frontend Pages

| Route | Page | Access | Description |
|---|---|---|---|
| `/login` | Login | Public | Email/password login |
| `/register` | Register | Public | New user registration |
| `/dashboard` | Dashboard | All | Risk score, training progress, campaign charts |
| `/training` | Training | All | Browse & complete training modules |
| `/risk` | Risk | All | Risk leaderboard & personal score history |
| `/ai` | AI Assistant | All | Cybersecurity chatbot |
| `/campaigns` | Campaigns | Manager/Admin | Create and manage campaigns |
| `/phishing` | Phishing | Manager/Admin | View phishing events and statistics |

---

## 🗃️ Data Models

### User
| Field | Type | Description |
|---|---|---|
| `name` | String | Full name |
| `email` | String | Unique email (lowercase) |
| `password` | String | Bcrypt-hashed (min 8 chars) |
| `role` | String | `employee` \| `manager` \| `admin` |
| `department` | String | Department name |
| `riskScore` | Number | Cached risk score |
| `badges` | ObjectId[] | Earned badges |
| `trainingsCompleted` | ObjectId[] | Completed training refs |
| `isActive` | Boolean | Account active flag |

### Campaign
| Field | Type | Description |
|---|---|---|
| `name` | String | Campaign name |
| `type` | String | `phishing` \| `training` \| `awareness` |
| `status` | String | `draft` \| `active` \| `completed` \| `archived` |
| `targetUsers` | ObjectId[] | Targeted users |
| `emailTemplate` | String | HTML email template |
| `phishingUrl` | String | Simulated phishing link |
| `stats` | Object | `{ sent, opened, clicked, reported }` |

### RiskScore
| Field | Type | Description |
|---|---|---|
| `user` | ObjectId | User reference |
| `score` | Number | 0–100 |
| `level` | String | `low` \| `medium` \| `high` \| `critical` |
| `factors` | Object | `{ phishingClicks, credentialsSubmitted, trainingCompletion, reportedThreats, timeToReport }` |
| `calculatedAt` | Date | Timestamp of calculation |

### Training
| Field | Type | Description |
|---|---|---|
| `title` | String | Module title |
| `category` | String | `phishing` \| `password` \| `social-engineering` \| `data-privacy` \| `general` |
| `content` | String | Rich markdown lesson text |
| `contentUrl` | String | Link to video/article |
| `durationMinutes` | Number | Estimated duration |
| `passingScore` | Number | Minimum pass percentage (default 70%) |
| `questions` | Array | `{ question, options[], correctIndex }` |
| `assignedTo` | ObjectId[] | Assigned users (empty = open to all) |
| `completedBy` | Array | `{ user, score, completedAt }` |

---

## 🔐 Role-Based Access Control

| Feature | Employee | Manager | Admin |
|---|---|---|---|
| View own dashboard | ✅ | ✅ | ✅ |
| View own risk score | ✅ | ✅ | ✅ |
| View all risk scores | ❌ | ✅ | ✅ |
| Complete training | ✅ | ✅ | ✅ |
| Create training | ❌ | ✅ | ✅ |
| View campaigns | ❌ | ✅ | ✅ |
| Create/edit campaigns | ❌ | ✅ | ✅ |
| Delete campaigns | ❌ | ❌ | ✅ |
| View phishing events | ❌ | ✅ | ✅ |
| Analyse any user (AI) | ❌ | ❌ | ✅ |
| Recalculate own risk | ✅ | ✅ | ✅ |
| Recalculate any risk | ❌ | ✅ | ✅ |

---

## ⚠️ Risk Score Engine

The risk engine produces a score from **0 (safest)** to **100 (most at risk)** using the following formula, evaluated over the last 30 days:

**Starting baseline:** 50

| Signal | Effect |
|---|---|
| Each phishing link clicked | +15 (capped at +45) |
| Each credential form submitted | +20 (capped at +40) |
| No reports despite exposure | +10 |
| Training completion < 50% | +15 |
| Training completion 50–79% | +5 |
| Each threat reported | −8 (capped at −24) |
| Training completion = 100% | −20 |
| Training completion 80–99% | −10 |
| Avg report time < 5 minutes | −5 |

**Risk Levels:**

| Score | Level |
|---|---|
| 0–29 | 🟢 Low |
| 30–54 | 🟡 Medium |
| 55–74 | 🟠 High |
| 75–100 | 🔴 Critical |

---

## 🤖 AI Assistant

The AI Assistant is a rule-based cybersecurity chatbot powered by a curated knowledge base (`aiAnalyzer.js`). It responds to natural language queries on the following topics:

- **Phishing** — how to spot and report suspicious emails
- **Passwords** — strong password creation and management
- **MFA / 2FA** — multi-factor authentication best practices
- **Ransomware** — prevention and incident response
- **Social Engineering** — recognising manipulation tactics
- **GDPR & Compliance** — data protection essentials
- **Risk Score** — understanding personal security ratings
- **VPN & Remote Work** — secure remote access guidance
- **Incident Response** — what to do when a breach occurs

The behaviour analysis endpoint (`GET /api/ai/analyze/:userId`) aggregates phishing events and training data to produce a narrative report, while the recommendations endpoint (`GET /api/ai/recommendations/:userId`) suggests relevant training modules based on the user's risk profile.

---

## 📄 License

ISC © [Manyathaaa](https://github.com/Manyathaaa)
