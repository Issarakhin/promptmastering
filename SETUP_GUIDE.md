# PromptMaster AI - Complete Setup Guide

This guide will walk you through setting up the PromptMaster AI learning platform from scratch.

## ⏱️ Estimated Time: 15-20 minutes

---

## Step 1: Install Prerequisites (5 minutes)

### Install Node.js
1. Download from [nodejs.org](https://nodejs.org/) (version 18 or higher)
2. Run installer and follow prompts
3. Verify installation:
```bash
node --version  # Should show v18.x.x or higher
```

### Install pnpm
```bash
npm install -g pnpm
```

Verify:
```bash
pnpm --version
```

### Install Firebase CLI
```bash
npm install -g firebase-tools
```

Verify:
```bash
firebase --version
```

---

## Step 2: Extract and Install Project (2 minutes)

1. Extract the ZIP file to your desired location
2. Open terminal/command prompt
3. Navigate to project folder:
```bash
cd path/to/promptmaster-firebase
```

4. Install dependencies:
```bash
pnpm install
```

This will install all required packages (~2 minutes).

---

## Step 3: Create Firebase Project (3 minutes)

### 3.1 Create Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Enter project name: `promptmaster-ai` (or your choice)
4. Click **Continue**
5. **Disable** Google Analytics (optional, can enable later)
6. Click **Create project**
7. Wait for project creation (~30 seconds)
8. Click **Continue**

### 3.2 Enable Authentication
1. In left sidebar, click **Authentication**
2. Click **Get started**
3. Click **Email/Password** provider
4. Toggle **Enable** switch ON
5. Click **Save**

### 3.3 Create Firestore Database
1. In left sidebar, click **Firestore Database**
2. Click **Create database**
3. Select **Production mode**
4. Click **Next**
5. Choose your location (closest to your users)
6. Click **Enable**
7. Wait for database creation (~1 minute)

### 3.4 Update Security Rules
1. Click **Rules** tab
2. Replace all content with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read: if true;
    }
    
    match /users/{userId} {
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /userProgress/{progressId} {
      allow write: if request.auth != null;
    }
    
    match /assessmentResults/{resultId} {
      allow write: if request.auth != null;
    }
  }
}
```

3. Click **Publish**

---

## Step 4: Configure Firebase Credentials (3 minutes)

### 4.1 Get Web App Configuration
1. Click **Project Settings** (gear icon in left sidebar)
2. Scroll down to **"Your apps"** section
3. Click the **Web icon** (`</>`)
4. Enter app nickname: `PromptMaster Web`
5. **Don't** check "Firebase Hosting"
6. Click **Register app**
7. **Copy** the `firebaseConfig` object (looks like this):

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "promptmaster-ai.firebaseapp.com",
  projectId: "promptmaster-ai",
  storageBucket: "promptmaster-ai.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

8. Click **Continue to console**

### 4.2 Update Project Configuration
1. Open `src/firebase/config.ts` in your code editor
2. Find the `firebaseConfig` object (around line 4)
3. **Replace** the placeholder values with your copied config
4. **Save** the file

**Before:**
```typescript
const firebaseConfig = {
  apiKey: "your-api-key-here",
  authDomain: "your-project.firebaseapp.com",
  // ...
};
```

**After:**
```typescript
const firebaseConfig = {
  apiKey: "AIza...",  // Your actual values
  authDomain: "promptmaster-ai.firebaseapp.com",
  // ...
};
```

---

## Step 5: Get Service Account Key (2 minutes)

### 5.1 Generate Key
1. Still in **Project Settings**
2. Click **Service accounts** tab
3. Click **Generate new private key**
4. Click **Generate key** in popup
5. A JSON file will download

### 5.2 Save Key File
1. Rename downloaded file to: `serviceAccountKey.json`
2. Move it to your project root folder (same level as `package.json`)

**Important:** This file contains sensitive credentials. Never commit it to Git or share it publicly!

---

## Step 6: Seed the Database (2 minutes)

Run the seeding script to populate your database with sample data:

```bash
pnpm seed:admin
```

You should see output like:
```
✅ Courses seeded successfully
✅ Modules seeded successfully
✅ Assessments seeded successfully
✅ Badges seeded successfully
✅ Sample users created
Database seeding completed!
```

This creates:
- 6 courses (Beginner to Advanced)
- Course modules and lessons
- Assessment questions
- Badge definitions
- Sample user data

---

## Step 7: Run Development Server (1 minute)

Start the development server:

```bash
pnpm dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

You should see the PromptMaster AI landing page! 🎉

---

## Step 8: Create Your Admin Account (2 minutes)

### 8.1 Sign Up
1. Click **"Get Started"** or **"Sign Up"**
2. Enter your email and password
3. Click **"Sign Up"**
4. You'll be redirected to the dashboard

### 8.2 Set Admin Role
1. Go back to [Firebase Console](https://console.firebase.google.com/)
2. Open your project
3. Click **Firestore Database**
4. Click **users** collection
5. Find your user document (click to open)
6. Find the `role` field (currently shows `"user"`)
7. Click the **edit icon** (pencil)
8. Change value to: `admin`
9. Click **Update**

### 8.3 Verify Admin Access
1. Go back to your app
2. Refresh the page
3. Navigate to `/admin` in the URL
4. You should now see the Admin Dashboard! ✅

---

## ✅ Setup Complete!

Your PromptMaster AI platform is now fully functional with:

- ✅ User authentication
- ✅ Course catalog with 6 courses
- ✅ Interactive assessments
- ✅ User dashboard and progress tracking
- ✅ Profile management
- ✅ Leaderboard
- ✅ Admin panel (you have access!)

---

## 🎯 Next Steps

### Test the Platform
1. Browse courses at `/courses`
2. Take an assessment at `/assessment`
3. View your profile at `/profile`
4. Check the leaderboard at `/leaderboard`
5. Manage content in admin panel at `/admin`

### Customize Content
1. Edit `seed-admin.ts` to add your own courses
2. Run `pnpm seed:admin` again to update database
3. Modify styling in `src/index.css`
4. Update branding in `index.html`

### Deploy to Production
See `README.md` for deployment instructions using:
- Firebase Hosting (recommended)
- Vercel
- Netlify
- Other hosting platforms

---

## 🐛 Troubleshooting

### "Firebase: Error (auth/configuration-not-found)"
- You forgot to update `src/firebase/config.ts` with your credentials
- Go back to Step 4.2

### "Missing or insufficient permissions"
- Update Firestore security rules (Step 3.4)
- Make sure you're signed in

### Seed script fails
- Check that `serviceAccountKey.json` is in project root
- Verify the file is valid JSON
- Make sure Firestore is enabled

### Port 5173 already in use
- Stop other Vite/React apps
- Or change port in `vite.config.ts`

### Can't access admin panel
- Make sure you set role to `"admin"` in Firestore (Step 8.2)
- Refresh the page after changing role
- Check browser console for errors

---

## 📞 Need Help?

1. Check the main `README.md` for detailed documentation
2. Review Firebase documentation at [firebase.google.com/docs](https://firebase.google.com/docs)
3. Check browser console (F12) for error messages
4. Verify all steps were completed in order

---

## 🎉 Congratulations!

You've successfully set up a complete learning management platform! 

Start customizing it to fit your needs and deploy it to share with the world.

Happy teaching! 🚀
