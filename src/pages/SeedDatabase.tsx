import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Brain, Database, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { seedDatabase } from '../seed-data';

export default function SeedDatabase() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSeed = async () => {
    setLoading(true);
    setResult(null);

    try {
      const seedResult = await seedDatabase();
      setResult(seedResult);
    } catch (error) {
      setResult({
        success: false,
        message: 'An error occurred',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="text-purple-400" size={48} />
            <h1 className="text-3xl font-bold gradient-text">PromptMaster AI</h1>
          </div>
          <p className="text-gray-400">Database Setup</p>
        </div>

        {/* Seed Card */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <Database className="text-purple-400" size={32} />
            <h2 className="text-2xl font-bold">Seed Database</h2>
          </div>

          <p className="text-gray-400 mb-6">
            Click the button below to populate your Firestore database with sample courses, 
            modules, assessments, and badges. This only needs to be done once.
          </p>

          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-6">
            <h3 className="font-bold mb-2 text-blue-400">What will be created:</h3>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• 5 Courses (Beginner to Advanced)</li>
              <li>• 10+ Course Modules/Lessons</li>
              <li>• 2 Assessments with Questions</li>
              <li>• 4 Achievement Badges</li>
            </ul>
          </div>

          {!result && !loading && (
            <button
              onClick={handleSeed}
              className="btn btn-primary w-full flex items-center justify-center gap-2"
            >
              <Database size={20} />
              Seed Database Now
            </button>
          )}

          {loading && (
            <div className="flex items-center justify-center gap-3 py-8">
              <Loader className="animate-spin text-purple-400" size={32} />
              <span className="text-lg">Seeding database...</span>
            </div>
          )}

          {result && (
            <div className={`rounded-lg p-6 ${
              result.success 
                ? 'bg-green-900/20 border border-green-500/30' 
                : 'bg-red-900/20 border border-red-500/30'
            }`}>
              <div className="flex items-start gap-3 mb-4">
                {result.success ? (
                  <CheckCircle className="text-green-400 flex-shrink-0" size={32} />
                ) : (
                  <AlertCircle className="text-red-400 flex-shrink-0" size={32} />
                )}
                <div>
                  <h3 className={`text-xl font-bold mb-2 ${
                    result.success ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {result.success ? 'Success!' : 'Error'}
                  </h3>
                  <p className="text-gray-300 mb-4">{result.message}</p>

                  {result.success && result.stats && (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Courses:</span>
                        <span className="ml-2 font-bold">{result.stats.courses}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Modules:</span>
                        <span className="ml-2 font-bold">{result.stats.modules}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Assessments:</span>
                        <span className="ml-2 font-bold">{result.stats.assessments}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Badges:</span>
                        <span className="ml-2 font-bold">{result.stats.badges}</span>
                      </div>
                    </div>
                  )}

                  {result.error && (
                    <p className="text-sm text-red-300 mt-2">Error: {result.error}</p>
                  )}
                </div>
              </div>

              {result.success && (
                <div className="flex gap-3 mt-6">
                  <Link to="/signup" className="btn btn-primary flex-1">
                    Create Account
                  </Link>
                  <Link to="/login" className="btn btn-secondary flex-1">
                    Login
                  </Link>
                </div>
              )}

              {!result.success && (
                <button
                  onClick={handleSeed}
                  className="btn btn-primary w-full mt-4"
                >
                  Try Again
                </button>
              )}
            </div>
          )}

          <div className="mt-6 text-center">
            <Link to="/" className="text-gray-400 hover:text-white text-sm">
              ← Back to Home
            </Link>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 card">
          <h3 className="font-bold mb-3">Setup Instructions:</h3>
          <ol className="text-sm text-gray-400 space-y-2">
            <li>1. Make sure you've configured Firebase in <code className="text-purple-400">src/firebase/config.ts</code></li>
            <li>2. Click "Seed Database Now" to populate sample data</li>
            <li>3. Create an account or login</li>
            <li>4. Start learning!</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
