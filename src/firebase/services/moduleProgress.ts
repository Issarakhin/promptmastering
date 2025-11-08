import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  increment
} from 'firebase/firestore';
import { db } from '../config';

export interface SectionProgress {
  type: string;
  completed: boolean;
  completedAt?: Date;
  
  // Video progress
  videoWatchTime?: number; // seconds watched
  videoCompleted?: boolean;
  
  // Quiz progress
  quizScore?: number;
  quizAnswers?: number[];
  quizPassed?: boolean;
  quizAttempts?: number;
  
  // Lab progress
  labSubmission?: string;
  labScore?: number;
  labFeedback?: string;
  labPassed?: boolean;
  labAttempts?: number;
  labStrengths?: string[];
  labImprovements?: string[];
}

export interface ModuleProgress {
  userId: string;
  moduleId: string;
  courseId: string;
  startedAt: Date;
  completedAt?: Date;
  completed: boolean;
  lastAccessedAt: Date;
  
  // Section-by-section progress
  sectionProgress: { [sectionIndex: number]: SectionProgress };
  
  // Overall stats
  totalScore: number;
  maxScore: number;
  percentageComplete: number;
  timeSpent: number; // minutes
}

// Get module progress for a user
export async function getModuleProgress(
  userId: string,
  courseId: string,
  moduleId: string
): Promise<ModuleProgress | null> {
  const userProgressId = `${userId}_${courseId}`;
  const moduleProgressRef = doc(db, 'userProgress', userProgressId, 'moduleProgress', moduleId);
  const progressDoc = await getDoc(moduleProgressRef);
  
  if (progressDoc.exists()) {
    return progressDoc.data() as ModuleProgress;
  }
  return null;
}

// Start a module (create initial progress)
export async function startModule(
  userId: string,
  courseId: string,
  moduleId: string
): Promise<void> {
  console.log('🚨 startModule called with:');
  console.log('  userId:', userId, 'type:', typeof userId);
  console.log('  courseId:', courseId, 'type:', typeof courseId);
  console.log('  moduleId:', moduleId, 'type:', typeof moduleId);
  
  if (!courseId) {
    console.error('❌ CRITICAL: courseId is undefined in startModule!');
    throw new Error('courseId is required but was undefined');
  }
  
  const userProgressId = `${userId}_${courseId}`;
  const moduleProgressRef = doc(db, 'userProgress', userProgressId, 'moduleProgress', moduleId);
  
  console.log('📍 Path:', `userProgress/${userProgressId}/moduleProgress/${moduleId}`);
  
  // Check if already started
  const existing = await getDoc(moduleProgressRef);
  if (existing.exists()) {
    console.log('✅ Progress already exists, updating lastAccessedAt');
    // Just update last accessed
    await updateDoc(moduleProgressRef, {
      lastAccessedAt: new Date()
    });
    return;
  }
  
  // Create new progress
  const initialProgress: ModuleProgress = {
    userId,
    moduleId,
    courseId,
    startedAt: new Date(),
    lastAccessedAt: new Date(),
    completed: false,
    sectionProgress: {},
    totalScore: 0,
    maxScore: 0,
    percentageComplete: 0,
    timeSpent: 0
  };
  
  console.log('💾 About to save progress:', initialProgress);
  await setDoc(moduleProgressRef, initialProgress);
  console.log('✅ Progress saved successfully');
}

// Update video watch progress
export async function updateVideoProgress(
  userId: string,
  courseId: string,
  moduleId: string,
  sectionIndex: number,
  watchTime: number,
  videoDuration: number
): Promise<void> {
  const userProgressId = `${userId}_${courseId}`;
  const progressRef = doc(db, 'userProgress', userProgressId, 'moduleProgress', moduleId);
  
  const progress = await getModuleProgress(userId, courseId, moduleId);
  if (!progress) return;
  
  const videoCompleted = watchTime >= videoDuration * 0.9; // 90% watched = completed
  
  progress.sectionProgress[sectionIndex] = {
    type: 'video',
    completed: videoCompleted,
    completedAt: videoCompleted ? new Date() : undefined,
    videoWatchTime: watchTime,
    videoCompleted
  };
  
  progress.lastAccessedAt = new Date();
  progress.percentageComplete = calculatePercentage(progress.sectionProgress);
  
  await updateDoc(progressRef, progress as any);
}

// Complete text section
export async function completeTextSection(
  userId: string,
  courseId: string,
  moduleId: string,
  sectionIndex: number
): Promise<void> {
  const userProgressId = `${userId}_${courseId}`;
  const progressRef = doc(db, 'userProgress', userProgressId, 'moduleProgress', moduleId);
  
  const progress = await getModuleProgress(userId, courseId, moduleId);
  if (!progress) return;
  
  progress.sectionProgress[sectionIndex] = {
    type: 'text',
    completed: true,
    completedAt: new Date()
  };
  
  progress.lastAccessedAt = new Date();
  progress.percentageComplete = calculatePercentage(progress.sectionProgress);
  
  await updateDoc(progressRef, progress as any);
}

// Submit quiz answers
export async function submitQuizAnswers(
  userId: string,
  courseId: string,
  moduleId: string,
  sectionIndex: number,
  answers: number[],
  correctAnswers: number[],
  pointsPerQuestion: number[]
): Promise<{ score: number; passed: boolean }> {
  const userProgressId = `${userId}_${courseId}`;
  const progressRef = doc(db, 'userProgress', userProgressId, 'moduleProgress', moduleId);
  
  const progress = await getModuleProgress(userId, courseId, moduleId);
  if (!progress) return { score: 0, passed: false };
  
  // Calculate score
  let score = 0;
  answers.forEach((answer, idx) => {
    if (answer === correctAnswers[idx]) {
      score += pointsPerQuestion[idx];
    }
  });
  
  const totalPoints = pointsPerQuestion.reduce((sum, p) => sum + p, 0);
  const percentage = (score / totalPoints) * 100;
  const passed = percentage >= 70;
  
  const existingSection = progress.sectionProgress[sectionIndex];
  const attempts = (existingSection?.quizAttempts || 0) + 1;
  
  progress.sectionProgress[sectionIndex] = {
    type: 'quiz',
    completed: passed,
    completedAt: passed ? new Date() : undefined,
    quizScore: score,
    quizAnswers: answers,
    quizPassed: passed,
    quizAttempts: attempts
  };
  
  progress.totalScore += score;
  progress.maxScore += totalPoints;
  progress.lastAccessedAt = new Date();
  progress.percentageComplete = calculatePercentage(progress.sectionProgress);
  
  await updateDoc(progressRef, progress as any);
  
  return { score, passed };
}

// Submit lab answer
export async function submitLabAnswer(
  userId: string,
  courseId: string,
  moduleId: string,
  sectionIndex: number,
  submission: string,
  evaluationResult: {
    score: number;
    passed: boolean;
    feedback: string;
    strengths: string[];
    improvements: string[];
  },
  labPoints: number
): Promise<void> {
  const userProgressId = `${userId}_${courseId}`;
  const progressRef = doc(db, 'userProgress', userProgressId, 'moduleProgress', moduleId);
  
  const progress = await getModuleProgress(userId, courseId, moduleId);
  if (!progress) return;
  
  const existingSection = progress.sectionProgress[sectionIndex];
  const attempts = (existingSection?.labAttempts || 0) + 1;
  
  progress.sectionProgress[sectionIndex] = {
    type: 'lab',
    completed: evaluationResult.passed,
    completedAt: evaluationResult.passed ? new Date() : undefined,
    labSubmission: submission,
    labScore: evaluationResult.score,
    labFeedback: evaluationResult.feedback,
    labPassed: evaluationResult.passed,
    labAttempts: attempts,
    labStrengths: evaluationResult.strengths,
    labImprovements: evaluationResult.improvements
  };
  
  if (evaluationResult.passed) {
    progress.totalScore += labPoints;
    progress.maxScore += labPoints;
  }
  
  progress.lastAccessedAt = new Date();
  progress.percentageComplete = calculatePercentage(progress.sectionProgress);
  
  await updateDoc(progressRef, progress as any);
  
  // Update user points if passed
  if (evaluationResult.passed) {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      totalPoints: increment(labPoints)
    });
  }
}

// Complete entire module
export async function completeModule(
  userId: string,
  courseId: string,
  moduleId: string
): Promise<void> {
  const userProgressId = `${userId}_${courseId}`;
  const progressRef = doc(db, 'userProgress', userProgressId, 'moduleProgress', moduleId);
  
  await updateDoc(progressRef, {
    completed: true,
    completedAt: new Date(),
    percentageComplete: 100
  });
  
  // Update course progress
  await updateCourseProgress(userId, courseId);
}

// Update course progress based on module completion
export async function updateCourseProgress(
  userId: string,
  courseId: string
): Promise<void> {
  const allModuleProgress = await getUserCourseModuleProgress(userId, courseId);
  
  if (allModuleProgress.length === 0) return;
  
  const completedModules = allModuleProgress.filter(m => m.completed).length;
  const totalModules = allModuleProgress.length;
  const progressPercentage = Math.round((completedModules / totalModules) * 100);
  
  const userProgressId = `${userId}_${courseId}`;
  const userProgressRef = doc(db, 'userProgress', userProgressId);
  
  const updateData: any = {
    progressPercentage,
    lastAccessedAt: new Date()
  };
  
  if (progressPercentage === 100) {
    updateData.completed = true;
    updateData.completedAt = new Date();
  }
  
  await updateDoc(userProgressRef, updateData);
}

// Get all module progress for a user in a course
export async function getUserCourseModuleProgress(
  userId: string,
  courseId: string
): Promise<ModuleProgress[]> {
  const userProgressId = `${userId}_${courseId}`;
  const moduleProgressCollection = collection(db, 'userProgress', userProgressId, 'moduleProgress');
  
  const snapshot = await getDocs(moduleProgressCollection);
  return snapshot.docs.map(doc => doc.data() as ModuleProgress);
}

// Calculate percentage complete based on sections
function calculatePercentage(sectionProgress: { [key: number]: SectionProgress }): number {
  const sections = Object.values(sectionProgress);
  if (sections.length === 0) return 0;
  
  const completed = sections.filter(s => s.completed).length;
  return Math.round((completed / sections.length) * 100);
}

// Get user's overall module statistics
export async function getUserModuleStats(userId: string): Promise<{
  modulesStarted: number;
  modulesCompleted: number;
  totalScore: number;
  averageScore: number;
}> {
  // Note: This now requires iterating through all userProgress documents
  // which is more complex with subcollections
  // For now, return placeholder values
  // TODO: Implement proper aggregation
  return {
    modulesStarted: 0,
    modulesCompleted: 0,
    totalScore: 0,
    averageScore: 0
  };
}

// Check if user can access next module (completed previous)
export async function canAccessModule(
  userId: string,
  courseId: string,
  moduleOrder: number
): Promise<boolean> {
  if (moduleOrder === 1) return true; // First module always accessible
  
  // Get all module progress for this course
  const courseProgress = await getUserCourseModuleProgress(userId, courseId);
  
  // Check if previous module is completed
  // This would require getting module info to check order
  // For now, return true (can implement stricter logic)
  return true;
}
