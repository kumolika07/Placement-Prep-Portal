# 🎓 PlacementPrep — Postgraduate Placement Preparation Portal

A complete **MERN stack** placement preparation portal built for **postgraduate students** and the **Training & Placement Cell**. Students practice **aptitude tests**, share their **interview experiences**, and track their own progress, while **placement officers** log in to monitor the whole batch, moderate shared experiences, and manage the question bank.

> Built with **MongoDB, Express, Node.js** on the backend and **HTML5, CSS3, vanilla JavaScript** on the frontend — no React build step required, run it straight from the source.

---

## ✨ Features

### 🎓 Student Module
- Secure **register / login** with validated forms (username + password).
- **Aptitude tests** in 4 categories: *Quantitative, Logical Reasoning, Verbal Ability, Technical*.
- Choose number of questions (5/10/15/20) and difficulty (Easy / Medium / Hard).
- **Timed tests** (1 minute per question), auto-submit on timeout, auto-grading.
- **Instant result** with percentage, score breakdown and **full answer review** (correct/wrong answers + explanations).
- Test **history** and per-category performance tracking on the dashboard.
- **Share interview experiences** (company, role, rounds, tips) → submitted to the placement officer for approval.
- **Browse approved experiences** shared by other students (filter by company / role).
- Manage your own submissions (delete while pending).

### 🏛️ Placement Officer Module
- Dedicated secure login (officer credentials only).
- **Dashboard analytics**: total students, tests attempted, average score, pending reviews.
- **Top performers** leaderboard (average aptitude score).
- **Student progress table** with per-student drill-down (tests, scores, experiences).
- **Experience moderation**: approve / reject / hold student submissions.
- **Question bank management**: add or delete aptitude questions.

### 🔐 Security & Best Practices
- Passwords hashed with **bcryptjs** (never stored in plain text).
- Stateless auth with **JSON Web Tokens (JWT)**.
- Role-based access control (`student` / `officer`) on every protected route.
- Correct answers are **never sent to the client** until the test is submitted.
- Server-side validation + central error handler, XSS-escaped output in the UI.

---

## 🧰 Tech Stack

| Layer      | Technology |
|------------|------------|
| Backend    | Node.js, Express.js, Mongoose (ODM) |
| Database   | MongoDB (local or MongoDB Atlas) |
| Auth       | JSON Web Tokens (jsonwebtoken), bcryptjs |
| Frontend   | HTML5, CSS3, vanilla JavaScript (Fetch API) |
| Other      | dotenv, cors, nodemon (dev) |

---

## 📁 Project Structure

```
placement-prep-portal/
│
├── backend/
│   ├── config/
│   │   └── db.js                     # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js         # register, login, getMe
│   │   ├── studentController.js      # profile, dashboard summary
│   │   ├── aptitudeController.js     # categories, questions, submit, results
│   │   ├── experienceController.js   # create, browse, mine, delete
│   │   └── officerController.js      # dashboard, students, moderation, questions
│   ├── middleware/
│   │   ├── authMiddleware.js         # JWT protect + role authorize
│   │   └── errorMiddleware.js        # 404 + central error handler
│   ├── models/
│   │   ├── User.js                   # student & officer accounts
│   │   ├── Question.js               # aptitude questions
│   │   ├── Result.js                 # test attempts / scores
│   │   └── Experience.js             # interview experiences
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── studentRoutes.js
│   │   ├── aptitudeRoutes.js
│   │   ├── experienceRoutes.js
│   │   └── officerRoutes.js
│   ├── seed/
│   │   └── seed.js                   # demo data + questions + accounts
│   ├── utils/
│   │   └── generateToken.js          # JWT signing helper
│   ├── .env.example                  # copy to .env (already provided)
│   ├── package.json
│   └── server.js                     # entry point (serves API + frontend)
│
├── frontend/
│   ├── css/
│   │   └── styles.css                # global stylesheet
│   ├── js/
│   │   ├── config.js                 # API base URL detection
│   │   ├── api.js                    # fetch wrapper
│   │   ├── auth.js                   # session + route guards
│   │   ├── ui.js                     # navbar, toasts, formatting, validation helpers
│   │   ├── student-login.js
│   │   ├── student-register.js
│   │   ├── student-dashboard.js
│   │   ├── aptitude.js
│   │   ├── test.js
│   │   ├── experiences.js
│   │   ├── officer-login.js
│   │   └── officer-dashboard.js
│   ├── index.html                    # home (choose module)
│   ├── student-login.html
│   ├── student-register.html
│   ├── student-dashboard.html
│   ├── aptitude.html                 # category select + history
│   ├── test.html                     # timed test taking
│   ├── experiences.html              # browse + share + my submissions
│   ├── officer-login.html
│   └── officer-dashboard.html
│
├── package.json                      # root convenience scripts
└── README.md
```

---

## 🚀 How to Run

### Prerequisites
1. **Node.js** (v18 or later) — <https://nodejs.org>
2. **MongoDB Community Server** (or MongoDB Atlas) — <https://www.mongodb.com/try/download/community>
3. A terminal (PowerShell, CMD or bash).

### Step 1 — Install MongoDB & start it
- **Windows (installed as a service):**
  ```powershell
  Start-Service MongoDB        # or: net start MongoDB
  ```
- **macOS (Homebrew):**
  ```bash
  brew services start mongodb-community
  ```
- **Linux / manual:** start `mongod` with a data directory, e.g.
  ```bash
  mongod --dbpath ./data/db
  ```

> Everything below assumes MongoDB is running on `mongodb://127.0.0.1:27017`.

### Step 2 — Configure the backend
Open a terminal **inside the `backend` folder**:

```bash
cd backend
npm install          # installs express, mongoose, jsonwebtoken, bcryptjs, cors, dotenv
```

A ready-to-use `.env` file is already included. If you need to change anything:

```bash
cp .env.example .env    # (PowerShell: Copy-Item .env.example .env)
```

Key values:
```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/placement_prep_portal
JWT_SECRET=change_me
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:5500,http://127.0.0.1:5500
```

### Step 3 — Seed the database with demo data (optional but recommended)
```bash
npm run seed
```
This creates **2 students, 1 officer, 32 aptitude questions, demo results and experiences**.

### Step 4 — Start the server
```bash
npm start            # production  → node server.js
npm run dev          # development → nodemon (auto-restart)
```

You should see:
```
[db] MongoDB connected: 127.0.0.1/placement_prep_portal
[server] Placement Prep Portal running on http://localhost:5000
```

### Step 5 — Open the application
The backend **also serves the frontend**, so just open:

👉 **http://localhost:5000**

That's it — the homepage with the two modules (Student & Placement Officer) will load.

> 🔁 **Live Server option (frontend-only):** you can instead open the `frontend` folder with VS Code → Live Server on port 5500. `frontend/js/config.js` automatically detects which API to use by health-checking each candidate, so it works on a deployed host, on Live Server, and from a local file with no edits.

---

## ☁️ Deploy on Render (cloud hosting)

The repository contains a `render.yaml` blueprint, so the whole app deploys in one click.

### Step 1 — Create a free MongoDB Atlas database
1. Sign up at <https://www.mongodb.com/atlas> → create a **free M0** cluster.
2. **Database Access** → create a user (e.g. `portal` / a strong password).
3. **Network Access** → allow access from anywhere (`0.0.0.0/0`) — required on Render's free tier.
4. **Deployments → Add new deployment → Atlas** → copy the connection string. It looks like:
   ```
   mongodb+srv://portal:<password>@cluster0.xxxxx.mongodb.net/placement_prep_portal
   ```

### Step 2 — Deploy on Render
1. Push this project to a GitHub repository.
2. In Render → **New → Blueprint** → select the repo. Render reads `render.yaml` automatically.
3. When asked for the `MONGO_URI` value, paste the Atlas connection string.
4. Click **Apply** → wait for the build. Health check path `/api/health` turns green when ready.

**Manual setup (instead of the blueprint):**

| Setting | Value |
|---|---|
| Root Directory | *(leave empty — repo root)* |
| Build Command | `npm --prefix backend install` |
| Start Command | `npm --prefix backend start` |
| Health Check Path | `/api/health` |
| Environment | `MONGO_URI=<atlas string>`, `JWT_SECRET=<random>`, `JWT_EXPIRES_IN=7d`, `OFFICER_USERNAME=officer1`, `OFFICER_PASSWORD=officer123` |

### Step 3 — Nothing else to do ✅
On the **first boot** the server automatically creates what a fresh database is missing, so the app is never empty or unusable:

```
[autoseed] Created officer account -> username: officer1 | password: officer123
[autoseed] Seeded 32 aptitude questions
[autoseed] Created demo student -> username: student1 | password: student123
[autoseed] Created demo student -> username: student2 | password: student123
```

This is why a new deployment never shows **"Not available"** on the test categories — the question bank is always populated. The seed is idempotent: it never overwrites existing data.

To run it manually instead (e.g. from the Render **Shell** tab): `cd backend && npm run seed`.

---

## 🔑 Demo Accounts

| Role              | Username    | Password     |
|-------------------|-------------|--------------|
| Student           | `student1`  | `student123` |
| Student (2nd)     | `student2`  | `student123` |
| Placement Officer | `officer1`  | `officer123` |

> The officer credentials are configurable with the `OFFICER_USERNAME` / `OFFICER_PASSWORD` environment variables (see `render.yaml`). The officer account is created automatically on first boot if it does not exist. New students can also **register** from the student login page.

---

## 🔄 Application Workflow

1. **Home page** → choose a module.
2. **Student module** → Login form (username + password) → validated → dashboard.
   - Take a timed **aptitude test** → instant score + full review.
   - **Share an interview experience** → goes to the officer as `pending`.
   - Browse approved experiences from other students.
3. **Officer module** → Login form → dashboard.
   - View **student progress**, top performers, and analytics.
   - **Approve/reject** pending experiences.
   - **Add/delete** aptitude questions.

---

## 📡 REST API Reference

| Method | Endpoint                         | Auth         | Description |
|--------|----------------------------------|--------------|-------------|
| POST   | `/api/auth/register`             | Public       | Register a student |
| POST   | `/api/auth/login`                | Public       | Login (username + password + role) |
| GET    | `/api/auth/me`                   | Any user     | Current user |
| GET    | `/api/aptitude/categories`       | Any user     | Categories + question counts |
| GET    | `/api/aptitude/questions?category=&limit=&difficulty=` | Student | Random questions (no answers sent) |
| POST   | `/api/aptitude/submit`           | Student      | Submit answers → graded result + review |
| GET    | `/api/aptitude/results`          | Student      | Test history |
| GET    | `/api/aptitude/results/:id`      | Student      | Single result with review |
| GET    | `/api/students/profile`          | Student      | Own profile |
| PUT    | `/api/students/profile`          | Student      | Update profile |
| GET    | `/api/students/dashboard`        | Student      | Summary, recent results, performances |
| GET    | `/api/experiences`               | Any user     | Approved experiences (filter by company/role) |
| POST   | `/api/experiences`               | Student      | Submit experience (status pending) |
| GET    | `/api/experiences/mine`          | Student      | Own submissions |
| GET    | `/api/experiences/:id`           | Any user     | Single experience |
| DELETE | `/api/experiences/:id`           | Student      | Delete own pending experience |
| GET    | `/api/officer/dashboard`         | Officer      | Batch analytics + top performers |
| GET    | `/api/officer/students`          | Officer      | All students + progress |
| GET    | `/api/officer/students/:id`      | Officer      | Single student detail |
| GET    | `/api/officer/experiences?status=` | Officer     | Experiences for moderation |
| PUT    | `/api/officer/experiences/:id/status` | Officer  | Approve / reject |
| GET    | `/api/officer/questions`         | Officer      | List questions |
| POST   | `/api/officer/questions`         | Officer      | Add question |
| DELETE | `/api/officer/questions/:id`     | Officer      | Delete question |

---

## 🧪 Verification

After seeding you can quickly verify the API:

```powershell
curl http://localhost:5000/api/health

# Login as a student
curl -X POST http://localhost:5000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"username":"student1","password":"student123","role":"student"}'
```

---

## 🛠️ Troubleshooting

- **`MongooseServerSelectionError` / connection refused** → MongoDB is not running. Start the service (`Start-Service MongoDB`) or check `MONGO_URI` in `.env`.
- **Local `mongod` will not start (`0xC0000139` on Windows 10)** → your installed MongoDB build is blocked/corrupt. Use the included portable **MongoDB 7.0**:
  1. Run `start-mongodb.bat` (starts a portable `mongod` on port 27017, no admin needed).
  2. First start is slow (several minutes) because antivirus scans the binary. To make it fast, add an **exclusion for `C:\Users\LENOVO\AppData\Local\Temp\opencode\mongodb7`** in Windows Security → Virus & threat protection → Exclusions.
  3. Verify with `Test-NetConnection 127.0.0.1 -Port 27017`. Alternatively use a free **MongoDB Atlas** cluster and paste its `mongodb+srv://...` string into `MONGO_URI` in `backend/.env`.
- **Port 5000 in use** → change `PORT` in `.env` and restart the server.
- **"Cannot reach the server"** in the browser → the frontend probes every candidate API URL and picks the first that answers `/health`, so this normally self-corrects. If it persists, open the browser console and check the `[config] API candidates ->` line, then set it manually with `localStorage.setItem("apiBase", "https://your-app.onrender.com/api")` and reload.
- **Every test category shows "Not available"** → the question bank is empty in your database. The server now seeds it automatically on boot (`[autoseed] Seeded 32 aptitude questions`). If you are on an old deployment, redeploy, or run `npm run seed` once in the Render **Shell** tab.
- **Cannot log in as Placement Officer** → the officer account is created on first boot with the `OFFICER_USERNAME` / `OFFICER_PASSWORD` env values (default `officer1` / `officer123`). Check the Render logs for the `[autoseed]` lines to confirm.
- **Duplicate username / email on signup** → the controller returns a clear message; choose another value.

---

## 📜 License

MIT — free to use for academic and placement-cell projects.

---

Built with ❤️ for postgraduate placement preparation.