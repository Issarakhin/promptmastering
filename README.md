# PromptMaster AI - Firebase Learning Platform

A comprehensive AI & Prompt Engineering learning platform built with React, TypeScript, and Firebase. This is a standalone version designed for easy deployment using 100% free Firebase services.

## 🌟 Features

### Core Functionality
- **User Authentication** - Email/password authentication with Firebase Auth
- **Course Catalog** - Browse and filter courses by difficulty level
- **Interactive Assessments** - Skill evaluation quizzes with instant results
- **User Dashboard** - Track progress, stats, and course recommendations
- **Profile Management** - View stats, earned badges, and activity history
- **Leaderboard** - Competition rankings with podium display
- **Admin Dashboard** - Content and user management (role-based access)

### Technical Highlights
- React 19 with TypeScript for type safety
- Firebase Authentication for secure user management
- Cloud Firestore for NoSQL database
- React Router for navigation
- Plain CSS with custom utility classes (no Tailwind)
- Lucide React for beautiful icons
- Responsive design for all devices

## 📋 Prerequisites

Before you begin, ensure you have:
- Node.js 18+ installed
- pnpm package manager (`npm install -g pnpm`)
- A Firebase account (free tier)
- Firebase CLI (`npm install -g firebase-tools`)

## 🚀 Quick Start

### 1. Clone/Extract Project

Extract this ZIP file to your desired location.

### 2. Install Dependencies

```bash
cd promptmaster-firebase
pnpm install
```

### 3. Firebase Setup

#### Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name (e.g., "promptmaster-ai")
4. Disable Google Analytics (optional)
5. Click "Create project"

#### Enable Authentication
1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Enable **Email/Password** provider
3. Click "Save"

#### Create Firestore Database
1. Go to **Firestore Database** → **Create database**
2. Choose **Production mode**
3. Select your preferred location
4. Click "Enable"

#### Update Security Rules
In Firestore Database → **Rules**, replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to all users
    match /{document=**} {
      allow read: if true;
    }
    
    // Only authenticated users can write
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

### 4. Configure Firebase Credentials

#### Get Web App Config
1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll to "Your apps" → Click **Web** icon (</>)
3. Register app with nickname (e.g., "PromptMaster Web")
4. Copy the `firebaseConfig` object

#### Update `src/firebase/config.ts`
Replace the placeholder config with your actual Firebase credentials:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 5. Seed the Database

#### Get Service Account Key
1. In Firebase Console → **Project Settings** → **Service accounts**
2. Click **Generate new private key**
3. Save the JSON file as `serviceAccountKey.json` in project root
4. ⚠️ **IMPORTANT**: Never commit this file to Git!

#### Run Seed Script
```bash
pnpm seed:admin
```

This will populate your database with:
- 6 sample courses (Beginner to Advanced)
- Course modules and lessons
- Assessment questions
- Badge definitions
- Sample user data

### 6. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 7. Create Admin User

#### Sign Up
1. Go to the Signup page
2. Create your account with email/password

#### Set Admin Role
1. Go to Firebase Console → **Firestore Database**
2. Find the `users` collection
3. Click on your user document
4. Edit the `role` field → Change from `"user"` to `"admin"`
5. Save

Now you can access the Admin Dashboard at `/admin`.

## 📁 Project Structure

```
promptmaster-firebase/
├── src/
│   ├── pages/              # Page components
│   │   ├── Home.tsx        # Landing page
│   │   ├── Login.tsx       # Login page
│   │   ├── Signup.tsx      # Registration page
│   │   ├── Dashboard.tsx   # User dashboard
│   │   ├── Courses.tsx     # Course catalog
│   │   ├── CourseDetail.tsx # Individual course view
│   │   ├── Assessment.tsx  # Quiz/assessment page
│   │   ├── Profile.tsx     # User profile
│   │   ├── Leaderboard.tsx # Rankings page
│   │   └── admin/
│   │       └── AdminDashboard.tsx # Admin panel
│   ├── contexts/
│   │   └── AuthContext.tsx # Authentication context
│   ├── firebase/
│   │   └── config.ts       # Firebase configuration
│   ├── App.tsx             # Main app component
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles
├── seed-admin.ts           # Database seeding script
├── package.json            # Dependencies
├── vite.config.ts          # Vite configuration
└── tsconfig.json           # TypeScript configuration
```

## 🎨 Customization

### Branding
- Update app title in `index.html` (line 7)
- Modify gradient colors in `src/index.css` (`.gradient-text`, `.gradient-bg`)
- Replace logo/branding in navigation components

### Styling
- All styles are in plain CSS (no Tailwind)
- Custom utility classes in `src/index.css`
- Modify CSS variables for theme colors

### Content
- Add more courses by editing `seed-admin.ts`
- Customize assessment questions in seed data
- Update badge definitions and requirements

## 🚀 Deployment

### Firebase Hosting (Recommended)

1. **Build the project**
```bash
pnpm build
```

2. **Initialize Firebase Hosting**
```bash
firebase login
firebase init hosting
```

Configuration:
- Public directory: `dist`
- Single-page app: `Yes`
- Automatic builds: `No`

3. **Deploy**
```bash
firebase deploy
```

Your app will be live at `https://YOUR_PROJECT_ID.web.app`

### Other Hosting Options
- **Vercel**: Connect GitHub repo and deploy
- **Netlify**: Drag and drop `dist` folder
- **GitHub Pages**: Use `gh-pages` package

## 🔒 Security Considerations

### Production Checklist
- [ ] Update Firestore security rules for production
- [ ] Enable App Check for bot protection
- [ ] Set up Firebase Authentication email templates
- [ ] Configure password reset functionality
- [ ] Add rate limiting for API calls
- [ ] Remove `serviceAccountKey.json` before deployment
- [ ] Add `.env` file for sensitive configuration
- [ ] Enable Firebase Analytics (optional)

### Recommended Security Rules (Production)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Public read for courses and content
    match /courses/{courseId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    match /modules/{moduleId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    match /assessments/{assessmentId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    match /badges/{badgeId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // User-specific data
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && request.auth.uid == userId;
    }
    
    match /userProgress/{progressId} {
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      allow update: if isAuthenticated() && resource.data.userId == request.auth.uid;
    }
    
    match /assessmentResults/{resultId} {
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
    }
    
    match /userBadges/{badgeId} {
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
    }
  }
}
```

## 🐛 Troubleshooting

### Common Issues

**"Firebase not configured"**
- Ensure you've updated `src/firebase/config.ts` with your credentials
- Check that all Firebase services are enabled in console

**"Permission denied" errors**
- Update Firestore security rules as shown above
- Verify user is authenticated
- Check admin role is set correctly

**Seed script fails**
- Ensure `serviceAccountKey.json` is in project root
- Verify Firebase Admin SDK is properly initialized
- Check Firestore is enabled in Firebase Console

**Build errors**
- Clear node_modules: `rm -rf node_modules && pnpm install`
- Clear cache: `pnpm store prune`
- Check Node.js version (18+ required)

## 📚 Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Routing**: React Router v6
- **Authentication**: Firebase Auth
- **Database**: Cloud Firestore
- **Storage**: Firebase Storage (ready for use)
- **Icons**: Lucide React
- **Styling**: Plain CSS with custom utilities

## 🤝 Contributing

This is a standalone project template. Feel free to:
- Fork and customize for your needs
- Add new features and pages
- Improve styling and UX
- Extend database schema

## 📄 License

MIT License - Feel free to use this project for personal or commercial purposes.

## 🆘 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Firebase documentation
3. Check browser console for error messages
4. Verify all setup steps were completed

## 🎓 Next Steps

After setup:
1. Customize the course content in seed data
2. Add your own branding and styling
3. Implement additional features (certificates, payments, etc.)
4. Set up analytics and monitoring
5. Deploy to production

Happy learning! 🚀
