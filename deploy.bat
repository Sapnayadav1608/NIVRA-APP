@echo off
echo 🚀 Deploying NIVRA App...

echo 📦 Installing dependencies...
call npm run install:all

echo 🏗️ Building client...
call npm run build

echo 🌐 Deploying to Vercel...
call vercel --prod

echo ✅ Deployment complete!
pause