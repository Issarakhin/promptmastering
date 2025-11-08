#!/bin/bash

# Profile Page
cat > Profile.tsx << 'PROFILEEND'
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { User, Award, BookOpen, Target, LogOut, Mail } from 'lucide-react';

export default function Profile() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    coursesCompleted: 0,
    totalPoints: 150,
    badges: 3,
    level: 2,
    assessmentScore: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserStats();
  }, [user]);

  const loadUserStats = async () => {
    try {
      // Load user's assessment results
      if (user) {
        const assessmentsQuery = query(
          collection(db, 'userAssessments'),
          where('userId', '==', user.uid)
        );
        const assessmentsSnapshot = await getDocs(assessmentsQuery);
        
        if (!assessmentsSnapshot.empty) {
          const latestAssessment = assessmentsSnapshot.docs[0].data();
          setStats(prev => ({ ...prev, assessmentScore: latestAssessment.score }));
        }
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <nav className="bg-gray-900 border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold gradient-text">PromptMaster AI</h1>
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
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="card mb-8">
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <User size={48} className="text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-2">{user?.displayName || 'User'}</h2>
                <div className="flex items-center gap-2 text-gray-400 mb-4">
                  <Mail size={16} />
                  {user?.email}
                </div>
                <div className="flex gap-4">
                  <div className="px-4 py-2 bg-gray-800 rounded-lg">
                    <div className="text-2xl font-bold gradient-text">Level {stats.level}</div>
                    <div className="text-sm text-gray-400">Current Level</div>
                  </div>
                  <div className="px-4 py-2 bg-gray-800 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-400">{stats.totalPoints}</div>
                    <div className="text-sm text-gray-400">Total Points</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="card">
              <BookOpen className="text-blue-500 mb-3" size={32} />
              <div className="text-3xl font-bold mb-1">{stats.coursesCompleted}</div>
              <div className="text-gray-400">Courses Completed</div>
            </div>

            <div className="card">
              <Award className="text-purple-500 mb-3" size={32} />
              <div className="text-3xl font-bold mb-1">{stats.badges}</div>
              <div className="text-gray-400">Badges Earned</div>
            </div>

            <div className="card">
              <Target className="text-pink-500 mb-3" size={32} />
              <div className="text-3xl font-bold mb-1">{stats.assessmentScore}%</div>
              <div className="text-gray-400">Assessment Score</div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card">
            <h3 className="text-2xl font-bold mb-6">Recent Activity</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg">
                <div className="w-12 h-12 rounded-full bg-green-900/30 flex items-center justify-center">
                  <Award className="text-green-400" size={24} />
                </div>
                <div>
                  <div className="font-bold">Completed Assessment</div>
                  <div className="text-sm text-gray-400">Scored {stats.assessmentScore}%</div>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg">
                <div className="w-12 h-12 rounded-full bg-purple-900/30 flex items-center justify-center">
                  <BookOpen className="text-purple-400" size={24} />
                </div>
                <div>
                  <div className="font-bold">Started Learning</div>
                  <div className="text-sm text-gray-400">Enrolled in PromptMaster AI</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
PROFILEEND

# CourseDetail Page
cat > CourseDetail.tsx << 'COURSEDETAILEND'
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Clock, BookOpen, Target, ArrowLeft, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function CourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();

  useEffect(() => {
    loadCourse();
  }, [id]);

  const loadCourse = async () => {
    try {
      if (id) {
        const courseDoc = await getDoc(doc(db, 'courses', id));
        if (courseDoc.exists()) {
          setCourse({ id: courseDoc.id, ...courseDoc.data() });
        }
      }
    } catch (error) {
      console.error('Error loading course:', error);
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen">
      {/* Header */}
      <nav className="bg-gray-900 border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold gradient-text">PromptMaster AI</h1>
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

            <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
            <p className="text-xl text-gray-400 mb-6">{course.description}</p>

            <div className="flex gap-6 mb-6">
              <div className="flex items-center gap-2 text-gray-400">
                <Clock size={20} />
                {course.estimatedHours} hours
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <BookOpen size={20} />
                {course.category}
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Target size={20} />
                {course.difficulty}
              </div>
            </div>

            <button className="btn btn-primary text-lg px-8">
              Start Learning
            </button>
          </div>

          {/* Course Content */}
          <div className="card mb-8">
            <h2 className="text-2xl font-bold mb-6">What You'll Learn</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0 mt-1">
                  ✓
                </div>
                <div>
                  <div className="font-bold mb-1">Master Core Concepts</div>
                  <div className="text-gray-400 text-sm">Understand fundamental prompt engineering principles</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0 mt-1">
                  ✓
                </div>
                <div>
                  <div className="font-bold mb-1">Hands-On Practice</div>
                  <div className="text-gray-400 text-sm">Apply techniques through interactive exercises</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0 mt-1">
                  ✓
                </div>
                <div>
                  <div className="font-bold mb-1">Real-World Applications</div>
                  <div className="text-gray-400 text-sm">Learn practical use cases and best practices</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0 mt-1">
                  ✓
                </div>
                <div>
                  <div className="font-bold mb-1">Earn Certificates</div>
                  <div className="text-gray-400 text-sm">Get recognized for your achievements</div>
                </div>
              </div>
            </div>
          </div>

          {/* Modules */}
          <div className="card">
            <h2 className="text-2xl font-bold mb-6">Course Modules</h2>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((module) => (
                <div key={module} className="p-4 bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold mb-1">Module {module}: Introduction</div>
                      <div className="text-sm text-gray-400">5 lessons • 45 min</div>
                    </div>
                    <button className="btn btn-secondary">Start</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
COURSEDETAILEND

# Leaderboard Page
cat > Leaderboard.tsx << 'LEADERBOARDEND'
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Trophy, Medal, Award, LogOut } from 'lucide-react';

export default function Leaderboard() {
  const { logout } = useAuth();

  // Mock leaderboard data
  const leaders = [
    { rank: 1, name: 'Sarah Chen', points: 2450, level: 12, badges: 24 },
    { rank: 2, name: 'Alex Kumar', points: 2280, level: 11, badges: 22 },
    { rank: 3, name: 'Maria Garcia', points: 2150, level: 11, badges: 20 },
    { rank: 4, name: 'James Wilson', points: 1980, level: 10, badges: 18 },
    { rank: 5, name: 'Emma Brown', points: 1850, level: 10, badges: 17 },
    { rank: 6, name: 'David Lee', points: 1720, level: 9, badges: 16 },
    { rank: 7, name: 'Sophie Martin', points: 1650, level: 9, badges: 15 },
    { rank: 8, name: 'Ryan Taylor', points: 1580, level: 8, badges: 14 },
  ];

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="text-yellow-400" size={24} />;
    if (rank === 2) return <Medal className="text-gray-300" size={24} />;
    if (rank === 3) return <Medal className="text-orange-400" size={24} />;
    return <span className="text-gray-400 font-bold">#{rank}</span>;
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <nav className="bg-gray-900 border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold gradient-text">PromptMaster AI</h1>
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-gray-300 hover:text-white">Dashboard</Link>
            <Link to="/courses" className="text-gray-300 hover:text-white">Courses</Link>
            <Link to="/profile" className="text-gray-300 hover:text-white">Profile</Link>
            <button onClick={logout} className="btn btn-secondary flex items-center gap-2">
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold mb-4">
              <span className="gradient-text">Leaderboard</span>
            </h2>
            <p className="text-xl text-gray-400">See how you rank against other learners</p>
          </div>

          {/* Top 3 Podium */}
          <div className="grid grid-cols-3 gap-4 mb-12">
            {/* 2nd Place */}
            <div className="card text-center pt-12">
              <Medal className="text-gray-300 mx-auto mb-4" size={48} />
              <div className="text-2xl font-bold mb-2">{leaders[1].name}</div>
              <div className="text-3xl font-bold gradient-text mb-2">{leaders[1].points}</div>
              <div className="text-gray-400">Level {leaders[1].level}</div>
            </div>

            {/* 1st Place */}
            <div className="card text-center bg-gradient-to-b from-yellow-900/20 to-transparent border-yellow-500/50">
              <Trophy className="text-yellow-400 mx-auto mb-4" size={64} />
              <div className="text-2xl font-bold mb-2">{leaders[0].name}</div>
              <div className="text-4xl font-bold gradient-text mb-2">{leaders[0].points}</div>
              <div className="text-gray-400">Level {leaders[0].level}</div>
            </div>

            {/* 3rd Place */}
            <div className="card text-center pt-12">
              <Medal className="text-orange-400 mx-auto mb-4" size={48} />
              <div className="text-2xl font-bold mb-2">{leaders[2].name}</div>
              <div className="text-3xl font-bold gradient-text mb-2">{leaders[2].points}</div>
              <div className="text-gray-400">Level {leaders[2].level}</div>
            </div>
          </div>

          {/* Full Leaderboard */}
          <div className="card">
            <h3 className="text-2xl font-bold mb-6">All Rankings</h3>
            <div className="space-y-3">
              {leaders.map((leader) => (
                <div key={leader.rank} className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg">
                  <div className="w-12 flex justify-center">
                    {getRankIcon(leader.rank)}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold">{leader.name}</div>
                    <div className="text-sm text-gray-400">Level {leader.level} • {leader.badges} badges</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold gradient-text">{leader.points}</div>
                    <div className="text-sm text-gray-400">points</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
LEADERBOARDEND

bash create-remaining.sh
