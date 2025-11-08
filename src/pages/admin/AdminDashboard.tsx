import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Brain, Users, BookOpen, FileText, Award, TrendingUp, LogOut } from 'lucide-react';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalAssessments: 0,
    totalBadges: 0
  });
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      // Load stats
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const coursesSnapshot = await getDocs(collection(db, 'courses'));
      const assessmentsSnapshot = await getDocs(collection(db, 'assessments'));
      const badgesSnapshot = await getDocs(collection(db, 'badges'));

      setStats({
        totalUsers: usersSnapshot.size,
        totalCourses: coursesSnapshot.size,
        totalAssessments: assessmentsSnapshot.size,
        totalBadges: badgesSnapshot.size
      });

      // Load recent users
      const recentUsersQuery = query(
        collection(db, 'users'),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      const recentUsersSnapshot = await getDocs(recentUsersQuery);
      setRecentUsers(recentUsersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading admin dashboard...</div>
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
            <h1 className="text-2xl font-bold gradient-text">PromptMaster AI - Admin</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-gray-300 hover:text-white">Back to Dashboard</Link>
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
          <h2 className="text-3xl font-bold mb-2">Welcome, Admin {user?.displayName}!</h2>
          <p className="text-gray-400">Manage your learning platform from here</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <Users className="text-blue-400" size={32} />
              <TrendingUp className="text-green-400" size={20} />
            </div>
            <div className="text-3xl font-bold mb-1">{stats.totalUsers}</div>
            <p className="text-gray-400">Total Users</p>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <BookOpen className="text-purple-400" size={32} />
              <span className="text-sm text-gray-400">Active</span>
            </div>
            <div className="text-3xl font-bold mb-1">{stats.totalCourses}</div>
            <p className="text-gray-400">Total Courses</p>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <FileText className="text-pink-400" size={32} />
              <span className="text-sm text-gray-400">Published</span>
            </div>
            <div className="text-3xl font-bold mb-1">{stats.totalAssessments}</div>
            <p className="text-gray-400">Assessments</p>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <Award className="text-yellow-400" size={32} />
              <span className="text-sm text-gray-400">Available</span>
            </div>
            <div className="text-3xl font-bold mb-1">{stats.totalBadges}</div>
            <p className="text-gray-400">Badges</p>
          </div>
        </div>

        {/* Management Sections */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Course Management */}
          <div className="card">
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <BookOpen className="text-purple-400" />
              Course Management
            </h3>
            <p className="text-gray-400 mb-4">
              Create, edit, and manage courses. Add modules, lessons, and learning materials.
            </p>
            <div className="flex gap-3">
              <button className="btn btn-primary">Add New Course</button>
              <button className="btn btn-secondary">View All Courses</button>
            </div>
          </div>

          {/* User Management */}
          <div className="card">
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Users className="text-blue-400" />
              User Management
            </h3>
            <p className="text-gray-400 mb-4">
              View user profiles, manage roles, and monitor learning progress across the platform.
            </p>
            <div className="flex gap-3">
              <button className="btn btn-primary">View Users</button>
              <button className="btn btn-secondary">User Analytics</button>
            </div>
          </div>

          {/* Assessment Management */}
          <div className="card">
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <FileText className="text-pink-400" />
              Assessment Management
            </h3>
            <p className="text-gray-400 mb-4">
              Create quizzes, manage questions, and review assessment results.
            </p>
            <div className="flex gap-3">
              <button className="btn btn-primary">Create Assessment</button>
              <button className="btn btn-secondary">View Results</button>
            </div>
          </div>

          {/* Badge Management */}
          <div className="card">
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Award className="text-yellow-400" />
              Badge Management
            </h3>
            <p className="text-gray-400 mb-4">
              Design badges, set requirements, and award achievements to learners.
            </p>
            <div className="flex gap-3">
              <button className="btn btn-primary">Create Badge</button>
              <button className="btn btn-secondary">View All Badges</button>
            </div>
          </div>
        </div>

        {/* Recent Users */}
        <div className="card">
          <h3 className="text-2xl font-bold mb-6">Recent Users</h3>
          {recentUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4">Name</th>
                    <th className="text-left py-3 px-4">Email</th>
                    <th className="text-left py-3 px-4">Role</th>
                    <th className="text-left py-3 px-4">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map((u) => (
                    <tr key={u.id} className="border-b border-gray-800 hover:bg-gray-800">
                      <td className="py-3 px-4">{u.displayName || 'N/A'}</td>
                      <td className="py-3 px-4 text-gray-400">{u.email || 'N/A'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          u.role === 'admin' ? 'bg-purple-900/30 text-purple-400' : 'bg-gray-700 text-gray-300'
                        }`}>
                          {u.role || 'user'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-400">
                        {u.createdAt ? new Date(u.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-400">No users found</p>
          )}
        </div>
      </div>
    </div>
  );
}
