import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, orderBy, limit, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { getEnrolledCourses } from '../firebase/services/userProgress';
import { getAssessmentStats } from '../firebase/services/assessments';
import { getUserBadges } from '../firebase/services/badges';
import { Brain, BookOpen, Trophy, Target, TrendingUp, LogOut } from 'lucide-react';

export default function Dashboard() {
  const { currentUser, userData, logout } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [stats, setStats] = useState({ 
    points: 0, 
    level: 1, 
    coursesCompleted: 0, 
    badges: 0,
    assessmentsPassed: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      loadDashboardData();
    }
  }, [currentUser]);

  const loadDashboardData = async () => {
    if (!currentUser) return;

    try {
      // Load user data
      const userRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userRef);
      const userDataFromDb = userDoc.exists() ? userDoc.data() : {};

      // Load enrolled courses with progress
      const enrolledProgress = await getEnrolledCourses(currentUser.uid);
      const enrolledCoursesData = await Promise.all(
        enrolledProgress.map(async (progress) => {
          const courseRef = doc(db, 'courses', progress.courseId);
          const courseDoc = await getDoc(courseRef);
          return {
            id: progress.courseId,
            ...courseDoc.data(),
            progress: progress.progressPercentage,
            completed: progress.completed
          };
        })
      );
      setEnrolledCourses(enrolledCoursesData);

      // Load recommended courses (not enrolled yet)
      const coursesQuery = query(
        collection(db, 'courses'),
        orderBy('order'),
        limit(6)
      );
      const coursesSnapshot = await getDocs(coursesQuery);
      const allCourses = coursesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Filter out enrolled courses
      const enrolledIds = enrolledProgress.map(p => p.courseId);
      const recommendedCourses = allCourses.filter(c => !enrolledIds.includes(c.id));
      setCourses(recommendedCourses);

      // Load assessment stats
      const assessmentStats = await getAssessmentStats(currentUser.uid);

      // Load badges
      const userBadges = await getUserBadges(currentUser.uid);

      // Set stats
      setStats({
        points: userDataFromDb.totalPoints || 0,
        level: userDataFromDb.level || 1,
        coursesCompleted: userDataFromDb.coursesCompleted || 0,
        badges: userBadges.length,
        assessmentsPassed: assessmentStats.totalPassed
      });

    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading your dashboard...</div>
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
            <Link to="/courses" className="text-gray-300 hover:text-white">All Courses</Link>
            <Link to="/assessment" className="text-gray-300 hover:text-white">Assessments</Link>
            <Link to="/profile" className="text-gray-300 hover:text-white">Profile</Link>
            <Link to="/leaderboard" className="text-gray-300 hover:text-white">Leaderboard</Link>
            <button onClick={logout} className="btn btn-secondary flex items-center gap-2">
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Welcome back, {currentUser?.displayName || 'Learner'}!
          </h2>
          <p className="text-gray-400">Continue your learning journey</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <Trophy className="text-yellow-500" size={24} />
              <span className="text-2xl font-bold">{stats.points}</span>
            </div>
            <p className="text-gray-400">Total Points</p>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="text-purple-500" size={24} />
              <span className="text-2xl font-bold">Level {stats.level}</span>
            </div>
            <p className="text-gray-400">Current Level</p>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <BookOpen className="text-blue-500" size={24} />
              <span className="text-2xl font-bold">{stats.coursesCompleted}</span>
            </div>
            <p className="text-gray-400">Courses Completed</p>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <Target className="text-pink-500" size={24} />
              <span className="text-2xl font-bold">{stats.badges}</span>
            </div>
            <p className="text-gray-400">Badges Earned</p>
          </div>
        </div>

        {/* Enrolled Courses */}
        {enrolledCourses.length > 0 && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">Continue Learning</h3>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {enrolledCourses.map((course) => (
                <Link 
                  key={course.id} 
                  to={`/courses/${course.id}`} 
                  className="card hover:scale-105 transition"
                >
                  <div className="mb-3">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      course.difficulty === 'beginner' ? 'bg-green-900/30 text-green-400' :
                      course.difficulty === 'intermediate' ? 'bg-yellow-900/30 text-yellow-400' :
                      'bg-red-900/30 text-red-400'
                    }`}>
                      {course.difficulty}
                    </span>
                  </div>
                  <h4 className="text-xl font-bold mb-2">{course.title}</h4>
                  <p className="text-gray-400 mb-4 text-sm">{course.description}</p>
                  
                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Progress</span>
                      <span className="text-purple-400">{course.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {course.completed && (
                    <div className="text-green-400 text-sm flex items-center gap-1">
                      <Trophy size={16} />
                      Completed!
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recommended Courses */}
        {courses.length > 0 && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">Recommended Courses</h3>
              <Link to="/courses" className="text-purple-400 hover:text-purple-300">
                View All →
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {courses.map((course) => (
                <Link 
                  key={course.id} 
                  to={`/courses/${course.id}`} 
                  className="card hover:scale-105 transition"
                >
                  <div className="mb-3">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      course.difficulty === 'beginner' ? 'bg-green-900/30 text-green-400' :
                      course.difficulty === 'intermediate' ? 'bg-yellow-900/30 text-yellow-400' :
                      'bg-red-900/30 text-red-400'
                    }`}>
                      {course.difficulty}
                    </span>
                  </div>
                  <h4 className="text-xl font-bold mb-2">{course.title}</h4>
                  <p className="text-gray-400 mb-4">{course.description}</p>
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>{course.estimatedHours} hours</span>
                    <span>{course.category}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Link to="/assessment" className="card hover:scale-105 transition">
            <h4 className="text-xl font-bold mb-2">Take an Assessment</h4>
            <p className="text-gray-400 mb-4">Test your knowledge and earn points</p>
            <div className="text-purple-400">Start Now →</div>
          </Link>

          <Link to="/profile" className="card hover:scale-105 transition">
            <h4 className="text-xl font-bold mb-2">View Your Progress</h4>
            <p className="text-gray-400 mb-4">Check your badges and achievements</p>
            <div className="text-purple-400">View Profile →</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
