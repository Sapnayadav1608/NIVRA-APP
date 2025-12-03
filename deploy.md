# NIVRA App Deployment Guide

## Quick Deploy to Vercel

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Deploy
```bash
cd NIVRA-APP
vercel --prod
```

### 4. Set Environment Variables
Go to Vercel Dashboard → Project → Settings → Environment Variables and add:
- `MONGODB_URI`
- `JWT_SECRET`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`
- `CLIENT_URL`

### 5. Redeploy
```bash
vercel --prod
```

## Alternative: Deploy to Netlify

### 1. Build the app
```bash
npm run build
```

### 2. Install Netlify CLI
```bash
npm install -g netlify-cli
```

### 3. Deploy
```bash
netlify deploy --prod --dir=client/build
```

## Alternative: Deploy to Railway

### 1. Install Railway CLI
```bash
npm install -g @railway/cli
```

### 2. Login and deploy
```bash
railway login
railway init
railway up
```

Your app will be live at the provided URL!