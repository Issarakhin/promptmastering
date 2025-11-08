import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Brain, Trophy, Medal, Award, LogOut } from 'lucide-react';

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
          <div className="flex items-center gap-3">
            <Brain className="text-purple-400" size={32} />
            <h1 className="text-2xl font-bold gradient-text">PromptMaster AI</h1>
          </div>
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
