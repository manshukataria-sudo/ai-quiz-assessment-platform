import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  Sparkles, 
  BookOpen, 
  Sliders, 
  HelpCircle, 
  Layers, 
  ArrowRight, 
  AlertCircle,
  Cpu
} from 'lucide-react';

const SUGGESTED_TOPICS = [
  'Azure Cloud Services & Architecture',
  'Node.js & Express REST API Design',
  'React.js State Management & Hooks',
  'MongoDB Schema Design & Indexing',
  'JWT Authentication & Web Security',
  'System Design & Microservices'
];

const CreateQuiz = () => {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [numQuestions, setNumQuestions] = useState(5);
  const [customInstructions, setCustomInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!topic.trim()) {
      setError('Please enter or select a topic.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await api.post('/quizzes/generate-ai', {
        topic,
        difficulty,
        numQuestions: parseInt(numQuestions, 10),
        customInstructions
      });

      const newQuiz = response.data.data;
      navigate(`/quiz/${newQuiz._id}`);
    } catch (err) {
      console.error('Quiz creation error:', err);
      setError(err.response?.data?.message || 'Failed to generate AI quiz. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6">
      
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-200 rounded-full text-blue-700 text-xs font-semibold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          Powered by Google Gemini API
        </div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Generate Dynamic AI Assessment</h1>
        <p className="text-slate-600 text-sm mt-1">
          Specify any computer science topic or framework to automatically generate tailored questions with full explanations.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-sm text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleGenerate} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        
        {/* Topic Input */}
        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600" />
            Assessment Topic
          </label>
          <input
            type="text"
            required
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Azure App Service, React 18, Data Structures..."
            className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-slate-50/50"
          />
          
          {/* Quick suggestions */}
          <div className="mt-3">
            <span className="text-xs font-medium text-slate-500 block mb-2">Popular Suggested Topics:</span>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_TOPICS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setTopic(item)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                    topic === item
                      ? 'bg-blue-50 border-blue-300 text-blue-700 font-semibold'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Difficulty & Number of Questions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          
          {/* Difficulty */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              Difficulty Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'easy', label: 'Easy', desc: 'Fundamentals' },
                { id: 'medium', label: 'Medium', desc: 'Applied' },
                { id: 'hard', label: 'Hard', desc: 'Complex / Edge cases' }
              ].map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setDifficulty(lvl.id)}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    difficulty === lvl.id
                      ? 'bg-blue-50/70 border-blue-500 text-blue-800 shadow-sm ring-1 ring-blue-500'
                      : 'bg-slate-50/50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="text-sm font-semibold capitalize">{lvl.label}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{lvl.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Question Count */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-600" />
              Number of Questions ({numQuestions})
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[3, 5, 8, 10].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setNumQuestions(num)}
                  className={`py-3 rounded-xl border text-sm font-semibold text-center transition-all ${
                    numQuestions === num
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                      : 'bg-slate-50/50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {num} Qs
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Custom Instructions */}
        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-slate-400" />
            Special Focus / Extra Instructions (Optional)
          </label>
          <input
            type="text"
            value={customInstructions}
            onChange={(e) => setCustomInstructions(e.target.value)}
            placeholder="e.g., Emphasize latency optimization, cloud deployment, and error handling"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-slate-50/50"
          />
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-3 transition-all disabled:opacity-60"
          >
            {loading ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Gemini AI is crafting your assessment...</span>
              </div>
            ) : (
              <>
                <Cpu className="w-5 h-5" />
                <span>Generate Assessment with Gemini AI</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
};

export default CreateQuiz;
