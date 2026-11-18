# ✨ myTutor - Divine University Student Portal ✨

myTutor is a modern, full-featured academic hub for students and lecturers at Divine University — built with a responsive dark/light user interface, smooth micro-animations, data visualizations, and browser-to-browser live video classes.

It is designed to run **entirely on static hosting (Vercel)** with **zero backend hosting required**: structured data lives in `localStorage`, uploaded files and recorded lectures are stored in the browser's `IndexedDB`, and live classes (chat + WebRTC signaling) use a serverless WebSocket/BroadcastChannel relay.

---

## 🚀 Key Features

*   **🎥 WebRTC Live Broadcasts & Chat**: Lecturers broadcast live webcam or screen-share classes directly from their browser; students join from another tab or device with real-time room chat.
*   **💾 In-Browser Video Recording**: Live sessions can be recorded with `MediaRecorder` and saved directly to `IndexedDB` so they remain playable under *Previous Session Recordings* across page reloads.
*   **📊 Dynamic Grade Tracker**: Visualize academic performance distributions, calculate GPA, track grade trends, and request remarks using Recharts.
*   **📝 Assignment & Online Activity Hub**: View assignments, download briefs, upload submissions, create/grade quizzes and webtests (with proctored full-screen exam mode).
*   **🎓 Course & Module Management**: Lecturers can create courses and modules, invite other lecturers by Lecturer ID, and review student course applications.
*   **📚 Resource Library & Announcements**: Organize folders, upload/download course materials, and post module announcements.
*   **🌓 Adaptive Dark / Light Mode**: Theme toggle with persistent user preference.

---

## 🛠️ Technology Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend Core** | React 19 + Vite | Fast SPA rendering and code-split routes |
| **Styling** | Tailwind CSS v4 | Design tokens and utility-first responsive layout |
| **Animations** | Framer Motion | Transitions and entry animations |
| **Visualizations** | Recharts | Interactive charts and mark distributions |
| **Icons** | Lucide React | Vector iconography |
| **Client Storage** | `localStorage` + `IndexedDB` | Zero-server persistence for portal data, uploaded files, and recorded videos |
| **Live Signaling & Chat** | WebRTC + MQTT over WSS + `BroadcastChannel` | Peer-to-peer video streaming and live room chat without a hosted backend |
| **Deployment** | Vercel | Static SPA deployment (no Render / Docker / DB required) |

---

## 🔑 Demo Accounts

| Role | Username | Password | Name | Lecturer ID |
| :--- | :--- | :--- | :--- | :--- |
| **Student** | `11101` | `STVine@123` | Jonathan Doe | — |
| **Student** | `11201` | `STAndie@123` | Sarah Connor | — |
| **Student** | `11301` | `STZya@123` | Marcus Wright | — |
| **Lecturer** | `TeachAndie` | `TAndie@123` | Dr. Andrea Vine | `dav-101` |
| **Lecturer** | `TeachVine` | `TVine@123` | Prof. Vincent Taylor | `pvt-102` |
| **Lecturer** | `TeachMya` | `TZya@123` | Dr. Mya Zya | `dmz-103` |

You can also register new student or lecturer accounts from the login screen, or use the quick role switcher in the top navbar.

---

## 💻 Local Development

Make sure you have **Node.js** (v18+) installed.

```bash
npm install
npm run dev
```

Open the URL printed in the terminal (default `http://localhost:5178`). No backend process or `.env` file is needed.

---

## 🌐 Deploying on Vercel (No Backend Required)

The project includes a pre-configured [`vercel.json`](vercel.json) and runs on Vercel out of the box:

1. Push this repository to GitHub / GitLab / Bitbucket.
2. In the [Vercel Dashboard](https://vercel.com), click **Add New → Project** and import the repository.
3. Verify the auto-detected settings:
   *   **Framework Preset**: `Vite`
   *   **Root Directory**: `./`
   *   **Build Command**: `npm run build`
   *   **Output Directory**: `dist`
4. Click **Deploy** — **no environment variables or backend services (Render, Railway, etc.) are required.**

### Optional Environment Variables

If you want to customize the serverless live-class relay in Vercel → *Project Settings → Environment Variables*:

| Variable | Default | Purpose |
| :--- | :--- | :--- |
| `VITE_MQTT_URL` | `wss://broker.emqx.io:8084/mqtt` | Public MQTT-over-WebSocket relay used for cross-device live class chat & WebRTC signaling. Set to `off` for same-browser-only (`BroadcastChannel`). |
| `VITE_REALTIME_NAMESPACE` | `mytutor-divine-university` | Isolates your deployment's live class rooms on the public relay. |

---

## 📄 License

Developed for student portals at Divine University. Feel free to clone, adapt, and improve!
