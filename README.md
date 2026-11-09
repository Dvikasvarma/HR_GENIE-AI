<p align="center">
  <img src="https://img.shields.io/badge/HRMS-Portal-0a6b6e?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiPjxwYXRoIGQ9Ik0xMiAxMmMyLjc2IDAgNS0yLjI0IDUtNXMtMi4yNC01LTUtNS01IDIuMjQtNSA1IDIuMjQgNSA1IDV6bTAgMmMtMi42NyAwLTggMS4zNC04IDR2Mmg3di0yYzAtMS4yLjYtMi4yNiAxLjU3LTMuMTVDMTMuMyAxNC4yOCAxNCAxNC41IDE0LjkzIDE0LjgzYy0uOTEtLjUyLTEuOTMtLjgzLTIuOTMtLjgzem02IDBjLS4yMiAwLS40NC4wMi0uNjUuMDUuOTcuNzMgMS42NSAxLjcyIDEuNjUgMi45NVYxOWg0di0xYzAtMi42Ni0zLjM0LTQtNS00eiIvPjwvc3ZnPg==&labelColor=0d1e27" alt="HRMS Portal" />
  <img src="https://img.shields.io/badge/AI%20Powered-Gemini%201.5-0d9298?style=for-the-badge&logo=google&logoColor=white" alt="AI Powered" />
  <img src="https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
  <img src="https://img.shields.io/badge/Backend-Power%20Automate-0066FF?style=for-the-badge&logo=microsoft&logoColor=white" alt="Power Automate" />
</p>

# 🏢 HR Genie — AI-Powered HRMS Portal

> **A modern, full-featured Human Resource Management System with AI-driven chatbot assistance, Microsoft Power Automate integrations, and a premium glassmorphic UI.**

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Pages & Modules](#-pages--modules)
- [Deployment](#-deployment)
- [Team](#-team)
- [License](#-license)

---

## 🌟 Overview

**HR Genie** is an end-to-end HRMS web application designed to simplify workforce management for both **employees** and **HR personnel**. It features role-based authentication, self-service dashboards, leave & attendance management, policy access, finance tracking, a campus module, and an **AI-powered chatbot** (powered by Google Gemini 1.5 Flash) that assists users with HR queries in real time.

The backend is powered by **Microsoft Power Automate** flows, enabling seamless integration with enterprise data sources without a traditional server.

---

## ✨ Features

### 🔐 Authentication & Access
- **Role-based login** — Separate portals for **Employees** and **HR Managers**
- Forgot password flow
- Session-based access control via `localStorage`

### 👤 Employee Self-Service
- **My Profile** — View and update personal, contact, and professional details
- **My Data** — Comprehensive employee data dashboard with charts and analytics
- **Self Details** — Detailed personal information management

### 📊 HR Dashboard
- Consolidated HR overview with employee metrics
- Manage and approve employee requests
- Dark-themed premium dashboard UI

### 📅 Leave & Attendance
- **Apply for Leave** — Submit leave requests with date ranges and reasons
- **Leave Status** — Track pending, approved, and rejected leave requests
- **Attendance Tracking** — Monthly attendance records via Power Automate

### 💰 Finance Module
- Salary and compensation information
- Financial records and payslip access

### 🏫 Campus Module
- Campus-related activities and events
- Recruitment and onboarding tracking

### 📜 Policy & Compliance
- **HR Policies** — Company policies accessible to all employees
- **Privacy Policy** & **Terms of Use** — Legal documentation pages

### 🤖 AI Chatbot (Smart AI HRMS)
- Integrated across all pages via a floating chat widget
- Powered by **Google Gemini 1.5 Flash** API
- Quick-reply chips for common actions (Apply for Leave, Check Status, HR Policies)
- Context-aware HR responses with markdown support

### 🔍 Finder
- Search and locate employees, departments, and resources

### 🛤️ My Track
- Track career progression, tasks, and milestones

### 📞 Support
- Dedicated support page for helpdesk and issue resolution

### 📖 API Documentation
- Built-in interactive API docs page for developer reference

---

## 🛠️ Tech Stack

| Layer         | Technology                                                      |
| ------------- | --------------------------------------------------------------- |
| **Frontend**  | HTML5, CSS3 (Glassmorphic design), Vanilla JavaScript           |
| **AI Engine** | Google Gemini 1.5 Flash via `@google/generative-ai` SDK         |
| **Backend**   | Microsoft Power Automate (cloud flows as REST endpoints)        |
| **API Proxy** | Vercel Serverless Functions (Node.js)                           |
| **Hosting**   | Vercel                                                          |
| **Fonts**     | Google Fonts — DM Sans, Instrument Serif, Playfair Display      |
| **Icons**     | Font Awesome 6.4                                                |
| **Components**| React (JSX) for selected modules (My Data Page)                 |

---

## 📁 Project Structure

```
HRMS-main/
├── api/                              # Vercel serverless API routes
│   ├── chat.js                       # Gemini AI chatbot proxy endpoint
│   └── powerautomate.js              # Power Automate proxy (auth, profile, leave, attendance)
│
├── HRMS-main/                        # Core application source
│   ├── api/                          # Additional API route copies
│   ├── react-components/             # React components
│   │   ├── MyDataPage.jsx            # Employee data dashboard (React)
│   │   └── MyDataPage.css            # Styles for data dashboard
│   ├── chatbot.js                    # AI chatbot logic (Gemini integration)
│   ├── chatbot.css                   # Chatbot widget styles
│   ├── dashboard_hr.html             # HR Manager dashboard
│   ├── hrms_landing_page.html        # Public landing page
│   ├── hrms_employee_login_page.html # Employee login
│   ├── hrms_HR_login_page.html       # HR login
│   ├── hrms_my_profile.html          # Employee profile page
│   ├── hrms_my_data_page.html        # Employee data analytics
│   ├── hrms_my_track.html            # Career tracking page
│   ├── hrms_my_finance.html          # Finance & payroll page
│   ├── hrms_my_campus.html           # Campus module
│   ├── hrms_my_policy.html           # Company policies
│   ├── hrms_self_details-page.html   # Self-service details
│   ├── hrms_finder.html              # Employee/resource finder
│   ├── hrms_support.html             # Support & helpdesk
│   ├── hrms_forgot_password.html     # Password recovery
│   ├── hrms_privacy_policy.html      # Privacy policy
│   ├── hrms_terms_of_use.html        # Terms of use
│   ├── hrms_Api_docs.html            # API documentation page
│   ├── index.html                    # App entry point
│   ├── package.json                  # Dependencies & scripts
│   ├── vercel.json                   # Vercel deployment config
│   └── .env                          # Environment variables (not committed)
│
├── index.html                        # Root sign-in page
├── hrms_*.html                       # Duplicate page files (root-level)
├── users_dataset.csv                 # Sample user seed data
├── coming_soon_illustration.png      # Placeholder illustration
└── .gitignore.txt                    # Git ignore rules
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- **Vercel CLI** (optional, for local development)
  ```bash
  npm i -g vercel
  ```

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Dvikasvarma/HR_GENIE-AI-TEAM-10.git
   cd HR_GENIE-AI-TEAM-10
   ```

2. **Install dependencies**
   ```bash
   cd HRMS-main
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the `HRMS-main/` directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Run locally**
   ```bash
   npm start
   # or
   vercel dev
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

---

## 🔑 Environment Variables

| Variable         | Description                                  | Required |
| ---------------- | -------------------------------------------- | -------- |
| `GEMINI_API_KEY`  | Google Gemini API key for AI chatbot          | ✅        |

> **⚠️ Important:** Never commit your `.env` file. It is already listed in `.gitignore`.

---

## 📡 API Reference

The application exposes two serverless API endpoints via Vercel:

### `POST /api/chat`

Proxies messages to the **Google Gemini 1.5 Flash** API for AI chatbot responses.

**Request Body:**
```json
{
  "contents": [
    {
      "parts": [
        { "text": "How do I apply for leave?" }
      ]
    }
  ]
}
```

**Response:** Gemini API response object.

---

### `POST /api/powerautomate`

Proxies requests to **Microsoft Power Automate** cloud flows. Supports the following actions:

| Action            | Method | Description                          |
| ----------------- | ------ | ------------------------------------ |
| `loginAuth`       | POST   | Authenticate employee/HR credentials |
| `getProfile`      | GET    | Retrieve employee profile by email   |
| `postProfile`     | POST   | Update employee profile data         |
| `postLeave`       | POST   | Submit a leave request               |
| `getLeave`        | POST   | Retrieve leave records               |
| `getAttendance`   | POST   | Fetch monthly attendance data        |

**Request Body:**
```json
{
  "action": "loginAuth",
  "payload": {
    "email": "user@example.com",
    "password": "password123"
  }
}
```

> 📖 For detailed API documentation, visit the built-in [API Docs page](HRMS-main/hrms_Api_docs.html) within the application.

---

## 📄 Pages & Modules

| Page                    | File                            | Description                            |
| ----------------------- | ------------------------------- | -------------------------------------- |
| **Sign In**             | `index.html`                    | Employee sign-in page (root)           |
| **Landing Page**        | `hrms_landing_page.html`        | Public-facing marketing page           |
| **Employee Login**      | `hrms_employee_login_page.html` | Employee authentication                |
| **HR Login**            | `hrms_HR_login_page.html`       | HR Manager authentication              |
| **HR Dashboard**        | `dashboard_hr.html`             | HR Manager analytics & management      |
| **My Profile**          | `hrms_my_profile.html`          | Employee profile view & edit           |
| **My Data**             | `hrms_my_data_page.html`        | Employee data analytics dashboard      |
| **Self Details**        | `hrms_self_details-page.html`   | Personal information management        |
| **My Track**            | `hrms_my_track.html`            | Career & task tracking                 |
| **My Finance**          | `hrms_my_finance.html`          | Salary & compensation                  |
| **My Campus**           | `hrms_my_campus.html`           | Campus activities & events             |
| **My Policy**           | `hrms_my_policy.html`           | Company HR policies                    |
| **Finder**              | `hrms_finder.html`              | Employee & resource search             |
| **Support**             | `hrms_support.html`             | Helpdesk & issue resolution            |
| **Forgot Password**     | `hrms_forgot_password.html`     | Password recovery flow                 |
| **Privacy Policy**      | `hrms_privacy_policy.html`      | Privacy policy page                    |
| **Terms of Use**        | `hrms_terms_of_use.html`        | Terms of use page                      |
| **API Docs**            | `hrms_Api_docs.html`            | Interactive API documentation          |

---

## 🌐 Deployment

This project is configured for **Vercel** deployment.

### Deploy to Vercel

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

3. **Set environment variables** in the Vercel dashboard:
   - `GEMINI_API_KEY` → Your Google Gemini API key

### Vercel Configuration

The `vercel.json` file routes all `/api/*` requests to the serverless functions:

```json
{
  "version": 2,
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    }
  ]
}
```

---

## 👥 Team

**AI Team 10 — HR Genie**

| Member              | Role                |
| ------------------- | ------------------- |
| Vikas Varma D       | Team Lead           |

> *Built as part of the HR Genie AI project initiative.*

---

## 📄 License

This project is proprietary and intended for internal/educational use. All rights reserved.

---

<p align="center">
  <sub>Built with ❤️ by <strong>AI Team 10</strong> — Powered by Google Gemini & Microsoft Power Automate</sub>
</p>
