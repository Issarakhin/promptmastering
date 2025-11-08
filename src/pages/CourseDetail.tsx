import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Brain, Clock, BookOpen, Target, ArrowLeft, LogOut, CheckCircle, PlayCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  enrollInCourse,
  isEnrolled,
  getCourseProgress
} from '../firebase/services/userProgress';

export default function CourseDetail() {
  const { id } = useParams();
  const { currentUser, logout } = useAuth();
  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [enrolled, setEnrolled] = useState(false);
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    if (id && currentUser) {
      loadCourseData();
    }
  }, [id, currentUser]);

  const loadCourseData = async () => {
    if (!id || !currentUser) return;

    try {
      // Load course
      const courseDoc = await getDoc(doc(db, 'courses', id));
      if (courseDoc.exists()) {
        setCourse({ id: courseDoc.id, ...courseDoc.data() });
      }

      // Load modules from subcollection
      console.log('🔍 DEBUG: Loading modules from subcollection');
      console.log('🔍 Course ID:', id);
      console.log('🔍 Path: courses/' + id + '/modules');
      
      try {
        // Get modules subcollection from this course
        const modulesRef = collection(db, 'courses', id, 'modules');
        const modulesSnapshot = await getDocs(modulesRef);
        console.log('📦 Modules found in subcollection:', modulesSnapshot.docs.length);
        
        const modulesData = modulesSnapshot.docs.map(doc => {
          const data = doc.data();
          console.log('📄 Module:', doc.id, '| sections:', data.sections?.length || 0);
          return { id: doc.id, ...data };
        });
        console.log('📚 Total module data:', modulesData.length);
        
        modulesData.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
        setModules(modulesData);
        console.log('✅ Modules set to state:', modulesData.length);
      } catch (error: any) {
        console.error('❌ Error loading modules:', error);
        console.error('❌ Error message:', error?.message);
      }

      // Check enrollment and load progress
      const isUserEnrolled = await isEnrolled(currentUser.uid, id);
      setEnrolled(isUserEnrolled);

      if (isUserEnrolled) {
        const userProgress = await getCourseProgress(currentUser.uid, id);
        setProgress(userProgress);
      }

    } catch (error) {
      console.error('Error loading course:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!currentUser || !id) return;

    try {
      setEnrolling(true);
      await enrollInCourse(currentUser.uid, id);
      setEnrolled(true);
      await loadCourseData(); // Reload to get progress
    } catch (error) {
      console.error('Error enrolling:', error);
      alert('Failed to enroll in course');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading course...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Course not found</h2>
          <Link to="/courses" className="btn btn-primary">Back to Courses</Link>
        </div>
      </div>
    );
  }

  const isLessonCompleted = (lessonId: string) => {
    return progress?.completedLessons.includes(lessonId) || false;
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <nav className="bg-gray-900 border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Brain className="text-purple-400" size={32} />
            <h1 className="text-2xl font-bold gradient-text">PromptMaster AI</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-gray-300 hover:text-white">Dashboard</Link>
            <Link to="/courses" className="text-gray-300 hover:text-white">Courses</Link>
            <button onClick={logout} className="btn btn-secondary flex items-center gap-2">
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        <Link to="/courses" className="flex items-center gap-2 text-gray-400 hover:text-white mb-8">
          <ArrowLeft size={20} />
          Back to Courses
        </Link>

        <div className="max-w-4xl mx-auto">
          {/* Course Header */}
          <div className="card mb-8">
            <div className="mb-4">
              <span className={`px-3 py-1 rounded-full text-sm ${
                course.difficulty === 'beginner' ? 'bg-green-900/30 text-green-400' :
                course.difficulty === 'intermediate' ? 'bg-yellow-900/30 text-yellow-400' :
                'bg-red-900/30 text-red-400'
              }`}>
                {course.difficulty}
              </span>
            </div>

            <h2 className="text-4xl font-bold mb-4">{course.title}</h2>
            <p className="text-xl text-gray-400 mb-6">{course.description}</p>

            <div className="flex gap-6 mb-6 text-gray-400">
              <div className="flex items-center gap-2">
                <Clock size={20} />
                <span>{course.estimatedHours} hours</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen size={20} />
                <span>{modules.length} lessons</span>
              </div>
              <div className="flex items-center gap-2">
                <Target size={20} />
                <span>{course.category}</span>
              </div>
            </div>

            {/* Progress Bar (if enrolled) */}
            {enrolled && progress && (
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Your Progress</span>
                  <span className="text-purple-400">{progress.progressPercentage}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all"
                    style={{ width: `${progress.progressPercentage}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Enroll Button */}
            {!enrolled ? (
              <button 
                onClick={handleEnroll} 
                disabled={enrolling}
                className="btn btn-primary w-full"
              >
                {enrolling ? 'Enrolling...' : 'Enroll in Course'}
              </button>
            ) : progress?.completed ? (
              <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 flex items-center gap-3">
                <CheckCircle className="text-green-400" size={24} />
                <div>
                  <div className="font-bold text-green-400">Course Completed!</div>
                  <div className="text-sm text-gray-400">Congratulations on finishing this course</div>
                </div>
              </div>
            ) : (
              <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                <div className="text-purple-400 font-medium">You're enrolled in this course</div>
                <div className="text-sm text-gray-400">Continue learning below</div>
              </div>
            )}
          </div>

          {/* Course Content */}
          <div className="card">
            <h3 className="text-2xl font-bold mb-6">Course Content</h3>

            {modules.length > 0 ? (
              <div className="space-y-4">
                {modules.map((module, index) => {
                  const completed = isLessonCompleted(module.id);
                  return (
                    <div 
                      key={module.id} 
                      className={`border rounded-lg p-4 transition ${
                        completed 
                          ? 'border-green-500/30 bg-green-900/10' 
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-gray-400 font-mono text-sm">
                              Lesson {index + 1}
                            </span>
                            {completed && (
                              <CheckCircle className="text-green-400" size={20} />
                            )}
                          </div>
                          <h4 className="text-lg font-bold mb-2">{module.title}</h4>
                          <p className="text-gray-400 text-sm mb-3">{module.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                              <Clock size={16} />
                              {module.duration} min
                            </span>
                            {module.sections && module.sections.length > 0 && (
                              <span className="flex items-center gap-1">
                                <BookOpen size={16} />
                                {module.sections.length} sections
                              </span>
                            )}
                          </div>
                        </div>

                        {enrolled && (
                          <Link
                            to={`/courses/${id}/modules/${module.id}`}
                            className="btn btn-primary flex items-center gap-2"
                          >
                            <PlayCircle size={16} />
                            {completed ? 'Review' : 'Start'}
                          </Link>
                        )}
                      </div>

                      {completed && (
                        <div className="mt-3 pt-3 border-t border-green-500/20 text-sm text-green-400">
                          ✓ Completed
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-400">No lessons available yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
