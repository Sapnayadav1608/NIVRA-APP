# 🚀 NIVRA Web App Deployment Guide (Vercel & Render)

This guide walks you through deploying the **NIVRA AI-Powered Women Safety Web App**:
- **Backend (Node.js/Express Server)**: Deployed on **Render**
- **Frontend (React PWA)**: Deployed on **Vercel**
- **Database**: **MongoDB Atlas**

---

## 1. MongoDB Atlas Setup (Free Cloud Database)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign up / log in.
2. Click **Create a Deployment** -> Choose **M0 Free Tier**.
3. Under **Database Access**, create a database user (e.g., `nivra_admin`) and set a strong password.
4. Under **Network Access**, click **Add IP Address** -> Select **Allow Access from Anywhere (`0.0.0.0/0`)** so Render can connect.
5. Click **Database** -> **Connect** -> **Drivers** -> Copy your connection string. It will look like:
   `mongodb+srv://nivra_admin:<PASSWORD>@cluster0.abcde.mongodb.net/nivra-app?retryWrites=true&w=majority`
   *(Replace `<PASSWORD>` with your database user password)*.

---

## 2. Backend Deployment on Render

1. Push your latest code to **GitHub**.
2. Go to [Render Dashboard](https://dashboard.render.com/) and click **New +** -> **Web Service**.
3. Connect your GitHub repository (`NIVRA-APP`).
4. Configure the Web Service settings:
   - **Name**: `nivra-backend` (or your preferred name)
   - **Region**: Choose closest to your target audience (e.g., Singapore / Frankfurt)
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free
5. Add **Environment Variables** under the **Environment** tab:
   - `MONGODB_URI`: `<Your MongoDB Atlas connection string from Step 1>`
   - `JWT_SECRET`: `<A random secret string, e.g. nivra_super_secret_jwt_key_2026>`
   - `NODE_ENV`: `production`
6. Click **Create Web Service**.
7. Once deployed, Render will provide your backend URL, for example:
   `https://nivra-backend.onrender.com`

---

## 3. Frontend Deployment on Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New...** -> **Project**.
2. Import your GitHub repository (`NIVRA-APP`).
3. Configure the Project:
   - **Framework Preset**: Create React App
   - **Root Directory**: Select `client` (Edit root directory -> choose `client`)
4. Expand **Environment Variables** and add:
   - `REACT_APP_API_URL`: `https://nivra-backend.onrender.com/api` *(replace with your actual Render URL)*
   - `REACT_APP_SERVER_URL`: `https://nivra-backend.onrender.com` *(replace with your actual Render URL)*
5. Click **Deploy**.
6. Vercel will build and deploy your app. You will get your live website URL (e.g., `https://nivra-app.vercel.app`).

---

## 4. Final Verification Checklist

- [ ] Visit backend health check: `https://<your-backend>.onrender.com/` (Should return `{"status":"online", ...}`)
- [ ] Open your Vercel frontend URL: `https://<your-app>.vercel.app`
- [ ] Test **User Registration** and **User Login**
- [ ] Test **Admin Login** (`/admin`)
- [ ] Test **Emergency SOS Alert** and **Community Reports**

---

## 💡 Troubleshooting & Notes

- **Render Free Tier Cold Start**: On Render's free tier, backend services spin down after 15 minutes of inactivity. The first request after a period of inactivity may take 30-40 seconds to spin up.
- **PWA Features**: Geolocation & Notifications require HTTPS, which Vercel and Render automatically provide!
