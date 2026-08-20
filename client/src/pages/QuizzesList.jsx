import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { 
  Search, 
  Sparkles, 
  Layers, 
  HelpCircle, 
  ArrowRight, 
  Clock, 
  PlusCircle, 
  Filter
} from 'lucide-react';

const QuizzesList = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await api.get('/quizzes');
        setQuizzes(response.data.data);
      } catch (err) {
        console.error('Error fetching quizzes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  const filteredQuizzes = quizzes.filter((q) => {
    const matchesSearch =
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      q.topic.toLowerCase().includes(search.toLowerCase());
    const matchesDifficulty =
      difficultyFilter === 'all' || q.difficulty === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  return (
    <div className="py-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Explore Assessments</h1>
          <p className="text-slate-600 text-sm mt-1">
            Browse AI-generated and custom technical quizzes across topics
          </p>
        </div>

        <Link
          to="/create-quiz"
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-blue-500/20 self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>Generate New with AI</span>
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search topics (e.g., Azure, React, MongoDB)..."
            className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="px-3 py-2.5 bg-white rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Quizzes Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 animate-pulse h-48"></div>
          ))}
        </div>
      ) : filteredQuizzes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No assessments found</h3>
          <p className="text-sm text-slate-500 mt-1 mb-6">
            Generate an AI quiz on this topic right away!
          </p>
          <Link
            to="/create-quiz"
            className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700"
          >
            Generate Quiz with Gemini AI
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((q) => {
            const difficultyBadge =
              q.difficulty === 'easy'
                ? 'bg-green-50 text-green-700 border-green-200'
                : q.difficulty === 'hard'
                ? 'bg-red-50 text-red-700 border-red-200'
                : 'bg-amber-50 text-amber-700 border-amber-200';

            return (
              <div
                key={q._id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-semibold uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 truncate">
                      {q.topic}
                    </span>
                    <span className={`text-xs font-semibold uppercase px-2.5 py-0.5 rounded-full border ${difficultyBadge}`}>
                      {q.difficulty}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 line-clamp-2 mb-1.5">
                    {q.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 mb-4">
                    {q.description || 'Comprehensive technical assessment generated with AI.'}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                      {q.questions?.length || 5} Qs
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {q.timeLimitMinutes || 10}m
                    </span>
                  </div>

                  <Link
                    to={`/quiz/${q._id}`}
                    className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <span>Start Test</span>
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

export default QuizzesList;
