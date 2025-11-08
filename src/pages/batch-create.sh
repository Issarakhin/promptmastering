#!/bin/bash

# Dashboard
cat > Dashboard.tsx << 'DASHEND'
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/config';
import { BookOpen, Trophy, Target, TrendingUp, LogOut } from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [stats, setStats] = useState({ points: 0, level: 1, coursesCompleted: 0, badges: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      // Load courses
      const coursesQuery = query(collection(db, 'courses'), orderBy('order'), limit(6));
      const coursesSnapshot = await getDocs(coursesQuery);
      setCourses(coursesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // Load user stats (mock for now)
      setStats({
        points: 150,
        level: 2,
        coursesCompleted: 2,
        badges: 3
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
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <nav className="bg-gray-900 border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold gradient-text">PromptMaster AI</h1>
          <div className="flex items-center gap-4">
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
          <h2 className="text-3xl font-bold mb-2">Welcome back, {user?.displayName || 'Learner'}!</h2>
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

        {/* Courses Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold">Your Courses</h3>
            <Link to="/courses" className="text-purple-400 hover:text-purple-300">
              View All →
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Link key={course.id} to={`/courses/${course.id}`} className="card hover:scale-105 transition">
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
      </div>
    </div>
  );
}
DASHEND

# Courses Page
cat > Courses.tsx << 'COURSESEND'
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase/config';
import { BookOpen, Clock, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Courses() {
  const [courses, setCourses] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const coursesQuery = query(collection(db, 'courses'), orderBy('order'));
      const snapshot = await getDocs(coursesQuery);
      setCourses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = filter === 'all' 
    ? courses 
    : courses.filter(c => c.difficulty === filter);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <nav className="bg-gray-900 border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold gradient-text">PromptMaster AI</h1>
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

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-4xl font-bold mb-4">All Courses</h2>
          <p className="text-gray-400 mb-6">Choose from our comprehensive curriculum</p>

          {/* Filters */}
          <div className="flex gap-4">
            <button 
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-purple-600' : 'bg-gray-800'}`}
            >
              All Courses
            </button>
            <button 
              onClick={() => setFilter('beginner')}
              className={`px-4 py-2 rounded-lg ${filter === 'beginner' ? 'bg-green-600' : 'bg-gray-800'}`}
            >
              Beginner
            </button>
            <button 
              onClick={() => setFilter('intermediate')}
              className={`px-4 py-2 rounded-lg ${filter === 'intermediate' ? 'bg-yellow-600' : 'bg-gray-800'}`}
            >
              Intermediate
            </button>
            <button 
              onClick={() => setFilter('advanced')}
              className={`px-4 py-2 rounded-lg ${filter === 'advanced' ? 'bg-red-600' : 'bg-gray-800'}`}
            >
              Advanced
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading courses...</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <Link key={course.id} to={`/courses/${course.id}`} className="card hover:scale-105 transition">
                <div className="mb-3">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    course.difficulty === 'beginner' ? 'bg-green-900/30 text-green-400' :
                    course.difficulty === 'intermediate' ? 'bg-yellow-900/30 text-yellow-400' :
                    'bg-red-900/30 text-red-400'
                  }`}>
                    {course.difficulty}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-2">{course.title}</h3>
                <p className="text-gray-400 mb-4">{course.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <Clock size={16} />
                    {course.estimatedHours}h
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen size={16} />
                    {course.category}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
COURSESEND

bash batch-create.sh
