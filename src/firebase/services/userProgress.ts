import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  increment,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config';

export interface UserProgress {
  userId: string;
  courseId: string;
  enrolledAt: Date;
  lastAccessedAt: Date;
  completedLessons: string[];
  currentLesson: string | null;
  progressPercentage: number;
  totalTimeSpent: number; // in minutes
  completed: boolean;
  completedAt?: Date;
}

export interface LessonProgress {
  userId: string;
  courseId: string;
  lessonId: string;
  completed: boolean;
  completedAt?: Date;
  timeSpent: number;
  lastAccessedAt: Date;
}

// Enroll user in a course
export async function enrollInCourse(userId: string, courseId: string): Promise<void> {
  const progressRef = doc(db, 'userProgress', `${userId}_${courseId}`);
  
  const progressData: UserProgress = {
    userId,
    courseId,
    enrolledAt: new Date(),
    lastAccessedAt: new Date(),
    completedLessons: [],
    currentLesson: null,
    progressPercentage: 0,
    totalTimeSpent: 0,
    completed: false
  };

  await setDoc(progressRef, progressData);
}

// Check if user is enrolled in a course
export async function isEnrolled(userId: string, courseId: string): Promise<boolean> {
  const progressRef = doc(db, 'userProgress', `${userId}_${courseId}`);
  const progressDoc = await getDoc(progressRef);
  return progressDoc.exists();
}

// Get user's progress for a specific course
export async function getCourseProgress(userId: string, courseId: string): Promise<UserProgress | null> {
  const progressRef = doc(db, 'userProgress', `${userId}_${courseId}`);
  const progressDoc = await getDoc(progressRef);
  
  if (progressDoc.exists()) {
    return progressDoc.data() as UserProgress;
  }
  return null;
}

// Get all courses user is enrolled in
export async function getEnrolledCourses(userId: string): Promise<UserProgress[]> {
  const q = query(
    collection(db, 'userProgress'),
    where('userId', '==', userId)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as UserProgress);
}

// Mark a lesson as completed
export async function completeLesson(
  userId: string, 
  courseId: string, 
  lessonId: string,
  timeSpent: number = 0
): Promise<void> {
  const progressRef = doc(db, 'userProgress', `${userId}_${courseId}`);
  const progressDoc = await getDoc(progressRef);
  
  if (!progressDoc.exists()) {
    throw new Error('User not enrolled in this course');
  }

  const progress = progressDoc.data() as UserProgress;
  
  // Add lesson to completed list if not already there
  if (!progress.completedLessons.includes(lessonId)) {
    progress.completedLessons.push(lessonId);
    
    // Get total lessons in course to calculate percentage
    // This would need to be fetched from the course document
    // For now, we'll update it based on completed lessons
    
    await updateDoc(progressRef, {
      completedLessons: progress.completedLessons,
      currentLesson: lessonId,
      lastAccessedAt: serverTimestamp(),
      totalTimeSpent: increment(timeSpent)
    });

    // Save individual lesson progress
    const lessonProgressRef = doc(db, 'lessonProgress', `${userId}_${courseId}_${lessonId}`);
    await setDoc(lessonProgressRef, {
      userId,
      courseId,
      lessonId,
      completed: true,
      completedAt: new Date(),
      timeSpent,
      lastAccessedAt: new Date()
    });
  }
}

// Update progress percentage
export async function updateProgressPercentage(
  userId: string,
  courseId: string,
  percentage: number
): Promise<void> {
  const progressRef = doc(db, 'userProgress', `${userId}_${courseId}`);
  await updateDoc(progressRef, {
    progressPercentage: percentage,
    lastAccessedAt: serverTimestamp()
  });
}

// Mark course as completed
export async function completeCourse(userId: string, courseId: string): Promise<void> {
  const progressRef = doc(db, 'userProgress', `${userId}_${courseId}`);
  
  await updateDoc(progressRef, {
    completed: true,
    completedAt: new Date(),
    progressPercentage: 100,
    lastAccessedAt: serverTimestamp()
  });

  // Update user's total completed courses
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    coursesCompleted: increment(1)
  });
}

// Get lesson progress
export async function getLessonProgress(
  userId: string,
  courseId: string,
  lessonId: string
): Promise<LessonProgress | null> {
  const lessonProgressRef = doc(db, 'lessonProgress', `${userId}_${courseId}_${lessonId}`);
  const lessonProgressDoc = await getDoc(lessonProgressRef);
  
  if (lessonProgressDoc.exists()) {
    return lessonProgressDoc.data() as LessonProgress;
  }
  return null;
}

// Update last accessed time
export async function updateLastAccessed(userId: string, courseId: string): Promise<void> {
  const progressRef = doc(db, 'userProgress', `${userId}_${courseId}`);
  await updateDoc(progressRef, {
    lastAccessedAt: serverTimestamp()
  });
}
