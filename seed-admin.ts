import * as admin from 'firebase-admin';
import * as fs from 'fs';

// Initialize Firebase Admin SDK
const serviceAccount = JSON.parse(
  fs.readFileSync('./serviceAccountKey.json', 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function seedDatabase() {
  console.log('🌱 Starting database seeding...\n');

  try {
    // Seed Courses
    console.log('📚 Seeding courses...');
    const courses = [
      {
        id: 'intro-to-prompting',
        title: 'Introduction to Prompt Engineering',
        description: 'Learn the fundamentals of crafting effective prompts for AI systems',
        difficulty: 'beginner',
        category: 'Fundamentals',
        estimatedHours: 4,
        order: 1,
        published: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        id: 'advanced-techniques',
        title: 'Advanced Prompting Techniques',
        description: 'Master complex prompting strategies and optimization methods',
        difficulty: 'advanced',
        category: 'Advanced',
        estimatedHours: 8,
        order: 2,
        published: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        id: 'chatgpt-mastery',
        title: 'ChatGPT Mastery',
        description: 'Become an expert in using ChatGPT for various applications',
        difficulty: 'intermediate',
        category: 'Tools',
        estimatedHours: 6,
        order: 3,
        published: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        id: 'prompt-patterns',
        title: 'Prompt Design Patterns',
        description: 'Learn reusable patterns for effective prompt engineering',
        difficulty: 'intermediate',
        category: 'Patterns',
        estimatedHours: 5,
        order: 4,
        published: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        id: 'ai-safety',
        title: 'AI Safety & Ethics',
        description: 'Understand responsible AI usage and ethical considerations',
        difficulty: 'beginner',
        category: 'Ethics',
        estimatedHours: 3,
        order: 5,
        published: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        id: 'business-applications',
        title: 'Business Applications of AI',
        description: 'Apply prompt engineering in real-world business scenarios',
        difficulty: 'advanced',
        category: 'Business',
        estimatedHours: 10,
        order: 6,
        published: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      }
    ];

    for (const course of courses) {
      await db.collection('courses').doc(course.id).set(course);
    }
    console.log('✅ Courses seeded successfully\n');

    // Seed Modules
    console.log('📖 Seeding modules...');
    const modules = [
      {
        courseId: 'intro-to-prompting',
        title: 'What is Prompt Engineering?',
        description: 'Understanding the basics of prompt engineering',
        order: 1,
        duration: 30,
        content: 'Prompt engineering is the practice of crafting effective instructions for AI systems...'
      },
      {
        courseId: 'intro-to-prompting',
        title: 'Basic Prompt Structure',
        description: 'Learn how to structure your prompts effectively',
        order: 2,
        duration: 45,
        content: 'A well-structured prompt typically includes context, instruction, and format...'
      },
      {
        courseId: 'advanced-techniques',
        title: 'Chain-of-Thought Prompting',
        description: 'Advanced reasoning techniques',
        order: 1,
        duration: 60,
        content: 'Chain-of-thought prompting helps AI systems break down complex problems...'
      }
    ];

    for (const module of modules) {
      await db.collection('modules').add(module);
    }
    console.log('✅ Modules seeded successfully\n');

    // Seed Assessments
    console.log('📝 Seeding assessments...');
    const assessments = [
      {
        title: 'Prompt Engineering Fundamentals Quiz',
        description: 'Test your knowledge of basic prompt engineering concepts',
        difficulty: 'beginner',
        timeLimit: 15,
        passingScore: 70,
        questions: [
          {
            question: 'What is the primary goal of prompt engineering?',
            options: [
              'To make AI systems faster',
              'To craft effective instructions for AI systems',
              'To program AI models',
              'To debug AI code'
            ],
            correctAnswer: 1,
            explanation: 'Prompt engineering focuses on crafting effective instructions to get better results from AI systems.'
          },
          {
            question: 'Which element is NOT typically part of a well-structured prompt?',
            options: [
              'Context',
              'Instruction',
              'Source code',
              'Format specification'
            ],
            correctAnswer: 2,
            explanation: 'Source code is not part of prompt structure. Prompts use natural language, not code.'
          },
          {
            question: 'What does "few-shot prompting" mean?',
            options: [
              'Asking very short questions',
              'Providing examples in your prompt',
              'Using minimal words',
              'Limiting API calls'
            ],
            correctAnswer: 1,
            explanation: 'Few-shot prompting involves providing examples to guide the AI\'s responses.'
          }
        ]
      },
      {
        title: 'Advanced Techniques Assessment',
        description: 'Evaluate your understanding of advanced prompting strategies',
        difficulty: 'advanced',
        timeLimit: 30,
        passingScore: 80,
        questions: [
          {
            question: 'What is chain-of-thought prompting?',
            options: [
              'Linking multiple prompts together',
              'Encouraging step-by-step reasoning',
              'Using blockchain in prompts',
              'Sequential API calls'
            ],
            correctAnswer: 1,
            explanation: 'Chain-of-thought prompting encourages the AI to show its reasoning process step by step.'
          },
          {
            question: 'Which technique helps reduce AI hallucinations?',
            options: [
              'Using longer prompts',
              'Grounding with specific facts and context',
              'Asking multiple times',
              'Using technical jargon'
            ],
            correctAnswer: 1,
            explanation: 'Providing specific facts and context helps ground the AI\'s responses in reality.'
          }
        ]
      }
    ];

    for (const assessment of assessments) {
      await db.collection('assessments').add(assessment);
    }
    console.log('✅ Assessments seeded successfully\n');

    // Seed Badges
    console.log('🏆 Seeding badges...');
    const badges = [
      {
        name: 'First Steps',
        description: 'Complete your first course',
        icon: '🎯',
        requirement: 'Complete 1 course',
        points: 100
      },
      {
        name: 'Quick Learner',
        description: 'Complete a course in under 3 days',
        icon: '⚡',
        requirement: 'Complete course quickly',
        points: 150
      },
      {
        name: 'Perfect Score',
        description: 'Score 100% on an assessment',
        icon: '💯',
        requirement: 'Score 100% on assessment',
        points: 200
      },
      {
        name: 'Dedicated Learner',
        description: 'Complete 5 courses',
        icon: '📚',
        requirement: 'Complete 5 courses',
        points: 500
      },
      {
        name: 'Master Prompter',
        description: 'Complete all advanced courses',
        icon: '👑',
        requirement: 'Complete all advanced courses',
        points: 1000
      }
    ];

    for (const badge of badges) {
      await db.collection('badges').add(badge);
    }
    console.log('✅ Badges seeded successfully\n');

    // Seed sample user data
    console.log('👤 Seeding sample users...');
    const sampleUsers = [
      {
        email: 'demo@example.com',
        displayName: 'Demo User',
        role: 'user',
        points: 250,
        level: 2,
        coursesCompleted: 1,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      }
    ];

    for (const user of sampleUsers) {
      await db.collection('users').add(user);
    }
    console.log('✅ Sample users created\n');

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - ${courses.length} courses`);
    console.log(`   - ${modules.length} modules`);
    console.log(`   - ${assessments.length} assessments`);
    console.log(`   - ${badges.length} badges`);
    console.log(`   - ${sampleUsers.length} sample users`);
    console.log('\n✨ Your database is ready to use!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Run the seeding function
seedDatabase()
  .then(() => {
    console.log('\n✅ Seeding process completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Seeding process failed:', error);
    process.exit(1);
  });
