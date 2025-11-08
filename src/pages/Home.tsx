import { Link } from 'react-router-dom';
import { Brain, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Brain className="text-purple-400" size={40} />
          <h1 className="text-2xl font-bold gradient-text">PromptMaster AI</h1>
        </div>
        <Link to="/dashboard" className="btn btn-primary">
          Go to Dashboard
        </Link>
      </nav>

      {/* Hero Section - Centered */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-4xl">
          {/* Badge */}
          <div className="inline-block mb-8">
            <div className="px-6 py-3 rounded-full border border-purple-500/30 bg-purple-900/20">
              <span className="text-purple-300 font-medium">Master AI Prompt Engineering</span>
            </div>
          </div>

          {/* Main Headline */}
          <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Transform Your AI
            <br />
            <span className="gradient-text">Communication Skills</span>
          </h2>

          {/* Subheadline */}
          <p className="text-xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
            Learn to craft perfect prompts, unlock AI's full potential, and become a certified prompt engineer with our comprehensive learning platform.
          </p>

          {/* CTA Button */}
          <Link to="/signup" className="btn btn-primary text-lg px-8 py-4 inline-flex items-center gap-2">
            Continue Learning
            <ArrowRight size={20} />
          </Link>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-3 gap-12 max-w-2xl mx-auto">
            <div>
              <div className="text-4xl font-bold gradient-text mb-2">14+</div>
              <div className="text-gray-400">Courses</div>
            </div>
            <div>
              <div className="text-4xl font-bold gradient-text mb-2">50+</div>
              <div className="text-gray-400">Lessons</div>
            </div>
            <div>
              <div className="text-4xl font-bold gradient-text mb-2">1000+</div>
              <div className="text-gray-400">Students</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
