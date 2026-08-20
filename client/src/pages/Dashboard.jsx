import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Sparkles, 
  Trophy, 
  Target, 
  Award, 
  TrendingUp, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  XCircle,
  BarChart3,
  Layers,
  Compass
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await api.get('/attempts/analytics');
        setAnalytics(response.data.data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  return (
    <div className="py-6 space-y-8">
      
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-800 rounded-3xl p-6 sm:p-10 text-white shadow-xl shadow-blue-500/10 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider mb-4 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-blue-200" />
            AI-Powered Assessment Platform
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
            Welcome back, {user?.name || 'Student'}! 👋
          </h1>
          <p className="text-blue-100 text-sm sm:text-base leading-relaxed mb-6">
            Test your knowledge with dynamic AI-generated quizzes, practice technical topics, and review smart pedagogical explanations.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/create-quiz"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-blue-700 font-bold rounded-xl shadow-md hover:bg-blue-50 transition-all text-sm"
            >
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Generate AI Assessment</span>
            </Link>
            <Link
              to="/quizzes"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-700/60 hover:bg-blue-700 text-white font-semibold rounded-xl border border-blue-400/30 transition-colors text-sm"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Quizzes</span>
            </Link>
          </div>
        </div>

        {/* Decorative circle */}
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Quizzes */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Assessments Taken</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {loading ? '-' : analytics?.totalQuizzes || 0}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">Lifetime completed attempts</span>
        </div>

        {/* Average Score */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Average Score</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {loading ? '-' : `${analytics?.averageScore || 0}%`}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">Overall performance accuracy</span>
        </div>

        {/* Pass Rate */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Pass Rate</span>
            <div className="w-9 h-9 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {loading ? '-' : `${analytics?.passRate || 0}%`}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">Score &ge; 60% qualification</span>
        </div>

        {/* Total Passed vs Failed */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Passed / Total</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {loading ? '-' : `${analytics?.passedCount || 0} / ${analytics?.totalQuizzes || 0}`}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">Validated technical milestones</span>
        </div>

      </div>

      {/* Analytics Breakdown & Recent Attempts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Recent Attempts */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-slate-900">Recent Assessment Attempts</h2>
            </div>
            <Link
              to="/history"
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>View All History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-slate-50 rounded-xl animate-pulse"></div>
              ))}
            </div>
          ) : !analytics?.recentAttempts || analytics.recentAttempts.length === 0 ? (
            <div className="text-center py-10">
              <Trophy className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500 font-medium">No quiz attempts yet.</p>
              <Link
                to="/create-quiz"
                className="mt-3 inline-block text-xs font-bold text-blue-600 hover:underline"
              >
                Generate your first quiz now →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {analytics.recentAttempts.map((att) => (
                <div key={att._id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {att.topic}
                      </span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        att.passed ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {att.passed ? 'Passed' : 'Needs Review'}
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-slate-900 truncate">{att.quizTitle}</h4>
                    <span className="text-xs text-slate-400">
                      {new Date(att.createdAt).toLocaleDateString()} • {Math.floor(att.timeTakenSeconds / 60)}m {att.timeTakenSeconds % 60}s
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-base font-extrabold text-slate-900">{att.percentage}%</div>
                      <div className="text-xs text-slate-400">{att.score}/{att.totalPossibleScore} pts</div>
                    </div>
                    <Link
                      to={`/result/${att._id}`}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Difficulty Distribution & Quick Start */}
        <div className="space-y-6">
          
          {/* Difficulty Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Layers className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">Difficulty Distribution</h3>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-600">Easy Level</span>
                  <span className="text-slate-900">{analytics?.difficultyDistribution?.easy || 0} quizzes</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-green-500 h-full rounded-full"
                    style={{
                      width: `${analytics?.totalQuizzes ? ((analytics.difficultyDistribution?.easy || 0) / analytics.totalQuizzes) * 100 : 0}%`
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-600">Medium Level</span>
                  <span className="text-slate-900">{analytics?.difficultyDistribution?.medium || 0} quizzes</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full"
                    style={{
                      width: `${analytics?.totalQuizzes ? ((analytics.difficultyDistribution?.medium || 0) / analytics.totalQuizzes) * 100 : 0}%`
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-600">Hard Level</span>
                  <span className="text-slate-900">{analytics?.difficultyDistribution?.hard || 0} quizzes</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-red-500 h-full rounded-full"
                    style={{
                      width: `${analytics?.totalQuizzes ? ((analytics.difficultyDistribution?.hard || 0) / analytics.totalQuizzes) * 100 : 0}%`
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Microsoft Tech Consultant Info Tip */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-5">
            <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600" />
              Technical Consultant Tip
            </h4>
            <p className="text-xs text-blue-800 leading-relaxed">
              When presenting this project, emphasize how generative AI automates assessment curation while MongoDB aggregation pipelines deliver real-time performance analytics for candidates.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Dashboard;
