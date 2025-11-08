# Module System Schema

## 📋 Database Structure

### Collection: `modules`

Each module document contains:

```typescript
{
  id: string;                    // Auto-generated
  courseId: string;              // Reference to course
  title: string;                 // Module title
  description: string;           // Brief description
  order: number;                 // Display order (1, 2, 3...)
  duration: number;              // Estimated minutes
  
  // Content sections (in order)
  sections: [
    {
      type: 'video' | 'text' | 'quiz' | 'lab';
      order: number;
      
      // For video sections
      videoUrl?: string;         // YouTube, Vimeo, or direct URL
      videoTitle?: string;
      videoDuration?: number;    // seconds
      
      // For text sections
      textContent?: string;      // Markdown supported
      textTitle?: string;
      
      // For quiz sections
      questions?: [
        {
          question: string;
          options: string[];
          correctAnswer: number;
          explanation: string;
          points: number;
        }
      ];
      
      // For lab sections
      labTitle?: string;
      labDescription?: string;
      labPrompt?: string;        // What user needs to do
      labHints?: string[];
      labExpectedKeywords?: string[];  // For AI evaluation
      labPassingScore?: number;  // Minimum score to pass
      labPoints?: number;        // Points awarded
    }
  ]
}
```

---

## 🎯 Example Module Structure

```json
{
  "id": "intro-1",
  "courseId": "intro-to-prompting",
  "title": "What is Prompt Engineering?",
  "description": "Learn the fundamentals of prompt engineering",
  "order": 1,
  "duration": 45,
  "sections": [
    {
      "type": "video",
      "order": 1,
      "videoUrl": "https://youtube.com/watch?v=example",
      "videoTitle": "Introduction to Prompts",
      "videoDuration": 600
    },
    {
      "type": "text",
      "order": 2,
      "textTitle": "Key Concepts",
      "textContent": "# Prompt Engineering\n\nPrompt engineering is..."
    },
    {
      "type": "quiz",
      "order": 3,
      "questions": [
        {
          "question": "What is a prompt?",
          "options": ["Input to AI", "Output from AI", "A bug", "A feature"],
          "correctAnswer": 0,
          "explanation": "A prompt is the input you give to an AI model",
          "points": 10
        }
      ]
    },
    {
      "type": "lab",
      "order": 4,
      "labTitle": "Write Your First Prompt",
      "labDescription": "Create a prompt that asks AI to explain quantum physics simply",
      "labPrompt": "Write a prompt that makes AI explain quantum physics to a 10-year-old",
      "labHints": [
        "Specify the audience (10-year-old)",
        "Ask for simple language",
        "Request examples or analogies"
      ],
      "labExpectedKeywords": ["simple", "explain", "10-year-old", "easy", "understand"],
      "labPassingScore": 70,
      "labPoints": 50
    }
  ]
}
```

---

## 📊 Progress Tracking

### Collection: `moduleProgress`

Document ID: `{userId}_{moduleId}`

```typescript
{
  userId: string;
  moduleId: string;
  courseId: string;
  startedAt: Date;
  completedAt?: Date;
  completed: boolean;
  
  // Section progress
  sectionProgress: {
    [sectionIndex: number]: {
      type: string;
      completed: boolean;
      completedAt?: Date;
      
      // For videos
      videoWatchTime?: number;   // seconds watched
      videoCompleted?: boolean;
      
      // For quizzes
      quizScore?: number;
      quizAnswers?: number[];
      quizPassed?: boolean;
      
      // For labs
      labSubmission?: string;
      labScore?: number;
      labFeedback?: string;
      labPassed?: boolean;
      labAttempts?: number;
    }
  };
  
  totalScore: number;
  maxScore: number;
  percentageComplete: number;
}
```

---

## 🤖 AI Lab Evaluation

The AI evaluates lab submissions based on:

1. **Keyword Matching** - Does it include expected keywords?
2. **Structure** - Is it well-formatted?
3. **Clarity** - Is it clear and specific?
4. **Completeness** - Does it address all requirements?

Scoring:
- 90-100: Excellent
- 70-89: Good
- 50-69: Needs Improvement
- 0-49: Incomplete

---

## 🎨 Admin Interface

Admins can add modules through Firebase Console or a custom admin panel:

### Adding a Module:

1. Go to Firestore
2. Create document in `modules` collection
3. Add fields as per schema
4. Set sections array with content

### Or use Admin Panel:

1. Login as admin
2. Go to `/admin/modules`
3. Click "Add Module"
4. Fill form with:
   - Basic info (title, description, course)
   - Add sections (video, text, quiz, lab)
   - Save to Firebase

---

## 🔄 User Flow

1. **Enroll in Course** → Access modules
2. **Start Module** → Progress tracked
3. **Watch Video** → Mark as watched
4. **Read Text** → Mark as read
5. **Take Quiz** → Score saved
6. **Complete Lab** → AI evaluates, gives score
7. **Module Complete** → Unlock next module
8. **Course Complete** → Award certificate/badge

---

## 📈 Scalability

- Modules are independent documents
- Easy to add/edit/delete
- Sections are arrays (flexible)
- Progress tracked separately
- AI evaluation is stateless
- Can add new content types easily

---

## 🛠️ Implementation Files

1. **`src/firebase/services/modules.ts`** - Module CRUD operations
2. **`src/firebase/services/moduleProgress.ts`** - Progress tracking
3. **`src/firebase/services/aiEvaluation.ts`** - AI lab scoring
4. **`src/pages/ModuleViewer.tsx`** - Module content display
5. **`src/pages/admin/ModuleManager.tsx`** - Admin interface
6. **`src/components/VideoPlayer.tsx`** - Video playback
7. **`src/components/QuizSection.tsx`** - Quiz taking
8. **`src/components/LabSection.tsx`** - Lab submission

---

## 📝 Sample Data Format

See `src/seed-data.ts` for complete examples of:
- Modules with all section types
- Properly structured content
- Realistic lab prompts
- Quiz questions with explanations
