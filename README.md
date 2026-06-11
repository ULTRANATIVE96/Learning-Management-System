# ✨ myTutor - Divine University Student Portal ✨

myTutor is a state-of-the-art, premium, and fully-featured academic hub designed for students and lecturers at Divine University. Built with a modern, high-fidelity dark/light user interface, smooth micro-animations, and dynamic data visualization, myTutor bridges the gap between student portals and live learning platforms.

---

## 🚀 Key Features

*   **🎥 WebRTC Live Broadcasts & Chat**: Lecturers can broadcast live video classes with webcams and screen sharing directly from their browser, while students join dynamically. Integrated room-based WebSocket chat facilitates real-time Q&A.
*   **💾 Video Recording & Cloud Uploads**: Live sessions can be recorded in-browser and uploaded directly to the backend to make them immediately available for students under past recordings.
*   **📊 Dynamic Grade Tracker**: Visualize academic performance distributions, calculate GPA, track grade trends, and request remarks using modern charts powered by Recharts.
*   **📝 Assignment Submission Hub**: View upcoming assignments, download briefs, upload submissions, and track statuses (Pending, Late, Graded, Submitted).
*   **📚 Module Catalogs & Resources**: Lecturers can organize folders, upload course materials, and post dynamic announcements for student view.
*   **👥 Class Directory**: Access university classmate directories and initiate immediate communication channels.
*   **🌓 Adaptive Dark Mode**: A sleek, fully dark-themed workspace tailored to improve focus and reduce eye strain.

---

## 🛠️ Technology Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend Core** | React 19 + Vite | Ultra-fast SPA rendering and Hot Module Replacement (HMR) |
| **Styling** | Tailwind CSS v4 + PostCSS | Modern design tokens and utility-first responsive layout |
| **Animations** | Framer Motion | Fluid transitions, hover scaling, and entry animations |
| **Visualizations** | Recharts | Interactive SVG charts and marks distribution visualization |
| **Icons** | Lucide React | High-quality, clean vector iconography |
| **Backend Core** | Java 17 + Spring Boot 3.2 | Enterprise-grade REST APIs and services |
| **Real-time** | Spring WebSockets | Low-latency chat messaging and WebRTC signaling control |
| **Data Layer** | Spring Data JPA | Object-relational mapping and database abstraction |
| **Databases** | H2 (Local) / PostgreSQL (Prod) | Seamless transition from local file DB to production databases |
| **Deployment** | Docker, Vercel, Render | Streamlined containerized builds and serverless frontend host |

---

## 💻 Local Development Setup

To run myTutor locally, follow these steps:

### 1. Backend Service
Make sure you have **Java 17** and **Maven** installed.

1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Copy `.env.example` to `.env` (or configure your local environment variables):
   ```bash
   cp .env.example .env
   ```
3. Run the Spring Boot application:
   ```bash
   mvn spring-boot:run
   ```
   The backend will run on `http://localhost:8080`. The local H2 database console is accessible at `http://localhost:8080/h2-console` (default Username: `sa`, Password: ``).

### 2. Frontend client
Make sure you have **Node.js** installed.

1. Navigate to the root directory and install dependencies:
   ```bash
   npm install
   ```
2. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```
   *By default, the `.env` points to `http://localhost:8080/api` for API requests and `localhost:8080` for WebSockets.*
3. Run the development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your web browser.

---

## 🌐 Production Deployment Guide

Follow these steps to deploy myTutor in production.

### Part 1: GitHub Repository Setup
1. Create a **new private or public repository** on GitHub.
2. Initialize your git repository locally and commit your files:
   ```bash
   git init
   ```
   *(Note: The updated [.gitignore](.gitignore) automatically protects your local configuration files `.env` and backend compiled files/database folders from being committed).*
3. Add the remote repository and push your branch:
   ```bash
   git remote add origin <your-github-repo-url>
   git branch -M main
   git push -u origin main
   ```

### Part 2: Backend Deployment on Render (using Docker)
Render makes it easy to build and run the Java backend using the root-level `backend/Dockerfile`.

1. Sign in to your [Render Console](https://dashboard.render.com).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository containing the myTutor code.
4. Configure the Web Service settings:
   *   **Name**: `mytutor-backend`
   *   **Region**: Select a region close to your users
   *   **Branch**: `main`
   *   **Runtime**: `Docker`
   *   **Docker Build Context**: `backend` *(CRITICAL: Set this to `backend` so Render builds from inside the backend directory)*
   *   **Dockerfile Path**: `Dockerfile`
5. Click **Advanced** and add the following **Environment Variables**:
   *   `PORT`: `8080`
   *   *(Optional but Recommended)* Connect a **Render PostgreSQL database** and configure:
       *   `SPRING_DATASOURCE_URL`: `jdbc:postgresql://<your-db-host>:<port>/<db-name>`
       *   `SPRING_DATASOURCE_USERNAME`: `<your-db-username>`
       *   `SPRING_DATASOURCE_PASSWORD`: `<your-db-password>`
       *   `SPRING_DATASOURCE_DRIVER`: `org.postgresql.Driver`
6. Click **Deploy Web Service**. Render will build the Docker container and start your Spring Boot API. Take note of the service URL generated by Render (e.g., `https://mytutor-backend.onrender.com`).

> [!WARNING]
> **Data Persistence Warning:** If you deploy using the default H2 database config on Render without linking a persistent disk, database records and uploaded files in `backend/uploads` will be wiped whenever the Render container spins down or re-deploys. Setting up a Render PostgreSQL database is highly recommended for persistent data storage.

### Part 3: Frontend Deployment on Vercel
Vercel is the recommended host for static React + Vite web applications.

1. Sign in to your [Vercel Dashboard](https://vercel.com).
2. Click **Add New** and select **Project**.
3. Import your GitHub repository.
4. Configure the Project settings:
   *   **Framework Preset**: Select **Vite** (Vercel should auto-detect this).
   *   **Root Directory**: Keep as project root `./` (not backend).
   *   **Build Command**: `npm run build`
   *   **Output Directory**: `dist`
5. Under **Environment Variables**, expand it and add:
   *   `VITE_API_URL`: `https://<your-render-app-url>.onrender.com/api` (Replace with your actual Render backend URL)
   *   `VITE_API_WS_URL`: `<your-render-app-url>.onrender.com` (Do **not** include `https://` or trailing slashes, e.g. `mytutor-backend.onrender.com`)
6. Click **Deploy**. Vercel will bundle the React application and deploy it globally. You can now access your fully-functional portal!

---

## 📄 License
This project is developed for student portals at Divine University. Feel free to clone, adapt, and improve the portal!
