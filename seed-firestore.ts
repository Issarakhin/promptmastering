import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, setDoc, doc } from 'firebase/firestore';

// You need to replace this with your actual Firebase config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seedDatabase() {
  console.log('🌱 Seeding Firestore database...');

  try {
    // Seed Courses
    const courses = [
      {
        title: 'Introduction to Prompt Engineering',
        description: 'Learn the fundamentals of crafting effective prompts for AI systems',
        difficulty: 'beginner',
        category: 'Fundamentals',
        estimatedHours: 4,
        order: 1
      },
      {
        title: 'Advanced Prompting Techniques',
        description: 'Master chain-of-thought, few-shot learning, and complex prompting strategies',
        difficulty: 'advanced',
        category: 'Advanced',
        estimatedHours: 6,
        order: 2
      },
      {
        title: 'AI for Content Creation',
        description: 'Use AI to generate compelling content, articles, and creative writing',
        difficulty: 'intermediate',
        category: 'Content',
        estimatedHours: 5,
        order: 3
      },
      {
        title: 'AI for Business & Marketing',
        description: 'Leverage AI for marketing campaigns, business strategy, and customer engagement',
        difficulty: 'intermediate',
        category: 'Business',
        estimatedHours: 5,
        order: 4
      },
      {
        title: 'AI for Data Analysis',
        description: 'Extract insights and analyze data using AI-powered prompts',
        difficulty: 'intermediate',
        category: 'Data',
        estimatedHours: 6,
        order: 5
      },
      {
        title: 'AI for Code Generation',
        description: 'Generate, debug, and optimize code with AI assistance',
        difficulty: 'intermediate',
        category: 'Development',
        estimatedHours: 7,
        order: 6
      }
    ];

    for (const course of courses) {
      await addDoc(collection(db, 'courses'), course);
    }
    console.log('✅ Courses seeded');

    // Seed Assessment Questions
    const questions = [
      {
        question: 'What is prompt engineering?',
        options: [
          'Writing code for AI models',
          'Crafting effective instructions for AI systems',
          'Building AI hardware',
          'Training AI models from scratch'
        ],
        correctAnswer: 'Crafting effective instructions for AI systems',
        difficulty: 'beginner',
        points: 10
      },
      {
        question: 'Which technique helps AI provide more accurate responses?',
        options: [
          'Using vague language',
          'Providing clear context and examples',
          'Asking multiple questions at once',
          'Using technical jargon'
        ],
        correctAnswer: 'Providing clear context and examples',
        difficulty: 'intermediate',
        points: 10
      },
      {
        question: 'What is "few-shot learning" in prompt engineering?',
        options: [
          'Training AI with minimal data',
          'Providing examples in the prompt to guide AI responses',
          'Using short prompts only',
          'Limiting AI response length'
        ],
        correctAnswer: 'Providing examples in the prompt to guide AI responses',
        difficulty: 'advanced',
        points: 10
      }
    ];

    for (const question of questions) {
      await addDoc(collection(db, 'assessmentQuestions'), question);
    }
    console.log('✅ Assessment questions seeded');

    // Seed Badges
    const badges = [
      {
        name: 'First Steps',
        description: 'Complete your first course',
        icon: 'trophy',
        requirement: 'Complete 1 course'
      },
      {
        name: 'Quick Learner',
        description: 'Complete assessment with high score',
        icon: 'zap',
        requirement: 'Score 80%+ on assessment'
      },
      {
        name: 'Practice Master',
        description: 'Complete 10 practice labs',
        icon: 'target',
        requirement: 'Complete 10 labs'
      },
      {
        name: 'Course Champion',
        description: 'Complete 5 courses',
        icon: 'award',
        requirement: 'Complete 5 courses'
      }
    ];

    for (const badge of badges) {
      await addDoc(collection(db, 'badges'), badge);
    }
    console.log('✅ Badges seeded');

    // Seed Practice Labs
    const labs = [
      {
        courseId: 'intro-prompt-engineering',
        title: 'Basic Prompt Writing',
        description: 'Practice writing clear and effective prompts',
        prompt: 'Write a prompt that asks AI to explain quantum computing to a 10-year-old',
        difficulty: 'beginner',
        points: 50
      },
      {
        courseId: 'intro-prompt-engineering',
        title: 'Context-Rich Prompting',
        description: 'Learn to provide proper context in your prompts',
        prompt: 'Create a prompt that includes role, context, and specific requirements for writing a product description',
        difficulty: 'intermediate',
        points: 75
      }
    ];

    for (const lab of labs) {
      await addDoc(collection(db, 'practiceLabs'), lab);
    }
    console.log('✅ Practice labs seeded');

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Update src/firebase/config.ts with your Firebase credentials');
    console.log('2. Run: pnpm dev');
    console.log('3. Sign up for an account');
    console.log('4. Manually set your user role to "admin" in Firestore Console');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
}

seedDatabase();
