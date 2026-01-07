
Action: file_editor create /app/DEPLOYMENT_GUIDE.md --file-text "# Redwood IM Platform - Deployment Guide

## 🚀 Deploying to Render.com

This guide will help you deploy the complete Redwood IM Platform (React Frontend + FastAPI Backend + MongoDB) to Render.com.

---

## 📋 Prerequisites

Before deploying, you need:

1. ✅ **GitHub Account** - Your code pushed to a GitHub repository
2. ✅ **Render Account** - Sign up at [render.com](https://render.com) (free)
3. ✅ **MongoDB Atlas Account** - Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) (free tier available)
4. ✅ **Firebase Project** - Your existing Firebase project `im-b169f`
5. ✅ **Resend API Key** - Your existing key: `re_bGa2JRFn_NLNyrrZayKkDc83REYYg37s2`

---

## 🗄️ Step 1: Set Up MongoDB Atlas (Cloud Database)

Since Render doesn't include MongoDB, you'll use MongoDB Atlas free tier:

### 1.1 Create MongoDB Atlas Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up / Log in
3. Click **\"Build a Database\"**
4. Select **\"M0 FREE\"** tier
5. Choose a cloud provider and region (closest to your users)
6. Click **\"Create Cluster\"** (takes 3-5 minutes)

### 1.2 Configure Database Access

1. In Atlas, click **\"Database Access\"** (left sidebar)
2. Click **\"Add New Database User\"**
3. Create a user:
   - Username: `redwood_admin`
   - Password: Generate a secure password (save it!)
   - Database User Privileges: Select **\"Read and write to any database\"**
4. Click **\"Add User\"**

### 1.3 Configure Network Access

1. Click **\"Network Access\"** (left sidebar)
2. Click **\"Add IP Address\"**
3. Click **\"Allow Access from Anywhere\"** (0.0.0.0/0)
   - This is safe for our use case
4. Click **\"Confirm\"**

### 1.4 Get Your Connection String

1. Go to **\"Database\"** (left sidebar)
2. Click **\"Connect\"** on your cluster
3. Choose **\"Connect your application\"**
4. Copy the connection string, it looks like:
   ```
   mongodb+srv://redwood_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. **Replace `<password>`** with the actual password you created
6. **Add the database name** before the `?`:
   ```
   mongodb+srv://redwood_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/redwood_im_production?retryWrites=true&w=majority
   ```

**Save this connection string - you'll need it!**

---

## 🌐 Step 2: Deploy to Render.com

### 2.1 Push Your Code to GitHub

```bash
# If not already done, initialize git and push to GitHub
cd /app
git init
git add .
git commit -m \"Prepare for deployment\"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### 2.2 Connect GitHub to Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **\"New +\"** → **\"Blueprint\"**
3. Connect your GitHub account
4. Select your repository
5. Render will detect the `render.yaml` file

### 2.3 Configure Environment Variables

Render will ask for the following environment variables:

#### For Backend Service (`redwood-im-backend`):

| Variable Name | Value |
|--------------|-------|
| `MONGO_URL` | Your MongoDB Atlas connection string from Step 1.4 |
| `RESEND_API_KEY` | `re_bGa2JRFn_NLNyrrZayKkDc83REYYg37s2` |
| `DB_NAME` | `redwood_im_production` |
| `CORS_ORIGINS` | `*` |
| `FIREBASE_PROJECT_ID` | `im-b169f` |

#### For Frontend Service (`redwood-im-frontend`):

These are already set in `render.yaml`, but verify:

| Variable Name | Value |
|--------------|-------|
| `REACT_APP_BACKEND_URL` | Will be auto-filled by Render |
| `REACT_APP_FIREBASE_API_KEY` | `AIzaSyAUIbaz0U4nYl5b6mRrB3Iitd3MhfunEfA` |
| `REACT_APP_FIREBASE_AUTH_DOMAIN` | `im-b169f.firebaseapp.com` |
| `REACT_APP_FIREBASE_PROJECT_ID` | `im-b169f` |
| `REACT_APP_FIREBASE_STORAGE_BUCKET` | `im-b169f.firebasestorage.app` |
| `REACT_APP_USE_MOCK_AUTH` | `false` |

### 2.4 Deploy

1. Click **\"Apply\"** to create services
2. Render will:
   - Build and deploy your backend (takes 5-10 minutes)
   - Build and deploy your frontend (takes 3-5 minutes)
3. Wait for both services to show **\"Live\"** status

---

## 🔥 Step 3: Configure Firebase for Production

### 3.1 Add Authorized Domains

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `im-b169f`
3. Go to **Authentication** → **Settings** → **Authorized domains**
4. Add your Render frontend URL:
   - Example: `redwood-im-frontend.onrender.com`

### 3.2 Enable Email/Password Authentication

If not already enabled:

1. Go to **Authentication** → **Sign-in method**
2. Enable **Email/Password**
3. Save

---

## ✅ Step 4: Verify Deployment

### 4.1 Backend Health Check

Visit: `https://redwood-im-backend.onrender.com/api/health`

You should see:
```json
{
  \"status\": \"healthy\",
  \"service\": \"Redwood IM Platform\"
}
```

### 4.2 Frontend

Visit: `https://redwood-im-frontend.onrender.com`

You should see your application!

### 4.3 Test Full Flow

1. Register a new account
2. Log in
3. Create a document
4. Add content to sections
5. Export as PDF/DOCX

---

## 📊 Monitoring & Logs

### View Logs

1. Go to Render Dashboard
2. Click on a service
3. Go to **\"Logs\"** tab
4. View real-time logs

### Common Issues

#### Backend shows \"Application failed to respond\"
- Check MongoDB connection string is correct
- Ensure MongoDB Atlas IP allowlist includes `0.0.0.0/0`
- Check backend logs for errors

#### Frontend shows \"Network Error\"
- Verify `REACT_APP_BACKEND_URL` points to backend service
- Check CORS is enabled in backend
- Ensure backend is \"Live\"

#### Authentication Not Working
- Verify Firebase authorized domains includes your Render URL
- Check Firebase API keys are correct
- Ensure Email/Password auth is enabled in Firebase

---

## 💰 Cost Breakdown

- **Render Free Tier**:
  - Backend: Free (sleeps after 15 min of inactivity)
  - Frontend: Free (static site)
- **MongoDB Atlas**: Free M0 tier (512MB storage)
- **Firebase**: Free Spark plan
- **Resend**: Free tier (100 emails/day)

**Total Cost: $0/month** 🎉

---

## 🚀 Upgrade Options (Optional)

If your app grows:

1. **Render Paid Plans** ($7+/month)
   - Always-on (no sleep)
   - More resources
   - Custom domains

2. **MongoDB Atlas Paid** ($0.08+/hour)
   - More storage
   - Better performance

---

## 🔒 Security Recommendations

Before going to production:

1. ✅ Set specific CORS origins instead of `*`
2. ✅ Use environment-specific Firebase projects
3. ✅ Rotate API keys regularly
4. ✅ Set up MongoDB backup
5. ✅ Enable Firebase security rules
6. ✅ Add rate limiting to backend
7. ✅ Set up SSL (automatic on Render)

---

## 📝 Need Help?

Common deployment issues and solutions:

### Issue: \"MongoDB connection timeout\"
**Solution**: Check your MongoDB Atlas connection string and IP allowlist

### Issue: \"CORS error in browser console\"
**Solution**: Verify backend CORS_ORIGINS includes your frontend URL

### Issue: \"Firebase auth not working\"
**Solution**: Add Render URL to Firebase authorized domains

### Issue: \"Environment variables not set\"
**Solution**: Go to service settings → Environment → Add variables

---

## 🎯 Next Steps

After successful deployment:

1. ✅ Test all features thoroughly
2. ✅ Set up custom domain (optional)
3. ✅ Configure email notifications
4. ✅ Set up monitoring/alerts
5. ✅ Create backup strategy

---

## 📞 Support

If you encounter any issues during deployment, Render has excellent docs:
- [Render Docs](https://render.com/docs)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
- [Firebase Docs](https://firebase.google.com/docs)

---

**Congratulations! Your Redwood IM Platform is now live! 🎉**
"
Observation: Create successful: /app/DEPLOYMENT_GUIDE.md