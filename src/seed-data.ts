import { collection, doc, setDoc, getDocs } from 'firebase/firestore';
import { db } from './firebase/config';

// Sample data for seeding
const coursesData = [
  {
    id: 'intro-to-prompting',
    title: 'Introduction to Prompt Engineering',
    description: 'Learn the fundamentals of crafting effective AI prompts',
    difficulty: 'beginner',
    category: 'Fundamentals',
    estimatedHours: 4,
    order: 1
  },
  {
    id: 'advanced-techniques',
    title: 'Advanced Prompting Techniques',
    description: 'Master complex prompting strategies for better AI outputs',
    difficulty: 'intermediate',
    category: 'Advanced',
    estimatedHours: 6,
    order: 2
  },
  {
    id: 'prompt-optimization',
    title: 'Prompt Optimization',
    description: 'Optimize your prompts for maximum efficiency and accuracy',
    difficulty: 'advanced',
    category: 'Optimization',
    estimatedHours: 5,
    order: 3
  },
  {
    id: 'creative-prompting',
    title: 'Creative Prompting',
    description: 'Use AI for creative writing, storytelling, and content generation',
    difficulty: 'intermediate',
    category: 'Creative',
    estimatedHours: 4,
    order: 4
  },
  {
    id: 'business-applications',
    title: 'Business Applications',
    description: 'Apply prompt engineering to real business scenarios',
    difficulty: 'advanced',
    category: 'Business',
    estimatedHours: 7,
    order: 5
  }
];

const modulesData = [
  // Intro Module 1: What is Prompt Engineering?
  {
    id: 'intro-1',
    courseId: 'intro-to-prompting',
    title: 'What is Prompt Engineering?',
    description: 'Understanding the basics of prompt engineering',
    duration: 45,
    order: 1,
    sections: [
      {
        type: 'video',
        order: 1,
        videoUrl: 'https://www.youtube.com/embed/dOxUroR57xs',
        videoTitle: 'Introduction to Prompt Engineering',
        videoDuration: 600
      },
      {
        type: 'text',
        order: 2,
        textTitle: 'What is a Prompt?',
        textContent: '<h2>Understanding Prompts</h2><p>A prompt is the input you provide to an AI model to get a desired output. Think of it as giving instructions to a very smart assistant.</p><p><strong>Key Points:</strong></p><ul><li>Prompts guide AI behavior</li><li>Better prompts = better results</li><li>Prompt engineering is both art and science</li></ul>'
      },
      {
        type: 'quiz',
        order: 3,
        questions: [
          {
            question: 'What is a prompt in AI?',
            options: ['The output from AI', 'The input given to AI', 'A type of AI model', 'An error message'],
            correctAnswer: 1,
            explanation: 'A prompt is the input or instruction you give to an AI model.',
            points: 10
          },
          {
            question: 'Why is prompt engineering important?',
            options: ['To make AI faster', 'To get better AI responses', 'To save money', 'To train AI models'],
            correctAnswer: 1,
            explanation: 'Prompt engineering helps you craft inputs that produce better, more accurate AI outputs.',
            points: 10
          }
        ]
      },
      {
        type: 'lab',
        order: 4,
        labTitle: 'Write Your First Prompt',
        labDescription: 'Practice writing a clear and effective prompt',
        labPrompt: 'Write a prompt that asks AI to explain quantum physics to a 10-year-old child. Make sure your prompt is clear, specific, and includes the target audience.',
        labHints: [
          'Specify the audience (10-year-old)',
          'Ask for simple language',
          'Request examples or analogies',
          'Be specific about what to explain'
        ],
        labExpectedKeywords: ['10-year-old', 'simple', 'explain', 'quantum physics', 'easy', 'understand', 'child'],
        labPassingScore: 70,
        labPoints: 50
      }
    ]
  },
  
  // Intro Module 2: Basic Prompt Structure
  {
    id: 'intro-2',
    courseId: 'intro-to-prompting',
    title: 'Basic Prompt Structure',
    description: 'Learn how to structure effective prompts',
    duration: 40,
    order: 2,
    sections: [
      {
        type: 'video',
        order: 1,
        videoUrl: 'https://www.youtube.com/embed/jC4v5AS4RIM',
        videoTitle: 'Prompt Structure Basics',
        videoDuration: 480
      },
      {
        type: 'text',
        order: 2,
        textTitle: 'The 3 Parts of a Good Prompt',
        textContent: '<h2>Prompt Structure</h2><p>Every good prompt has three key components:</p><ol><li><strong>Context:</strong> Background information</li><li><strong>Instruction:</strong> What you want the AI to do</li><li><strong>Format:</strong> How you want the output</li></ol><p><strong>Example:</strong><br/>Context: "You are a marketing expert."<br/>Instruction: "Write a product description for wireless headphones."<br/>Format: "Use bullet points and keep it under 100 words."</p>'
      },
      {
        type: 'lab',
        order: 3,
        labTitle: 'Structure a Prompt',
        labDescription: 'Create a well-structured prompt with all three components',
        labPrompt: 'Write a prompt asking AI to create a social media post about a new coffee shop. Include context, instruction, and format specifications.',
        labHints: [
          'Start with context (who is the AI?)',
          'Give clear instruction (what to create)',
          'Specify format (length, style, tone)',
          'Mention the subject (coffee shop)'
        ],
        labExpectedKeywords: ['social media', 'coffee shop', 'post', 'context', 'format', 'tone'],
        labPassingScore: 70,
        labPoints: 50
      }
    ]
  },
  
  // Advanced Module 1: Chain of Thought
  {
    id: 'adv-1',
    courseId: 'advanced-techniques',
    title: 'Chain of Thought Prompting',
    description: 'Learn to guide AI through step-by-step reasoning',
    duration: 50,
    order: 1,
    sections: [
      {
        type: 'video',
        order: 1,
        videoUrl: 'https://www.youtube.com/embed/_VjQlMmMqLU',
        videoTitle: 'Chain of Thought Explained',
        videoDuration: 720
      },
      {
        type: 'text',
        order: 2,
        textTitle: 'What is Chain of Thought?',
        textContent: '<h2>Chain of Thought (CoT)</h2><p>Chain of Thought prompting encourages AI to break down complex problems into steps, showing its reasoning process.</p><p><strong>Benefits:</strong></p><ul><li>More accurate results for complex tasks</li><li>Transparent reasoning</li><li>Better problem-solving</li><li>Easier to debug</li></ul><p><strong>Example:</strong><br/>Instead of: "What is 15% of 240?"<br/>Use: "Calculate 15% of 240. Show your work step by step."</p>'
      },
      {
        type: 'quiz',
        order: 3,
        questions: [
          {
            question: 'What is Chain of Thought prompting?',
            options: [
              'Asking multiple questions in a row',
              'Guiding AI to show step-by-step reasoning',
              'Linking multiple AI models',
              'A type of AI training'
            ],
            correctAnswer: 1,
            explanation: 'CoT prompting asks AI to break down its reasoning into clear steps.',
            points: 15
          }
        ]
      },
      {
        type: 'lab',
        order: 4,
        labTitle: 'Create a Chain of Thought Prompt',
        labDescription: 'Write a prompt that uses chain of thought reasoning',
        labPrompt: 'Create a prompt that asks AI to solve this problem using chain of thought: "A store has 150 items. They sell 40% on Monday and 25% of the remaining on Tuesday. How many items are left?" Make sure to ask for step-by-step reasoning.',
        labHints: [
          'Ask AI to show each calculation step',
          'Request explanation of the logic',
          'Use phrases like "step by step" or "show your work"',
          'Break down the problem'
        ],
        labExpectedKeywords: ['step', 'calculate', 'reasoning', 'show', 'work', 'explain'],
        labPassingScore: 75,
        labPoints: 75
      }
    ]
  }
];

const assessmentsData = [
  {
    id: 'beginner-quiz',
    title: 'Beginner Prompt Engineering Quiz',
    description: 'Test your understanding of basic concepts',
    difficulty: 'beginner',
    timeLimit: 15,
    passingScore: 70,
    questions: [
      {
        question: 'What is the primary goal of prompt engineering?',
        options: [
          'To make AI models faster',
          'To get better, more accurate responses from AI',
          'To reduce AI costs',
          'To train new AI models'
        ],
        correctAnswer: 1,
        explanation: 'Prompt engineering focuses on crafting inputs that produce better AI outputs.'
      },
      {
        question: 'Which of these is a good practice for writing prompts?',
        options: [
          'Be vague to let AI be creative',
          'Use complex jargon',
          'Be clear and specific',
          'Keep prompts as short as possible'
        ],
        correctAnswer: 2,
        explanation: 'Clear and specific prompts help AI understand exactly what you want.'
      },
      {
        question: 'What does "context" mean in prompt engineering?',
        options: [
          'The AI model being used',
          'Background information provided to the AI',
          'The length of the prompt',
          'The programming language'
        ],
        correctAnswer: 1,
        explanation: 'Context is the background information that helps AI understand the situation.'
      },
      {
        question: 'Why is it important to iterate on prompts?',
        options: [
          'To waste time',
          'To confuse the AI',
          'To refine and improve results',
          'It is not important'
        ],
        correctAnswer: 2,
        explanation: 'Iteration helps you discover what works best and improve your results.'
      },
      {
        question: 'What is a "zero-shot" prompt?',
        options: [
          'A prompt with no examples',
          'A prompt that always fails',
          'A prompt with many examples',
          'A prompt for image generation'
        ],
        correctAnswer: 0,
        explanation: 'Zero-shot means asking the AI to perform a task without providing examples.'
      }
    ]
  },
  {
    id: 'intermediate-quiz',
    title: 'Intermediate Techniques Assessment',
    description: 'Evaluate your advanced prompting skills',
    difficulty: 'intermediate',
    timeLimit: 20,
    passingScore: 75,
    questions: [
      {
        question: 'What is "chain of thought" prompting?',
        options: [
          'Linking multiple AI models',
          'Asking AI to show its reasoning step-by-step',
          'Creating a series of unrelated prompts',
          'Using blockchain with AI'
        ],
        correctAnswer: 1,
        explanation: 'Chain of thought encourages AI to break down complex problems into steps.'
      },
      {
        question: 'In few-shot learning, what do you provide?',
        options: [
          'No examples',
          'One example',
          'Multiple examples',
          'Only the question'
        ],
        correctAnswer: 2,
        explanation: 'Few-shot learning involves providing several examples to guide the AI.'
      },
      {
        question: 'What is role prompting?',
        options: [
          'Asking AI to act as a specific character or expert',
          'Defining user roles in a system',
          'Creating role-playing games',
          'Assigning tasks to team members'
        ],
        correctAnswer: 0,
        explanation: 'Role prompting means asking AI to take on a specific persona or expertise.'
      },
      {
        question: 'Why use delimiters in prompts?',
        options: [
          'To make prompts longer',
          'To clearly separate different parts of the input',
          'To confuse the AI',
          'They serve no purpose'
        ],
        correctAnswer: 1,
        explanation: 'Delimiters help structure prompts and make sections clear to the AI.'
      },
      {
        question: 'What is prompt injection?',
        options: [
          'A beneficial technique',
          'A security vulnerability where malicious input alters AI behavior',
          'A way to improve prompts',
          'A medical procedure'
        ],
        correctAnswer: 1,
        explanation: 'Prompt injection is a security risk where attackers manipulate AI responses.'
      }
    ]
  }
];

const badgesData = [
  {
    id: 'first_steps',
    name: 'First Steps',
    description: 'Complete your first course',
    icon: '🎯',
    requirement: 'Complete 1 course',
    points: 100
  },
  {
    id: 'dedicated_learner',
    name: 'Dedicated Learner',
    description: 'Complete 5 courses',
    icon: '📚',
    requirement: 'Complete 5 courses',
    points: 500
  },
  {
    id: 'perfect_score',
    name: 'Perfect Score',
    description: 'Score 100% on an assessment',
    icon: '💯',
    requirement: 'Get 100% on any assessment',
    points: 200
  },
  {
    id: 'master_prompter',
    name: 'Master Prompter',
    description: 'Complete all advanced courses',
    icon: '👑',
    requirement: 'Complete all advanced difficulty courses',
    points: 1000
  }
];

export async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

    // Check if data already exists
    const coursesSnapshot = await getDocs(collection(db, 'courses'));
    if (!coursesSnapshot.empty) {
      console.log('Database already seeded. Skipping...');
      return { success: true, message: 'Database already contains data' };
    }

    // Seed courses
    console.log('Seeding courses...');
    for (const course of coursesData) {
      await setDoc(doc(db, 'courses', course.id), course);
    }

    // Seed modules
    console.log('Seeding modules...');
    for (const module of modulesData) {
      await setDoc(doc(db, 'modules', module.id), {
        ...module,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Seed assessments
    console.log('Seeding assessments...');
    for (const assessment of assessmentsData) {
      await setDoc(doc(db, 'assessments', assessment.id), assessment);
    }

    // Seed badges
    console.log('Seeding badges...');
    for (const badge of badgesData) {
      await setDoc(doc(db, 'badges', badge.id), badge);
    }

    console.log('✅ Database seeded successfully!');
    return { 
      success: true, 
      message: 'Database seeded successfully!',
      stats: {
        courses: coursesData.length,
        modules: modulesData.length,
        assessments: assessmentsData.length,
        badges: badgesData.length
      }
    };

  } catch (error) {
    console.error('Error seeding database:', error);
    return { 
      success: false, 
      message: 'Failed to seed database',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
