import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  updateDoc,
  increment,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config';

export interface AssessmentResult {
  id?: string;
  userId: string;
  assessmentId: string;
  courseId?: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  passed: boolean;
  timeSpent: number; // in seconds
  answers: {
    questionId: number;
    selectedAnswer: number;
    correct: boolean;
  }[];
  completedAt: Date;
}

export interface Assessment {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  timeLimit: number; // in minutes
  passingScore: number; // percentage
  questions: AssessmentQuestion[];
}

export interface AssessmentQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

// Submit assessment results
export async function submitAssessment(result: AssessmentResult): Promise<string> {
  const resultRef = doc(collection(db, 'assessmentResults'));
  const resultData = {
    ...result,
    completedAt: new Date(),
    id: resultRef.id
  };

  await setDoc(resultRef, resultData);

  // Update user stats
  const userRef = doc(db, 'users', result.userId);
  await updateDoc(userRef, {
    totalPoints: increment(result.score * 10), // 10 points per correct answer
    lastAssessmentAt: serverTimestamp()
  });

  // If passed, award badge if applicable
  if (result.passed && result.score === 100) {
    await awardPerfectScoreBadge(result.userId);
  }

  return resultRef.id;
}

// Get user's assessment results
export async function getUserAssessmentResults(userId: string): Promise<AssessmentResult[]> {
  const q = query(
    collection(db, 'assessmentResults'),
    where('userId', '==', userId),
    orderBy('completedAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AssessmentResult));
}

// Get specific assessment result
export async function getAssessmentResult(resultId: string): Promise<AssessmentResult | null> {
  const resultRef = doc(db, 'assessmentResults', resultId);
  const resultDoc = await getDoc(resultRef);

  if (resultDoc.exists()) {
    return { id: resultDoc.id, ...resultDoc.data() } as AssessmentResult;
  }
  return null;
}

// Get assessment by ID
export async function getAssessment(assessmentId: string): Promise<Assessment | null> {
  const assessmentRef = doc(db, 'assessments', assessmentId);
  const assessmentDoc = await getDoc(assessmentRef);

  if (assessmentDoc.exists()) {
    return { id: assessmentDoc.id, ...assessmentDoc.data() } as Assessment;
  }
  return null;
}

// Get all assessments
export async function getAllAssessments(): Promise<Assessment[]> {
  const snapshot = await getDocs(collection(db, 'assessments'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Assessment));
}

// Get user's best score for an assessment
export async function getBestScore(userId: string, assessmentId: string): Promise<number> {
  const q = query(
    collection(db, 'assessmentResults'),
    where('userId', '==', userId),
    where('assessmentId', '==', assessmentId),
    orderBy('score', 'desc'),
    limit(1)
  );

  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    return snapshot.docs[0].data().score;
  }
  return 0;
}

// Check if user has passed an assessment
export async function hasPassedAssessment(userId: string, assessmentId: string): Promise<boolean> {
  const q = query(
    collection(db, 'assessmentResults'),
    where('userId', '==', userId),
    where('assessmentId', '==', assessmentId),
    where('passed', '==', true),
    limit(1)
  );

  const snapshot = await getDocs(q);
  return !snapshot.empty;
}

// Award perfect score badge
async function awardPerfectScoreBadge(userId: string): Promise<void> {
  const badgeRef = doc(db, 'userBadges', `${userId}_perfect_score`);
  const badgeDoc = await getDoc(badgeRef);

  if (!badgeDoc.exists()) {
    await setDoc(badgeRef, {
      userId,
      badgeId: 'perfect_score',
      badgeName: 'Perfect Score',
      awardedAt: new Date(),
      description: 'Scored 100% on an assessment'
    });

    // Update user badge count
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      totalBadges: increment(1)
    });
  }
}

// Get assessment statistics for a user
export async function getAssessmentStats(userId: string): Promise<{
  totalAttempts: number;
  totalPassed: number;
  averageScore: number;
  bestScore: number;
}> {
  const q = query(
    collection(db, 'assessmentResults'),
    where('userId', '==', userId)
  );

  const snapshot = await getDocs(q);
  const results = snapshot.docs.map(doc => doc.data() as AssessmentResult);

  if (results.length === 0) {
    return {
      totalAttempts: 0,
      totalPassed: 0,
      averageScore: 0,
      bestScore: 0
    };
  }

  const totalAttempts = results.length;
  const totalPassed = results.filter(r => r.passed).length;
  const averageScore = results.reduce((sum, r) => sum + r.score, 0) / totalAttempts;
  const bestScore = Math.max(...results.map(r => r.score));

  return {
    totalAttempts,
    totalPassed,
    averageScore: Math.round(averageScore),
    bestScore
  };
}
