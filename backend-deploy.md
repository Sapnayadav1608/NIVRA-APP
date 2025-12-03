# 🚀 Backend Deployment - Render.com

## Steps:

### 1. Go to [Render.com](https://render.com)
- Sign up with GitHub

### 2. Create New Web Service
- Connect GitHub repo
- Select `NIVRA-APP`

### 3. Configure:
- **Name**: `nivra-backend`
- **Root Directory**: `server`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### 4. Add Environment Variables:
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nivra
JWT_SECRET=your-secret-key-here
PORT=10000
```

### 5. Deploy!
- Click "Create Web Service"
- Wait 5-10 minutes

### 6. Update Frontend:
Replace API URLs in client with your Render URL:
`https://your-app-name.onrender.com`

## Free MongoDB:
1. Go to [MongoDB Atlas](https://mongodb.com/atlas)
2. Create free cluster
3. Get connection string
4. Add to Render environment variables

**Your backend will be live! 🎉**