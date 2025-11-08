# PromptMaster AI - Easy Setup Guide

## 🚀 Quick Start (5 Minutes)

### Step 1: Install Dependencies
```bash
pnpm install
```

### Step 2: Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use existing)
3. Enable **Authentication** → Email/Password
4. Enable **Firestore Database** → Start in test mode
5. Go to Project Settings → General → Your apps
6. Copy your Firebase config

### Step 3: Add Firebase Config

Edit `src/firebase/config.ts` and replace with your config:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### Step 4: Start Development Server
```bash
pnpm dev
```

### Step 5: Seed Database (Browser-Based - No Admin SDK Needed!)

1. Open your browser to `http://localhost:5173/seed`
2. Click **"Seed Database Now"** button
3. Wait for success message
4. Done! Database is populated

**That's it!** No `serviceAccountKey.json` needed, no Admin SDK, no command-line tools!

---

## 📦 What Gets Seeded

The browser-based seeder creates:

- ✅ **5 Courses** (Beginner to Advanced)
  - Introduction to Prompt Engineering
  - Advanced Prompting Techniques
  - Prompt Optimization
  - Creative Prompting
  - Business Applications

- ✅ **10+ Modules** (Lessons for each course)
  - 30-50 minutes each
  - Organized by difficulty

- ✅ **2 Assessments** (Quizzes with questions)
  - Beginner Quiz (5 questions)
  - Intermediate Quiz (5 questions)
  - Multiple choice format
  - Automatic scoring

- ✅ **4 Badges** (Achievements)
  - First Steps (Complete 1 course)
  - Dedicated Learner (Complete 5 courses)
  - Perfect Score (100% on assessment)
  - Master Prompter (Complete all advanced)

---

## 🎯 After Seeding

1. Go to `http://localhost:5173/signup`
2. Create your account
3. Login and start learning!

---

## 🔥 Features That Work

### ✅ Authentication
- Sign up with email/password
- Login once, stay logged in
- Secure session management

### ✅ Course Enrollment
- Browse courses
- Click "Enroll" to join
- Enrollment saved to Firestore

### ✅ Progress Tracking
- Complete lessons
- Progress bar updates
- Time tracking
- Course completion

### ✅ Assessments
- Take quizzes
- Scores saved to database
- Earn points (10 per correct answer)
- View results history

### ✅ Badges
- Auto-awarded based on achievements
- Saved to Firestore
- Display on profile
- Track progress toward badges

### ✅ Dashboard
- Real stats from database
- Continue learning section
- Recommended courses
- Quick actions

### ✅ Profile
- View all your stats
- See earned badges
- Track learning progress
- Course completion history

### ✅ Leaderboard
- Compare with other learners
- Rankings by points
- Your rank highlighted

---

## 🛠️ Troubleshooting

### "Failed to seed database"
- Check Firebase config is correct
- Make sure Firestore is enabled
- Verify you're connected to internet

### "Cannot read properties of undefined"
- Firebase config is missing or incorrect
- Check `src/firebase/config.ts`

### "Permission denied"
- Firestore rules are too restrictive
- Start in test mode or update rules

### Database already seeded
- The seeder checks if data exists
- It won't duplicate data
- Safe to run multiple times

---

## 📁 Project Structure

```
src/
├── firebase/
│   ├── config.ts              ← Your Firebase config
│   └── services/              ← Database services
│       ├── userProgress.ts    ← Enrollment, progress
│       ├── assessments.ts     ← Quiz scoring
│       ├── badges.ts          ← Badge awarding
│       └── practiceLabs.ts    ← Lab submissions
├── pages/
│   ├── Home.tsx               ← Landing page
│   ├── Login.tsx              ← Login form
│   ├── Signup.tsx             ← Registration
│   ├── Dashboard.tsx          ← User dashboard
│   ├── Courses.tsx            ← Course catalog
│   ├── CourseDetail.tsx       ← Course page
│   ├── Assessment.tsx         ← Quiz taking
│   ├── Profile.tsx            ← User profile
│   ├── Leaderboard.tsx        ← Rankings
│   └── SeedDatabase.tsx       ← Database seeder
├── seed-data.ts               ← Sample data
└── App.tsx                    ← Routes
```

---

## 🎨 Design Features

- Brain icon logo on all pages
- Purple/pink gradient theme
- Dark mode (#0a0a0a background)
- 100% Plain CSS (no Tailwind)
- Responsive design
- Smooth animations

---

## 🚀 Deployment

When ready to deploy:

1. Update Firestore security rules
2. Build: `pnpm build`
3. Deploy to Firebase Hosting, Vercel, or Netlify
4. Update Firebase config for production

---

## 💡 Tips

- Run `/seed` only once per database
- Create admin users by manually updating role in Firestore
- Check browser console for any errors
- All data persists in Firestore

---

## 🎓 Ready to Learn!

Once seeded, you have a fully functional learning platform with:
- Real authentication
- Course enrollment
- Progress tracking
- Assessments with scoring
- Badge system
- Leaderboard

**Everything works and saves to the database!** 🎉
