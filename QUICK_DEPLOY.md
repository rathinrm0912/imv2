
Action: file_editor create /app/QUICK_DEPLOY.md --file-text "# Quick Deployment Checklist

## ✅ Pre-Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] MongoDB Atlas account created
- [ ] Render.com account created
- [ ] Firebase project configured
- [ ] API keys secured

---

## 🗄️ MongoDB Atlas Setup (5 minutes)

1. **Create Cluster**
   - Go to mongodb.com/cloud/atlas
   - Create M0 FREE cluster
   - Choose region closest to your users

2. **Create Database User**
   - Username: `redwood_admin`
   - Password: [Generate secure password]
   - Save password securely!

3. **Network Access**
   - Add IP: `0.0.0.0/0` (Allow from anywhere)

4. **Get Connection String**
   ```
   mongodb+srv://redwood_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/redwood_im_production?retryWrites=true&w=majority
   ```
   - Replace YOUR_PASSWORD with actual password
   - Save this string!

---

## 🚀 Render.com Deployment (10 minutes)

1. **Connect GitHub**
   - Go to render.com/dashboard
   - Click \"New +\" → \"Blueprint\"
   - Connect your repository
   - Render detects render.yaml automatically

2. **Set Environment Variables**

   **Backend (`redwood-im-backend`):**
   ```
   MONGO_URL = [Your MongoDB connection string from above]
   RESEND_API_KEY = re_bGa2JRFn_NLNyrrZayKkDc83REYYg37s2
   DB_NAME = redwood_im_production
   CORS_ORIGINS = *
   FIREBASE_PROJECT_ID = im-b169f
   ```

   **Frontend (auto-configured):**
   - REACT_APP_BACKEND_URL will be set automatically
   - Other Firebase vars already in render.yaml

3. **Click \"Apply\"**
   - Wait 5-10 minutes for deployment
   - Both services should show \"Live\" status

---

## 🔥 Firebase Configuration (2 minutes)

1. **Add Authorized Domain**
   - Go to Firebase Console → Authentication → Settings
   - Add: `redwood-im-frontend.onrender.com` (your actual URL)

2. **Verify Auth Enabled**
   - Ensure Email/Password authentication is enabled

---

## ✅ Verify Deployment

1. **Backend Health Check**
   ```
   https://redwood-im-backend.onrender.com/api/health
   ```
   Should return: `{\"status\": \"healthy\", ...}`

2. **Frontend**
   ```
   https://redwood-im-frontend.onrender.com
   ```
   Should load your app!

3. **Test Features**
   - [ ] Register new user
   - [ ] Login
   - [ ] Create document
   - [ ] Edit sections
   - [ ] Export PDF/DOCX

---

## 🐛 Troubleshooting

**Backend won't start?**
- Check MongoDB connection string
- Verify IP allowlist in Atlas: `0.0.0.0/0`
- View logs in Render dashboard

**Frontend can't connect to backend?**
- Check REACT_APP_BACKEND_URL in frontend env vars
- Ensure backend is \"Live\"
- Check browser console for CORS errors

**Firebase auth not working?**
- Add Render URL to Firebase authorized domains
- Verify API keys are correct

---

## 📦 Your Deployment URLs

After deployment, save these:

```
Frontend: https://redwood-im-frontend.onrender.com
Backend: https://redwood-im-backend.onrender.com
MongoDB: [Your Atlas connection string]
```

---

## 💰 Cost: $0/month

- Render Free Tier (backend + frontend)
- MongoDB Atlas M0 Free Tier
- Firebase Spark Plan (free)
- Resend Free Tier

**Note**: Free tier backend sleeps after 15 min inactivity (wakes in ~30 seconds)

---

## 🎯 Done!

Your full-stack app is now live on the internet! 🎉

Share your frontend URL with anyone to access the application.

---

## Need to Update?

To deploy updates:
1. Push changes to GitHub
2. Render auto-deploys (if enabled)
3. Or manually trigger deploy in Render dashboard
"
Observation: Create successful: /app/QUICK_DEPLOY.md