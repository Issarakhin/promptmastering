import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  increment,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config';

export interface PracticeLab {
  id: string;
  courseId: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  prompt: string;
  expectedOutput: string;
  hints: string[];
  points: number;
}

export interface LabSubmission {
  id?: string;
  userId: string;
  labId: string;
  courseId: string;
  userPrompt: string;
  output: string;
  score: number;
  passed: boolean;
  feedback: string;
  submittedAt: Date;
  timeSpent: number; // in minutes
}

// Get all practice labs for a course
export async function getCourseLabs(courseId: string): Promise<PracticeLab[]> {
  const q = query(
    collection(db, 'practiceLabs'),
    where('courseId', '==', courseId)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PracticeLab));
}

// Get a specific practice lab
export async function getPracticeLab(labId: string): Promise<PracticeLab | null> {
  const labRef = doc(db, 'practiceLabs', labId);
  const labDoc = await getDoc(labRef);

  if (labDoc.exists()) {
    return { id: labDoc.id, ...labDoc.data() } as PracticeLab;
  }
  return null;
}

// Submit a practice lab
export async function submitLab(submission: LabSubmission): Promise<string> {
  const submissionRef = doc(collection(db, 'labSubmissions'));
  const submissionData = {
    ...submission,
    submittedAt: new Date(),
    id: submissionRef.id
  };

  await setDoc(submissionRef, submissionData);

  // Update user stats if passed
  if (submission.passed) {
    const userRef = doc(db, 'users', submission.userId);
    await updateDoc(userRef, {
      totalPoints: increment(submission.score),
      labsCompleted: increment(1),
      lastLabAt: serverTimestamp()
    });

    // Mark lab as completed in user progress
    const labProgressRef = doc(db, 'labProgress', `${submission.userId}_${submission.labId}`);
    await setDoc(labProgressRef, {
      userId: submission.userId,
      labId: submission.labId,
      courseId: submission.courseId,
      completed: true,
      completedAt: new Date(),
      bestScore: submission.score
    });
  }

  return submissionRef.id;
}

// Get user's lab submissions
export async function getUserLabSubmissions(userId: string, labId?: string): Promise<LabSubmission[]> {
  let q;
  if (labId) {
    q = query(
      collection(db, 'labSubmissions'),
      where('userId', '==', userId),
      where('labId', '==', labId)
    );
  } else {
    q = query(
      collection(db, 'labSubmissions'),
      where('userId', '==', userId)
    );
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LabSubmission));
}

// Get user's best score for a lab
export async function getBestLabScore(userId: string, labId: string): Promise<number> {
  const submissions = await getUserLabSubmissions(userId, labId);
  if (submissions.length === 0) {
    return 0;
  }
  return Math.max(...submissions.map(s => s.score));
}

// Check if user has completed a lab
export async function hasCompletedLab(userId: string, labId: string): Promise<boolean> {
  const labProgressRef = doc(db, 'labProgress', `${userId}_${labId}`);
  const labProgressDoc = await getDoc(labProgressRef);
  return labProgressDoc.exists() && labProgressDoc.data()?.completed === true;
}

// Get lab completion stats for a user
export async function getLabStats(userId: string): Promise<{
  totalLabs: number;
  completedLabs: number;
  averageScore: number;
  totalPoints: number;
}> {
  const submissions = await getUserLabSubmissions(userId);
  const passedSubmissions = submissions.filter(s => s.passed);

  // Get unique completed labs
  const completedLabIds = new Set(passedSubmissions.map(s => s.labId));

  // Calculate average score from best attempts
  const labScores = new Map<string, number>();
  submissions.forEach(sub => {
    const currentBest = labScores.get(sub.labId) || 0;
    if (sub.score > currentBest) {
      labScores.set(sub.labId, sub.score);
    }
  });

  const scores = Array.from(labScores.values());
  const averageScore = scores.length > 0 
    ? scores.reduce((sum, score) => sum + score, 0) / scores.length 
    : 0;

  const totalPoints = passedSubmissions.reduce((sum, sub) => sum + sub.score, 0);

  return {
    totalLabs: labScores.size,
    completedLabs: completedLabIds.size,
    averageScore: Math.round(averageScore),
    totalPoints
  };
}

// Evaluate lab submission (simple text comparison for now)
// In a real app, this would use AI to evaluate the prompt quality
export function evaluateLabSubmission(
  userPrompt: string,
  expectedOutput: string,
  actualOutput: string
): { score: number; passed: boolean; feedback: string } {
  // Simple evaluation logic
  // In production, you'd want to use AI or more sophisticated comparison
  
  const promptLength = userPrompt.length;
  const hasKeywords = expectedOutput.toLowerCase().split(' ').some(word => 
    actualOutput.toLowerCase().includes(word)
  );

  let score = 0;
  let feedback = '';

  // Basic scoring
  if (promptLength < 10) {
    score = 30;
    feedback = 'Your prompt is too short. Try to be more descriptive.';
  } else if (promptLength < 50) {
    score = 60;
    feedback = 'Good start! Try adding more context and specific instructions.';
  } else if (hasKeywords) {
    score = 90;
    feedback = 'Excellent! Your prompt produced relevant output.';
  } else {
    score = 70;
    feedback = 'Good effort! Your prompt is detailed but could be more specific.';
  }

  const passed = score >= 70;

  return { score, passed, feedback };
}
