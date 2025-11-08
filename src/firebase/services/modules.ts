import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  setDoc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../config';

export interface ModuleSection {
  type: 'video' | 'text' | 'quiz' | 'lab';
  order: number;
  
  // Video section
  videoUrl?: string;
  videoTitle?: string;
  videoDuration?: number; // seconds
  
  // Text section
  textContent?: string; // Markdown supported
  textTitle?: string;
  
  // Quiz section
  questions?: QuizQuestion[];
  
  // Lab section
  labTitle?: string;
  labDescription?: string;
  labPrompt?: string;
  labHints?: string[];
  labExpectedKeywords?: string[];
  labPassingScore?: number;
  labPoints?: number;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  points: number;
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  duration: number; // estimated minutes
  sections: ModuleSection[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Get a single module by ID from subcollection
export async function getModule(courseId: string, moduleId: string): Promise<Module | null> {
  console.log('🔍 getModule called with:', { courseId, moduleId });
  console.log('🔍 Path:', `courses/${courseId}/modules/${moduleId}`);
  
  const moduleRef = doc(db, 'courses', courseId, 'modules', moduleId);
  const moduleDoc = await getDoc(moduleRef);
  
  console.log('🔍 Module exists?', moduleDoc.exists());
  
  if (moduleDoc.exists()) {
    const data = { id: moduleDoc.id, ...moduleDoc.data() };
    console.log('✅ Module data:', data);
    return data as Module;
  }
  
  console.warn('❌ Module not found in Firestore');
  return null;
}

// Get all modules for a course
export async function getCourseModules(courseId: string): Promise<Module[]> {
  const q = query(
    collection(db, 'modules'),
    where('courseId', '==', courseId),
    orderBy('order', 'asc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Module));
}

// Get all modules
export async function getAllModules(): Promise<Module[]> {
  const snapshot = await getDocs(collection(db, 'modules'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Module));
}

// Create a new module
export async function createModule(module: Omit<Module, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const moduleRef = doc(collection(db, 'modules'));
  const moduleData = {
    ...module,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  await setDoc(moduleRef, moduleData);
  return moduleRef.id;
}

// Update an existing module
export async function updateModule(moduleId: string, updates: Partial<Module>): Promise<void> {
  const moduleRef = doc(db, 'modules', moduleId);
  await updateDoc(moduleRef, {
    ...updates,
    updatedAt: new Date()
  });
}

// Delete a module
export async function deleteModule(moduleId: string): Promise<void> {
  const moduleRef = doc(db, 'modules', moduleId);
  await deleteDoc(moduleRef);
}

// Get module statistics
export async function getModuleStats(courseId: string, moduleId: string): Promise<{
  totalSections: number;
  videoCount: number;
  textCount: number;
  quizCount: number;
  labCount: number;
  totalPoints: number;
}> {
  const module = await getModule(courseId, moduleId);
  
  if (!module) {
    return {
      totalSections: 0,
      videoCount: 0,
      textCount: 0,
      quizCount: 0,
      labCount: 0,
      totalPoints: 0
    };
  }
  
  const stats = {
    totalSections: module.sections.length,
    videoCount: 0,
    textCount: 0,
    quizCount: 0,
    labCount: 0,
    totalPoints: 0
  };
  
  module.sections.forEach(section => {
    switch (section.type) {
      case 'video':
        stats.videoCount++;
        break;
      case 'text':
        stats.textCount++;
        break;
      case 'quiz':
        stats.quizCount++;
        if (section.questions) {
          stats.totalPoints += section.questions.reduce((sum, q) => sum + q.points, 0);
        }
        break;
      case 'lab':
        stats.labCount++;
        stats.totalPoints += section.labPoints || 0;
        break;
    }
  });
  
  return stats;
}

// Validate module structure
export function validateModule(module: Partial<Module>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!module.courseId) errors.push('Course ID is required');
  if (!module.title) errors.push('Title is required');
  if (!module.description) errors.push('Description is required');
  if (module.order === undefined || module.order < 1) errors.push('Order must be >= 1');
  if (!module.duration || module.duration < 1) errors.push('Duration must be >= 1');
  
  if (!module.sections || module.sections.length === 0) {
    errors.push('At least one section is required');
  } else {
    module.sections.forEach((section, idx) => {
      if (!section.type) {
        errors.push(`Section ${idx + 1}: Type is required`);
      }
      
      if (section.type === 'video' && !section.videoUrl) {
        errors.push(`Section ${idx + 1}: Video URL is required`);
      }
      
      if (section.type === 'text' && !section.textContent) {
        errors.push(`Section ${idx + 1}: Text content is required`);
      }
      
      if (section.type === 'quiz' && (!section.questions || section.questions.length === 0)) {
        errors.push(`Section ${idx + 1}: At least one question is required`);
      }
      
      if (section.type === 'lab') {
        if (!section.labPrompt) errors.push(`Section ${idx + 1}: Lab prompt is required`);
        if (!section.labExpectedKeywords || section.labExpectedKeywords.length === 0) {
          errors.push(`Section ${idx + 1}: Lab expected keywords are required`);
        }
      }
    });
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
