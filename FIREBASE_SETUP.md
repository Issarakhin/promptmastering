# PromptMaster AI - Firebase Version Setup Guide

## 🔥 Firebase Free Tier Features Used

This project uses **only FREE Firebase features**:

✅ **Firebase Authentication** - Email/Password auth (free unlimited)  
✅ **Cloud Firestore** - NoSQL database (50K reads/day, 20K writes/day free)  
✅ **Firebase Storage** - File storage (5GB storage, 1GB/day transfer free)  
✅ **Firebase Hosting** - Static hosting (10GB storage, 360MB/day transfer free)  

**No paid features required!**

---

## 📋 Prerequisites

1. **Node.js** v20+ installed
2. **pnpm** package manager (`npm install -g pnpm`)
3. **Firebase account** (free at [firebase.google.com](https://firebase.google.com))

---

## 🚀 Step-by-Step Setup

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `promptmaster-ai` (or your choice)
4. Disable Google Analytics (optional, to stay on free tier)
5. Click "Create project"

### Step 2: Enable Firebase Services

#### Enable Authentication
1. In Firebase Console, go to **Authentication** → **Get started**
2. Click **Sign-in method** tab
3. Enable **Email/Password** provider
4. Click **Save**

#### Enable Firestore Database
1. Go to **Firestore Database** → **Create database**
2. Choose **Start in test mode** (we'll secure it later)
3. Select your preferred location (choose closest to your users)
4. Click **Enable**

#### Enable Storage
1. Go to **Storage** → **Get started**
2. Choose **Start in test mode**
3. Click **Next** → **Done**

### Step 3: Get Firebase Configuration

1. In Firebase Console, click the **gear icon** ⚙️ → **Project settings**
2. Scroll down to "Your apps"
3. Click the **Web icon** `</>`
4. Register app with nickname: `PromptMaster Web`
5. **Copy the firebaseConfig object**

It will look like this:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

### Step 4: Configure Your Project

1. Open `src/firebase/config.ts`
2. **Replace** the placeholder config with your actual Firebase config:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### Step 5: Install Dependencies

```bash
cd promptmaster-firebase
pnpm install
```

### Step 6: Seed Firestore Database (Optional)

Run the seed script to add sample courses and data:

```bash
pnpm exec tsx seed-firestore.ts
```

This will create:
- 6 sample courses
- Assessment questions
- Badge definitions
- Practice labs

### Step 7: Run Development Server

```bash
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser!

---

## 🗄️ Firestore Database Structure

The app uses these Firestore collections:

### Collections

1. **users** - User profiles and stats
   ```
   {
     uid: string,
     email: string,
     displayName: string,
     role: 'user' | 'admin',
     totalPoints: number,
     level: number,
     coursesCompleted: number,
     createdAt: timestamp
   }
   ```

2. **courses** - Course catalog
   ```
   {
     title: string,
     description: string,
     difficulty: 'beginner' | 'intermediate' | 'advanced',
     category: string,
     estimatedHours: number,
     order: number
   }
   ```

3. **assessmentQuestions** - Quiz questions
   ```
   {
     question: string,
     options: string[],
     correctAnswer: string,
     difficulty: string,
     points: number
   }
   ```

4. **userProgress** - User course progress
   ```
   {
     userId: string,
     courseId: string,
     progress: number,
     status: 'not_started' | 'in_progress' | 'completed',
     lastAccessed: timestamp
   }
   ```

5. **userAssessments** - Assessment results
   ```
   {
     userId: string,
     score: number,
     skillLevel: 'beginner' | 'intermediate' | 'advanced',
     completedAt: timestamp
   }
   ```

6. **badges** - Available badges
7. **userBadges** - Earned badges
8. **practiceLabs** - Practice exercises
9. **labSubmissions** - User lab submissions

---

## 🔒 Security Rules (Important!)

After testing, update your Firestore Security Rules:

1. Go to **Firestore Database** → **Rules** tab
2. Replace with these secure rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    // Courses are public read, admin write
    match /courses/{courseId} {
      allow read: if true;
      allow write: if request.auth != null && 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // User progress - users can only access their own
    match /userProgress/{progressId} {
      allow read, write: if request.auth != null && 
                           resource.data.userId == request.auth.uid;
    }
    
    // Assessment questions - authenticated read only
    match /assessmentQuestions/{questionId} {
      allow read: if request.auth != null;
      allow write: if false;
    }
    
    // User assessments - users can only access their own
    match /userAssessments/{assessmentId} {
      allow read, write: if request.auth != null && 
                           resource.data.userId == request.auth.uid;
    }
    
    // Badges - public read
    match /badges/{badgeId} {
      allow read: if true;
      allow write: if false;
    }
    
    // User badges - users can read their own
    match /userBadges/{userBadgeId} {
      allow read: if request.auth != null && 
                    resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
    }
  }
}
```

3. Click **Publish**

---

## 🚀 Deployment to Firebase Hosting

### One-Time Setup

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init

# Select:
# - Hosting
# - Use existing project (select your project)
# - Public directory: dist
# - Single-page app: Yes
# - GitHub deploys: No
```

### Deploy

```bash
# Build the project
pnpm build

# Deploy to Firebase Hosting
firebase deploy
```

Your app will be live at: `https://your-project-id.web.app`

---

## 📊 Free Tier Limits

Stay within these limits to remain free:

| Service | Free Tier Limit |
|---------|----------------|
| Firestore Reads | 50,000/day |
| Firestore Writes | 20,000/day |
| Storage | 5 GB total |
| Storage Transfer | 1 GB/day |
| Hosting Storage | 10 GB |
| Hosting Transfer | 360 MB/day |
| Authentication | Unlimited |

**Tips to stay within limits:**
- Cache data on frontend
- Use pagination for lists
- Optimize images before upload
- Enable offline persistence

---

## 🎯 Making Your First Admin User

By default, all new users have role `'user'`. To make yourself an admin:

1. Sign up through the app
2. Go to Firebase Console → **Firestore Database**
3. Find your user document in the `users` collection
4. Edit the `role` field from `user` to `admin`
5. Save changes
6. Refresh your app - you now have admin access!

---

## 🛠️ Development Commands

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Seed Firestore database
pnpm exec tsx seed-firestore.ts
```

---

## 📁 Project Structure

```
promptmaster-firebase/
├── src/
│   ├── firebase/
│   │   ├── config.ts          # Firebase configuration
│   │   └── services/          # Firebase service helpers
│   ├── contexts/
│   │   └── AuthContext.tsx    # Authentication context
│   ├── components/
│   │   ├── PrivateRoute.tsx   # Protected route wrapper
│   │   └── AdminRoute.tsx     # Admin-only route wrapper
│   ├── pages/
│   │   ├── Home.tsx           # Landing page
│   │   ├── Login.tsx          # Login page
│   │   ├── Signup.tsx         # Registration page
│   │   ├── Dashboard.tsx      # User dashboard
│   │   ├── Courses.tsx        # Course catalog
│   │   ├── CourseDetail.tsx   # Individual course
│   │   ├── Assessment.tsx     # Skill assessment
│   │   ├── Profile.tsx        # User profile
│   │   └── admin/
│   │       └── AdminDashboard.tsx  # Admin panel
│   ├── App.tsx                # Main app component
│   └── main.tsx               # Entry point
├── seed-firestore.ts          # Database seeding script
├── tailwind.config.js         # Tailwind configuration
└── package.json               # Dependencies
```

---

## ❓ Troubleshooting

### "Firebase: Error (auth/configuration-not-found)"
- Make sure you've replaced the placeholder config in `src/firebase/config.ts` with your actual Firebase credentials

### "Missing or insufficient permissions"
- Check your Firestore Security Rules
- Make sure you're signed in
- Verify the user has the correct role for admin actions

### Build errors
- Run `pnpm install` to ensure all dependencies are installed
- Clear cache: `rm -rf node_modules .vite && pnpm install`

### Can't create admin user
- Manually edit the user document in Firestore Console
- Change the `role` field to `'admin'`

---

## 🎓 Next Steps

1. **Customize the UI** - Edit pages in `src/pages/`
2. **Add more courses** - Use the seed script or Firebase Console
3. **Implement practice labs** - Add interactive exercises
4. **Build admin panel** - Add course/user management features
5. **Add analytics** - Track user progress and engagement

---

## 📚 Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Data Modeling](https://firebase.google.com/docs/firestore/data-model)
- [Firebase Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [React Router Documentation](https://reactrouter.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

**Built with ❤️ for free Firebase hosting!**
