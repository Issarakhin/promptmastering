import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Brain, CheckCircle, XCircle, Clock, Trophy, LogOut } from 'lucide-react';
import { submitAssessment, getAllAssessments, getUserAssessmentResults } from '../firebase/services/assessments';

export default function Assessment() {
  const { currentUser, logout } = useAuth();
  const [assessments, setAssessments] = useState<any[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [userResults, setUserResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [startTime, setStartTime] = useState<Date | null>(null);

  useEffect(() => {
    if (currentUser) {
      loadAssessments();
      loadUserResults();
    }
  }, [currentUser]);

  const loadAssessments = async () => {
    try {
      const allAssessments = await getAllAssessments();
      setAssessments(allAssessments);
    } catch (error) {
      console.error('Error loading assessments:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserResults = async () => {
    if (!currentUser) return;
    try {
      const results = await getUserAssessmentResults(currentUser.uid);
      setUserResults(results);
    } catch (error) {
      console.error('Error loading user results:', error);
    }
  };

  const startAssessment = (assessment: any) => {
    setSelectedAssessment(assessment);
    setCurrentQuestion(0);
    setAnswers(new Array(assessment.questions.length).fill(-1));
    setShowResults(false);
    setStartTime(new Date());
  };

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < selectedAssessment.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    if (!currentUser || !selectedAssessment || !startTime) return;

    // Calculate results
    let correctCount = 0;
    const answerDetails = selectedAssessment.questions.map((q: any, idx: number) => {
      const correct = answers[idx] === q.correctAnswer;
      if (correct) correctCount++;
      return {
        questionId: idx,
        selectedAnswer: answers[idx],
        correct
      };
    });

    const score = Math.round((correctCount / selectedAssessment.questions.length) * 100);
    const passed = score >= selectedAssessment.passingScore;
    const timeSpent = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);

    const result = {
      userId: currentUser.uid,
      assessmentId: selectedAssessment.id,
      score,
      totalQuestions: selectedAssessment.questions.length,
      correctAnswers: correctCount,
      passed,
      timeSpent,
      answers: answerDetails,
      completedAt: new Date()
    };

    try {
      await submitAssessment(result);
      setResults(result);
      setShowResults(true);
      await loadUserResults();
    } catch (error) {
      console.error('Error submitting assessment:', error);
      alert('Failed to submit assessment');
    }
  };

  const backToList = () => {
    setSelectedAssessment(null);
    setShowResults(false);
    setResults(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading assessments...</div>
      </div>
    );
  }

  // Results View
  if (showResults && results) {
    return (
      <div className="min-h-screen">
        <nav className="bg-gray-900 border-b border-gray-800">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Brain className="text-purple-400" size={32} />
              <h1 className="text-2xl font-bold gradient-text">PromptMaster AI</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="text-gray-300 hover:text-white">Dashboard</Link>
              <button onClick={logout} className="btn btn-secondary flex items-center gap-2">
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </nav>

        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto">
            <div className="card text-center">
              {results.passed ? (
                <CheckCircle className="text-green-400 mx-auto mb-4" size={64} />
              ) : (
                <XCircle className="text-red-400 mx-auto mb-4" size={64} />
              )}

              <h2 className="text-3xl font-bold mb-2">
                {results.passed ? 'Congratulations!' : 'Keep Learning!'}
              </h2>
              
              <p className="text-gray-400 mb-8">
                {results.passed 
                  ? 'You passed the assessment!' 
                  : 'You can try again to improve your score.'}
              </p>

              <div className="grid grid-cols-3 gap-6 mb-8">
                <div>
                  <div className="text-4xl font-bold gradient-text mb-2">{results.score}%</div>
                  <div className="text-gray-400">Score</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-green-400 mb-2">{results.correctAnswers}</div>
                  <div className="text-gray-400">Correct</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-purple-400 mb-2">{results.score * 10}</div>
                  <div className="text-gray-400">Points Earned</div>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <button onClick={backToList} className="btn btn-primary">
                  Back to Assessments
                </button>
                <Link to="/dashboard" className="btn btn-secondary">
                  Go to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Assessment Taking View
  if (selectedAssessment && !showResults) {
    const question = selectedAssessment.questions[currentQuestion];
    const allAnswered = answers.every((a: number) => a !== -1);

    return (
      <div className="min-h-screen">
        <nav className="bg-gray-900 border-b border-gray-800">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Brain className="text-purple-400" size={32} />
              <h1 className="text-2xl font-bold gradient-text">PromptMaster AI</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-400">
                Question {currentQuestion + 1} of {selectedAssessment.questions.length}
              </span>
            </div>
          </div>
        </nav>

        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
            <div className="card mb-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">{selectedAssessment.title}</h2>
                <div className="flex items-center gap-2 text-gray-400">
                  <Clock size={20} />
                  <span>{selectedAssessment.timeLimit} min</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-8">
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                    style={{ width: `${((currentQuestion + 1) / selectedAssessment.questions.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Question */}
              <h3 className="text-xl font-bold mb-6">{question.question}</h3>

              {/* Options */}
              <div className="space-y-3 mb-8">
                {question.options.map((option: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition ${
                      answers[currentQuestion] === idx
                        ? 'border-purple-500 bg-purple-900/20'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <span className="font-medium">{String.fromCharCode(65 + idx)}.</span> {option}
                  </button>
                ))}
              </div>

              {/* Navigation */}
              <div className="flex justify-between">
                <button
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0}
                  className="btn btn-secondary"
                >
                  Previous
                </button>

                {currentQuestion === selectedAssessment.questions.length - 1 ? (
                  <button
                    onClick={handleSubmit}
                    disabled={!allAnswered}
                    className="btn btn-primary"
                  >
                    Submit Assessment
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="btn btn-primary"
                  >
                    Next
                  </button>
                )}
              </div>
            </div>

            {/* Question Navigator */}
            <div className="card">
              <h4 className="font-bold mb-4">Questions</h4>
              <div className="grid grid-cols-10 gap-2">
                {selectedAssessment.questions.map((_: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentQuestion(idx)}
                    className={`w-10 h-10 rounded-lg font-medium ${
                      idx === currentQuestion
                        ? 'bg-purple-500 text-white'
                        : answers[idx] !== -1
                        ? 'bg-green-900/30 text-green-400 border border-green-500/30'
                        : 'bg-gray-700 text-gray-400'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Assessment List View
  return (
    <div className="min-h-screen">
      <nav className="bg-gray-900 border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Brain className="text-purple-400" size={32} />
            <h1 className="text-2xl font-bold gradient-text">PromptMaster AI</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-gray-300 hover:text-white">Dashboard</Link>
            <Link to="/profile" className="text-gray-300 hover:text-white">Profile</Link>
            <button onClick={logout} className="btn btn-secondary flex items-center gap-2">
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8">Assessments</h2>

        {/* Assessment Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {assessments.map((assessment) => {
            const userAttempts = userResults.filter(r => r.assessmentId === assessment.id);
            const bestScore = userAttempts.length > 0 
              ? Math.max(...userAttempts.map(r => r.score)) 
              : null;

            return (
              <div key={assessment.id} className="card">
                <div className="mb-3">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    assessment.difficulty === 'beginner' ? 'bg-green-900/30 text-green-400' :
                    assessment.difficulty === 'intermediate' ? 'bg-yellow-900/30 text-yellow-400' :
                    'bg-red-900/30 text-red-400'
                  }`}>
                    {assessment.difficulty}
                  </span>
                </div>

                <h3 className="text-xl font-bold mb-2">{assessment.title}</h3>
                <p className="text-gray-400 mb-4">{assessment.description}</p>

                <div className="flex gap-4 text-sm text-gray-400 mb-4">
                  <span className="flex items-center gap-1">
                    <Clock size={16} />
                    {assessment.timeLimit} min
                  </span>
                  <span>{assessment.questions?.length || 0} questions</span>
                  <span>Pass: {assessment.passingScore}%</span>
                </div>

                {bestScore !== null && (
                  <div className="mb-4 flex items-center gap-2 text-sm">
                    <Trophy className="text-yellow-400" size={16} />
                    <span className="text-gray-400">Best Score:</span>
                    <span className="font-bold text-purple-400">{bestScore}%</span>
                  </div>
                )}

                <button
                  onClick={() => startAssessment(assessment)}
                  className="btn btn-primary w-full"
                >
                  {bestScore !== null ? 'Retake Assessment' : 'Start Assessment'}
                </button>
              </div>
            );
          })}
        </div>

        {/* Recent Results */}
        {userResults.length > 0 && (
          <div className="card">
            <h3 className="text-2xl font-bold mb-6">Your Recent Results</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4">Assessment</th>
                    <th className="text-left py-3 px-4">Score</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {userResults.slice(0, 5).map((result, idx) => {
                    const assessment = assessments.find(a => a.id === result.assessmentId);
                    return (
                      <tr key={idx} className="border-b border-gray-800">
                        <td className="py-3 px-4">{assessment?.title || 'Unknown'}</td>
                        <td className="py-3 px-4 font-bold">{result.score}%</td>
                        <td className="py-3 px-4">
                          {result.passed ? (
                            <span className="text-green-400">Passed</span>
                          ) : (
                            <span className="text-red-400">Failed</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-gray-400">
                          {new Date(result.completedAt.seconds * 1000).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
