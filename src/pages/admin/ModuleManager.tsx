import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Brain, Plus, Edit, Trash, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getAllModules, deleteModule } from '../../firebase/services/modules';
import type { Module } from '../../firebase/services/modules';

export default function ModuleManager() {
  const { logout } = useAuth();
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadModules();
  }, []);

  const loadModules = async () => {
    try {
      const allModules = await getAllModules();
      setModules(allModules);
    } catch (error) {
      console.error('Error loading modules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (moduleId: string) => {
    if (!confirm('Are you sure you want to delete this module?')) return;
    
    try {
      await deleteModule(moduleId);
      await loadModules();
      alert('Module deleted successfully');
    } catch (error) {
      console.error('Error deleting module:', error);
      alert('Failed to delete module');
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <nav className="bg-gray-900 border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Brain className="text-purple-400" size={32} />
            <h1 className="text-2xl font-bold gradient-text">Module Manager</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/admin" className="text-gray-300 hover:text-white">Dashboard</Link>
            <button onClick={logout} className="btn btn-secondary flex items-center gap-2">
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Manage Modules</h2>
          <button className="btn btn-primary flex items-center gap-2">
            <Plus size={20} />
            Add Module (Use Firebase Console)
          </button>
        </div>

        {/* Instructions */}
        <div className="card mb-8 bg-blue-900/20 border-blue-500/30">
          <h3 className="font-bold mb-3">How to Add Modules:</h3>
          <ol className="text-sm text-gray-300 space-y-2">
            <li>1. Go to <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">Firebase Console</a></li>
            <li>2. Navigate to Firestore Database → <code className="text-purple-400">modules</code> collection</li>
            <li>3. Click "Add Document"</li>
            <li>4. Use the schema from <code className="text-purple-400">MODULE_SCHEMA.md</code></li>
            <li>5. Add sections array with video, text, quiz, and lab content</li>
          </ol>
        </div>

        {/* Module List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-xl">Loading modules...</div>
          </div>
        ) : modules.length === 0 ? (
          <div className="card text-center">
            <p className="text-gray-400 mb-4">No modules found. Add modules through Firebase Console.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {modules.map((module) => (
              <div key={module.id} className="card">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">{module.title}</h3>
                    <p className="text-gray-400 mb-3">{module.description}</p>
                    
                    <div className="flex gap-4 text-sm text-gray-400 mb-3">
                      <span>Course: {module.courseId}</span>
                      <span>Order: {module.order}</span>
                      <span>Duration: {module.duration} min</span>
                      <span>Sections: {module.sections?.length || 0}</span>
                    </div>

                    {/* Section breakdown */}
                    {module.sections && module.sections.length > 0 && (
                      <div className="flex gap-2 flex-wrap">
                        {module.sections.map((section, idx) => (
                          <span
                            key={idx}
                            className={`px-2 py-1 rounded text-xs ${
                              section.type === 'video' ? 'bg-blue-900/30 text-blue-400' :
                              section.type === 'text' ? 'bg-green-900/30 text-green-400' :
                              section.type === 'quiz' ? 'bg-yellow-900/30 text-yellow-400' :
                              'bg-purple-900/30 text-purple-400'
                            }`}
                          >
                            {section.type}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Link
                      to={`/modules/${module.id}`}
                      className="btn btn-secondary flex items-center gap-2"
                    >
                      <Edit size={16} />
                      View
                    </Link>
                    <button
                      onClick={() => handleDelete(module.id)}
                      className="btn bg-red-900/30 hover:bg-red-900/50 border-red-500/30 flex items-center gap-2"
                    >
                      <Trash size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Schema Reference */}
        <div className="card mt-8">
          <h3 className="font-bold mb-4">Module Schema Reference</h3>
          <pre className="bg-gray-800 p-4 rounded-lg overflow-x-auto text-sm">
{`{
  id: "module-id",
  courseId: "course-id",
  title: "Module Title",
  description: "Module description",
  order: 1,
  duration: 45,
  sections: [
    {
      type: "video",
      order: 1,
      videoUrl: "https://youtube.com/embed/...",
      videoTitle: "Video Title",
      videoDuration: 600
    },
    {
      type: "text",
      order: 2,
      textTitle: "Text Section",
      textContent: "<h2>HTML Content</h2>"
    },
    {
      type: "quiz",
      order: 3,
      questions: [...]
    },
    {
      type: "lab",
      order: 4,
      labTitle: "Practice Lab",
      labPrompt: "Instructions...",
      labExpectedKeywords: ["keyword1", "keyword2"],
      labPassingScore: 70,
      labPoints: 50
    }
  ]
}`}
          </pre>
        </div>
      </div>
    </div>
  );
}
