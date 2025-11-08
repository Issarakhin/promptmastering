import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Brain, Play, CheckCircle, BookOpen, FlaskConical, ArrowLeft, ArrowRight, LogOut, Loader } from 'lucide-react';
import { getModule } from '../firebase/services/modules';
import type { Module } from '../firebase/services/modules';
import { 
  getModuleProgress, 
  startModule, 
  updateVideoProgress,
  completeTextSection,
  submitQuizAnswers,
  submitLabAnswer,
  completeModule
} from '../firebase/services/moduleProgress';
import { evaluateLabSubmission } from '../firebase/services/aiEvaluation';

export default function ModuleViewer() {
  const params = useParams<{ courseId: string; moduleId: string }>();
  const { courseId, moduleId } = params;
  
  console.log('🎯 ModuleViewer params:', params);
  console.log('🎯 courseId:', courseId, 'type:', typeof courseId);
  console.log('🎯 moduleId:', moduleId, 'type:', typeof moduleId);
  
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  const [module, setModule] = useState<Module | null>(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState<any>(null);
  
  // Lab state
  const [labSubmission, setLabSubmission] = useState('');
  const [labEvaluating, setLabEvaluating] = useState(false);
  const [labResult, setLabResult] = useState<any>(null);
  
  // Video state
  const [_videoWatchTime, setVideoWatchTime] = useState(0);

  useEffect(() => {
    if (moduleId && currentUser) {
      loadModule();
    }
  }, [moduleId, currentUser]);

  const loadModule = async () => {
    if (!courseId || !moduleId || !currentUser) return;
    
    try {
      const moduleData = await getModule(courseId, moduleId);
      if (!moduleData) {
        alert('Module not found');
        navigate('/courses');
        return;
      }
      
      setModule(moduleData);
      
      // Start module if not started (use courseId from URL params)
      console.log('🚨 About to call startModule with:', { userId: currentUser.uid, moduleId, courseId });
      
      if (!courseId) {
        console.error('❌ courseId is undefined! Cannot start module.');
        alert('Error: Course ID is missing from URL');
        return;
      }
      
      await startModule(currentUser.uid, courseId, moduleId);
      
      // Load progress
      const progressData = await getModuleProgress(currentUser.uid, courseId, moduleId);
      setProgress(progressData);
      
      // Initialize quiz answers if needed
      const currentSection = moduleData.sections[currentSectionIndex];
      if (currentSection?.type === 'quiz' && currentSection.questions) {
        setQuizAnswers(new Array(currentSection.questions.length).fill(-1));
      }
      
    } catch (error) {
      console.error('Error loading module:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNextSection = () => {
    if (module && currentSectionIndex < module.sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
      setQuizSubmitted(false);
      setQuizResult(null);
      setLabResult(null);
      setLabSubmission('');
    }
  };

  const handlePreviousSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
    }
  };

  const handleCompleteModule = async () => {
    if (!currentUser || !courseId || !moduleId) return;
    
    try {
      await completeModule(currentUser.uid, courseId, moduleId);
      // Navigate back to course page
      window.location.href = `/courses/${courseId}`;
    } catch (error) {
      console.error('Error completing module:', error);
      alert('Failed to complete module');
    }
  };

  const handleCompleteText = async () => {
    if (!currentUser || !courseId || !moduleId) return;
    await completeTextSection(currentUser.uid, courseId, moduleId, currentSectionIndex);
    await loadModule();
  };

  const handleVideoProgress = async (watchTime: number) => {
    if (!currentUser || !moduleId || !module) return;
    const section = module.sections[currentSectionIndex];
    if (section.type === 'video' && section.videoDuration) {
      await updateVideoProgress(currentUser.uid, courseId!, moduleId, currentSectionIndex, watchTime, section.videoDuration);
      await loadModule();
    }
  };

  const handleQuizSubmit = async () => {
    if (!currentUser || !moduleId || !module) return;
    
    const section = module.sections[currentSectionIndex];
    if (section.type !== 'quiz' || !section.questions) return;
    
    const correctAnswers = section.questions.map(q => q.correctAnswer);
    const points = section.questions.map(q => q.points);
    
    const result = await submitQuizAnswers(
      currentUser.uid,
      courseId!,
      moduleId,
      currentSectionIndex,
      quizAnswers,
      correctAnswers,
      points
    );
    
    setQuizResult(result);
    setQuizSubmitted(true);
    await loadModule();
  };

  const handleLabSubmit = async () => {
    if (!currentUser || !moduleId || !module || !labSubmission.trim()) return;
    
    const section = module.sections[currentSectionIndex];
    if (section.type !== 'lab') return;
    
    setLabEvaluating(true);
    
    try {
      const evaluation = await evaluateLabSubmission(
        labSubmission,
        section.labExpectedKeywords || [],
        section.labPrompt || '',
        section.labPassingScore || 70
      );
      
      await submitLabAnswer(
        currentUser.uid,
        courseId!,
        moduleId,
        currentSectionIndex,
        labSubmission,
        evaluation,
        section.labPoints || 50
      );
      
      setLabResult(evaluation);
      await loadModule();
    } catch (error) {
      console.error('Error evaluating lab:', error);
      alert('Failed to evaluate lab submission');
    } finally {
      setLabEvaluating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin text-purple-400" size={48} />
      </div>
    );
  }

  if (!module) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">Module not found</p>
          <Link to="/courses" className="btn btn-primary">Back to Courses</Link>
        </div>
      </div>
    );
  }

  const currentSection = module.sections[currentSectionIndex];
  const sectionProgress = progress?.sectionProgress?.[currentSectionIndex];
  const isSectionComplete = sectionProgress?.completed || false;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <nav className="bg-gray-900 border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Brain className="text-purple-400" size={32} />
              <div>
                <h1 className="text-xl font-bold">{module.title}</h1>
                <p className="text-sm text-gray-400">
                  Section {currentSectionIndex + 1} of {module.sections.length}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link to={`/courses/${courseId}`} className="text-gray-300 hover:text-white">
                <ArrowLeft size={20} />
              </Link>
              <button onClick={logout} className="btn btn-secondary flex items-center gap-2">
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                style={{ width: `${progress?.percentageComplete || 0}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-400 mt-1">{progress?.percentageComplete || 0}% Complete</p>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Section Content */}
          <div className="card mb-6">
            {/* Video Section */}
            {currentSection.type === 'video' && (
              <div>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Play className="text-purple-400" />
                  {currentSection.videoTitle || 'Video Lesson'}
                </h2>
                
                <div className="aspect-video bg-gray-800 rounded-lg mb-4 flex items-center justify-center">
                  {currentSection.videoUrl ? (
                    <iframe
                      src={currentSection.videoUrl}
                      className="w-full h-full rounded-lg"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      onLoad={() => {
                        // Simulate video progress tracking
                        const interval = setInterval(() => {
                          setVideoWatchTime((prev: number) => {
                            const newTime = prev + 1;
                            if (newTime % 10 === 0) { // Update every 10 seconds
                              handleVideoProgress(newTime);
                            }
                            return newTime;
                          });
                        }, 1000);
                        
                        return () => clearInterval(interval);
                      }}
                    ></iframe>
                  ) : (
                    <p className="text-gray-400">Video URL not available</p>
                  )}
                </div>
                
                {isSectionComplete && (
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle size={20} />
                    <span>Video completed</span>
                  </div>
                )}
              </div>
            )}

            {/* Text Section */}
            {currentSection.type === 'text' && (
              <div>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <BookOpen className="text-purple-400" />
                  {currentSection.textTitle || 'Reading Material'}
                </h2>
                
                <div className="prose prose-invert max-w-none mb-6">
                  <div dangerouslySetInnerHTML={{ __html: currentSection.textContent || '' }} />
                </div>
                
                {!isSectionComplete && (
                  <button onClick={handleCompleteText} className="btn btn-primary">
                    Mark as Read
                  </button>
                )}
                
                {isSectionComplete && (
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle size={20} />
                    <span>Reading completed</span>
                  </div>
                )}
              </div>
            )}

            {/* Quiz Section */}
            {currentSection.type === 'quiz' && currentSection.questions && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Knowledge Check</h2>
                
                {!quizSubmitted ? (
                  <div className="space-y-6">
                    {currentSection.questions.map((question, qIdx) => (
                      <div key={qIdx} className="border border-gray-700 rounded-lg p-4">
                        <p className="font-bold mb-3">{qIdx + 1}. {question.question}</p>
                        <div className="space-y-2">
                          {question.options.map((option, oIdx) => (
                            <button
                              key={oIdx}
                              onClick={() => {
                                const newAnswers = [...quizAnswers];
                                newAnswers[qIdx] = oIdx;
                                setQuizAnswers(newAnswers);
                              }}
                              className={`w-full text-left p-3 rounded-lg border-2 transition ${
                                quizAnswers[qIdx] === oIdx
                                  ? 'border-purple-500 bg-purple-900/20'
                                  : 'border-gray-700 hover:border-gray-600'
                              }`}
                            >
                              {String.fromCharCode(65 + oIdx)}. {option}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                    
                    <button
                      onClick={handleQuizSubmit}
                      disabled={quizAnswers.includes(-1)}
                      className="btn btn-primary w-full"
                    >
                      Submit Quiz
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className={`text-6xl mb-4 ${quizResult?.passed ? 'text-green-400' : 'text-yellow-400'}`}>
                      {quizResult?.passed ? '✓' : '!'}
                    </div>
                    <h3 className="text-2xl font-bold mb-2">
                      {quizResult?.passed ? 'Great Job!' : 'Keep Learning!'}
                    </h3>
                    <p className="text-gray-400 mb-4">
                      You scored {quizResult?.score} points
                    </p>
                    {quizResult?.passed && (
                      <div className="flex items-center justify-center gap-2 text-green-400">
                        <CheckCircle size={20} />
                        <span>Quiz passed</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Lab Section */}
            {currentSection.type === 'lab' && (
              <div>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <FlaskConical className="text-purple-400" />
                  {currentSection.labTitle || 'Practice Lab'}
                </h2>
                
                <div className="mb-6">
                  <h3 className="font-bold mb-2">Instructions:</h3>
                  <p className="text-gray-300 mb-4">{currentSection.labDescription}</p>
                  <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                    <p className="font-medium">{currentSection.labPrompt}</p>
                  </div>
                </div>
                
                {currentSection.labHints && currentSection.labHints.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-bold mb-2">Hints:</h3>
                    <ul className="list-disc list-inside text-gray-400 space-y-1">
                      {currentSection.labHints.map((hint, idx) => (
                        <li key={idx}>{hint}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {!labResult ? (
                  <div>
                    <textarea
                      value={labSubmission}
                      onChange={(e) => setLabSubmission(e.target.value)}
                      placeholder="Write your answer here..."
                      className="w-full h-48 p-4 bg-gray-800 border border-gray-700 rounded-lg resize-none"
                    />
                    <button
                      onClick={handleLabSubmit}
                      disabled={!labSubmission.trim() || labEvaluating}
                      className="btn btn-primary w-full mt-4 flex items-center justify-center gap-2"
                    >
                      {labEvaluating ? (
                        <>
                          <Loader className="animate-spin" size={20} />
                          Evaluating...
                        </>
                      ) : (
                        'Submit Lab'
                      )}
                    </button>
                  </div>
                ) : (
                  <div className={`rounded-lg p-6 ${
                    labResult.passed 
                      ? 'bg-green-900/20 border border-green-500/30' 
                      : 'bg-yellow-900/20 border border-yellow-500/30'
                  }`}>
                    <h3 className="text-2xl font-bold mb-2">Score: {labResult.score}/100</h3>
                    <p className="mb-4">{labResult.feedback}</p>
                    
                    {labResult.strengths.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-bold mb-2 text-green-400">Strengths:</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {labResult.strengths.map((s: string, idx: number) => (
                            <li key={idx}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {labResult.improvements.length > 0 && (
                      <div>
                        <h4 className="font-bold mb-2 text-yellow-400">Areas for Improvement:</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {labResult.improvements.map((i: string, idx: number) => (
                            <li key={idx}>{i}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {labResult.passed && (
                      <div className="flex items-center gap-2 text-green-400 mt-4">
                        <CheckCircle size={20} />
                        <span>Lab completed successfully!</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={handlePreviousSection}
              disabled={currentSectionIndex === 0}
              className="btn btn-secondary flex items-center gap-2"
            >
              <ArrowLeft size={20} />
              Previous
            </button>
            
            {currentSectionIndex < module.sections.length - 1 ? (
              <button
                onClick={handleNextSection}
                className="btn btn-primary flex items-center gap-2"
              >
                Next
                <ArrowRight size={20} />
              </button>
            ) : (
              <button
                onClick={handleCompleteModule}
                className="btn btn-primary flex items-center gap-2"
              >
                <CheckCircle size={20} />
                Complete Module
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
