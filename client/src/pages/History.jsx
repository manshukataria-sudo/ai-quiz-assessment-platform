import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { 
  History as HistoryIcon, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ArrowRight, 
  Sparkles,
  Trophy
} from 'lucide-react';

const History = () => {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        const response = await api.get('/attempts/my-attempts');
        setAttempts(response.data.data);
      } catch (err) {
        console.error('Error fetching attempts history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttempts();
  }, []);

  const filteredAttempts = attempts.filter((a) => {
    const matchesSearch =
      a.quizTitle.toLowerCase().includes(search.toLowerCase()) ||
      a.topic.toLowerCase().includes(search.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilter === 'passed') matchesStatus = a.passed;
    if (statusFilter === 'failed') matchesStatus = !a.passed;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="py-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Assessment History & Analytics</h1>
          <p className="text-slate-600 text-sm mt-1">
            Review past quiz submissions, score breakdowns, and AI feedback
          </p>
        </div>

        <Link
          to="/create-quiz"
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-blue-500/20 self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>New Assessment</span>
        </Link>
      </div>

      {/* Search & Status Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by topic or quiz title..."
            className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 bg-white rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Results ({attempts.length})</option>
            <option value="passed">Passed Only</option>
            <option value="failed">Needs Review</option>
          </select>
        </div>
      </div>

      {/* Attempts List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 animate-pulse h-24"></div>
          ))}
        </div>
      ) : filteredAttempts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No assessment records found</h3>
          <p className="text-sm text-slate-500 mt-1 mb-6">
            Take or generate a quiz to start building your verified performance log.
          </p>
          <Link
            to="/create-quiz"
            className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700"
          >
            Generate Quiz with Gemini AI
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAttempts.map((attempt) => {
            const minutes = Math.floor(attempt.timeTakenSeconds / 60);
            const seconds = attempt.timeTakenSeconds % 60;

            return (
              <div
                key={attempt._id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Left: Info */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      {attempt.topic}
                    </span>
                    <span className={`text-xs font-bold uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                      attempt.passed
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {attempt.passed ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Passed</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3" />
                          <span>Needs Review</span>
                        </>
                      )}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 truncate">
                    {attempt.quizTitle}
                  </h3>

                  <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
                    <span>{new Date(attempt.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {minutes}m {seconds}s
                    </span>
                    <span>{attempt.answers.length} Questions</span>
                  </div>
                </div>

                {/* Right: Score & Review CTA */}
                <div className="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="text-left sm:text-right">
                    <div className="text-2xl font-black text-slate-900">
                      {attempt.percentage}%
                    </div>
                    <div className="text-xs text-slate-400">
                      {attempt.score}/{attempt.totalPossibleScore} points
                    </div>
                  </div>

                  <Link
                    to={`/result/${attempt._id}`}
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-bold rounded-xl border border-slate-200 hover:border-blue-200 transition-colors"
                  >
                    <span>Review Answers</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default History;
