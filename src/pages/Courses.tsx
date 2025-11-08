import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Brain, BookOpen, Clock, LogOut } from 'lucide-react';
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
