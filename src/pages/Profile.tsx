import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Brain, Award, BookOpen, Target, LogOut, Mail, Trophy } from 'lucide-react';
import { getUserBadges, getBadgeProgress } from '../firebase/services/badges';
import { getEnrolledCourses } from '../firebase/services/userProgress';
import { getAssessmentStats } from '../firebase/services/assessments';

export default function Profile() {
  const { currentUser, logout } = useAuth();
  const [stats, setStats] = useState({
    totalPoints: 0,
    level: 1,
    coursesCompleted: 0,
    coursesEnrolled: 0,
    assessmentsPassed: 0,
    totalBadges: 0
  });
  const [badges, setBadges] = useState<any[]>([]);
  const [badgeProgress, setBadgeProgress] = useState<any[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      loadProfileData();
    }
  }, [currentUser]);

  const loadProfileData = async () => {
    if (!currentUser) return;

    try {
      // Load user data
      const userRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userRef);
      const userDataFromDb = userDoc.exists() ? userDoc.data() : {};

      // Load badges
      const userBadges = await getUserBadges(currentUser.uid);
      setBadges(userBadges);

      // Load badge progress
      const progress = await getBadgeProgress(currentUser.uid);
      setBadgeProgress(progress);

      // Load enrolled courses
      const enrolled = await getEnrolledCourses(currentUser.uid);
      setEnrolledCourses(enrolled);

      // Load assessment stats
      const assessmentStats = await getAssessmentStats(currentUser.uid);

      // Set stats
      setStats({
        totalPoints: userDataFromDb.totalPoints || 0,
        level: userDataFromDb.level || 1,
        coursesCompleted: userDataFromDb.coursesCompleted || 0,
        coursesEnrolled: enrolled.length,
        assessmentsPassed: assessmentStats.totalPassed,
        totalBadges: userBadges.length
      });

    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading profile...</div>
      </div>
    );
  }

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
            <Link to="/leaderboard" className="text-gray-300 hover:text-white">Leaderboard</Link>
            <button onClick={logout} className="btn btn-secondary flex items-center gap-2">
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Profile Header */}
          <div className="card mb-8">
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl font-bold">
                {currentUser?.displayName?.charAt(0).toUpperCase() || 'U'}
              </div>
              
              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-2">{currentUser?.displayName || 'User'}</h2>
                <div className="flex items-center gap-2 text-gray-400 mb-4">
                  <Mail size={16} />
                  <span>{currentUser?.email}</span>
                </div>
                
                <div className="flex gap-6">
                  <div>
                    <div className="text-2xl font-bold gradient-text">Level {stats.level}</div>
                    <div className="text-sm text-gray-400">Current Level</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-400">{stats.totalPoints}</div>
                    <div className="text-sm text-gray-400">Total Points</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center justify-between mb-2">
                <BookOpen className="text-blue-500" size={24} />
                <span className="text-2xl font-bold">{stats.coursesEnrolled}</span>
              </div>
              <p className="text-gray-400">Courses Enrolled</p>
            </div>

            <div className="card">
              <div className="flex items-center justify-between mb-2">
                <Target className="text-green-500" size={24} />
                <span className="text-2xl font-bold">{stats.coursesCompleted}</span>
              </div>
              <p className="text-gray-400">Courses Completed</p>
            </div>

            <div className="card">
              <div className="flex items-center justify-between mb-2">
                <Trophy className="text-purple-500" size={24} />
                <span className="text-2xl font-bold">{stats.assessmentsPassed}</span>
              </div>
              <p className="text-gray-400">Assessments Passed</p>
            </div>

            <div className="card">
              <div className="flex items-center justify-between mb-2">
                <Award className="text-pink-500" size={24} />
                <span className="text-2xl font-bold">{stats.totalBadges}</span>
              </div>
              <p className="text-gray-400">Badges Earned</p>
            </div>
          </div>

          {/* Badges Section */}
          <div className="card mb-8">
            <h3 className="text-2xl font-bold mb-6">Your Badges</h3>
            
            {badges.length > 0 ? (
              <div className="grid md:grid-cols-3 gap-4 mb-8">
                {badges.map((badge, idx) => (
                  <div key={idx} className="border border-yellow-500/30 bg-yellow-900/10 rounded-lg p-4">
                    <div className="text-4xl mb-2">{badge.icon || '🏆'}</div>
                    <h4 className="font-bold mb-1">{badge.badgeName}</h4>
                    <p className="text-sm text-gray-400 mb-2">{badge.description}</p>
                    <p className="text-xs text-gray-500">
                      Earned {new Date(badge.awardedAt.seconds * 1000).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 mb-8">No badges earned yet. Complete courses and assessments to earn badges!</p>
            )}

            {/* Badge Progress */}
            <h4 className="text-xl font-bold mb-4">Badge Progress</h4>
            <div className="space-y-4">
              {badgeProgress.map((badge, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <span className="font-medium">{badge.badgeName}</span>
                      {badge.earned && <span className="ml-2 text-green-400">✓ Earned</span>}
                    </div>
                    <span className="text-purple-400">{badge.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        badge.earned 
                          ? 'bg-green-500' 
                          : 'bg-gradient-to-r from-purple-500 to-pink-500'
                      }`}
                      style={{ width: `${badge.progress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">{badge.requirement}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Learning Progress */}
          <div className="card">
            <h3 className="text-2xl font-bold mb-6">Learning Progress</h3>
            
            {enrolledCourses.length > 0 ? (
              <div className="space-y-4">
                {enrolledCourses.map((course, idx) => (
                  <div key={idx} className="border border-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold mb-1">Course #{idx + 1}</h4>
                        <p className="text-sm text-gray-400">
                          Enrolled {new Date(course.enrolledAt.seconds * 1000).toLocaleDateString()}
                        </p>
                      </div>
                      {course.completed && (
                        <span className="px-3 py-1 rounded-full bg-green-900/30 text-green-400 text-sm">
                          Completed
                        </span>
                      )}
                    </div>
                    
                    <div className="mb-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Progress</span>
                        <span className="text-purple-400">{course.progressPercentage}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                          style={{ width: `${course.progressPercentage}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex gap-4 text-sm text-gray-400">
                      <span>{course.completedLessons?.length || 0} lessons completed</span>
                      <span>{course.totalTimeSpent || 0} min spent</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">
                You haven't enrolled in any courses yet.{' '}
                <Link to="/courses" className="text-purple-400 hover:text-purple-300">
                  Browse courses →
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
