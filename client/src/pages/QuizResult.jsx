import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Trophy, 
  RotateCcw, 
  LayoutDashboard, 
  Clock, 
  HelpCircle,
  AlertCircle
} from 'lucide-react';

const QuizResult = () => {
  const { id } = useParams();
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAttempt = async () => {
      try {
        const response = await api.get(`/attempts/${id}`);
        setAttempt(response.data.data);
      } catch (err) {
        console.error('Fetch attempt error:', err);
        setError('Could not load attempt results.');
      } finally {
        setLoading(false);
      }
    };

    fetchAttempt();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm text-slate-500 font-medium">Calculating assessment analytics...</p>
      </div>
    );
  }

  if (error || !attempt) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-red-50 rounded-2xl border border-red-200 text-center">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-red-800">Result Not Found</h3>
        <p className="text-sm text-red-600 mt-1 mb-4">{error}</p>
        <Link
          to="/dashboard"
          className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const isPassed = attempt.passed;
  const minutes = Math.floor(attempt.timeTakenSeconds / 60);
  const seconds = attempt.timeTakenSeconds % 60;

  return (
    <div className="max-w-4xl mx-auto py-6">
      
      {/* Score Summary Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 mb-8 text-center relative overflow-hidden">
        
        {/* Background gradient decorative glow */}
        <div className={`absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none ${
          isPassed ? 'bg-green-500' : 'bg-amber-500'
        }`}></div>

        <div className="relative z-10">
          <div className={`inline-flex p-4 rounded-2xl mb-4 ${
            isPassed ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
          }`}>
            <Trophy className="w-10 h-10" />
          </div>

          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 ${
            isPassed ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}>
            {isPassed ? 'Assessment Passed' : 'Needs Review'}
          </span>

          <h1 className="text-3xl font-extrabold text-slate-900 mb-1">{attempt.quizTitle}</h1>
          <p className="text-sm text-slate-500 font-medium">Topic: {attempt.topic} • Level: {attempt.difficulty}</p>

          {/* Big Score Display */}
          <div className="my-6">
            <div className="text-6xl font-black tracking-tight text-slate-900">
              {attempt.percentage}<span className="text-3xl font-bold text-slate-400">%</span>
            </div>
            <p className="text-sm text-slate-600 font-medium mt-1">
              Scored <span className="font-bold text-slate-900">{attempt.score}</span> out of <span className="font-bold text-slate-900">{attempt.totalPossibleScore}</span> total points
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-lg mx-auto mb-6">
            <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
              <div className="text-xs text-slate-500 font-medium">Accuracy</div>
              <div className="text-base font-bold text-slate-800">
                {attempt.answers.filter(a => a.isCorrect).length} / {attempt.answers.length} Correct
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
              <div className="text-xs text-slate-500 font-medium">Time Taken</div>
              <div className="text-base font-bold text-slate-800 flex items-center justify-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {minutes}m {seconds}s
              </div>
            </div>
            <div className="col-span-2 sm:col-span-1 bg-slate-50 border border-slate-100 p-3 rounded-xl">
              <div className="text-xs text-slate-500 font-medium">Passing Threshold</div>
              <div className="text-base font-bold text-slate-800">60% Required</div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/create-quiz"
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-blue-500/20"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate Another AI Assessment</span>
            </Link>
            <Link
              to="/dashboard"
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>View Dashboard</span>
            </Link>
          </div>

        </div>

      </div>

      {/* Question by Question Detailed Breakdown */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Detailed Answer Review & AI Insights</h2>
          <span className="text-xs font-semibold text-slate-500">{attempt.answers.length} Questions Evaluated</span>
        </div>

        {attempt.answers.map((ans, idx) => {
          const isCorrect = ans.isCorrect;
          const letters = ['A', 'B', 'C', 'D'];

          return (
            <div
              key={idx}
              className={`bg-white rounded-2xl border p-6 transition-all shadow-sm ${
                isCorrect ? 'border-slate-200' : 'border-red-200'
              }`}
            >
              {/* Question Header */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-2.5">
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                    isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {idx + 1}
                  </span>
                  <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                    isCorrect ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {isCorrect ? 'Correct (+1 pt)' : 'Incorrect (0 pt)'}
                  </span>
                </div>

                {isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                )}
              </div>

              {/* Question Text */}
              <p className="text-base font-semibold text-slate-900 mb-4">
                {ans.questionText}
              </p>

              {/* Options */}
              <div className="space-y-2 mb-4">
                {ans.options?.map((opt, optIdx) => {
                  const isUserSelection = ans.selectedOptionIndex === optIdx;
                  const isCorrectAnswer = ans.correctOptionIndex === optIdx;

                  let cardStyle = 'bg-slate-50/50 border-slate-200 text-slate-600';
                  if (isCorrectAnswer) {
                    cardStyle = 'bg-green-50/80 border-green-400 text-green-900 font-medium';
                  } else if (isUserSelection && !isCorrect) {
                    cardStyle = 'bg-red-50/80 border-red-300 text-red-900 line-through';
                  }

                  return (
                    <div
                      key={optIdx}
                      className={`p-3 rounded-xl border text-sm flex items-center justify-between ${cardStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-md bg-white border border-slate-300 text-slate-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                          {letters[optIdx]}
                        </span>
                        <span>{opt}</span>
                      </div>
                      {isCorrectAnswer && (
                        <span className="text-xs font-bold text-green-700 bg-green-100/80 px-2 py-0.5 rounded-md">
                          Correct Answer
                        </span>
                      )}
                      {isUserSelection && !isCorrect && (
                        <span className="text-xs font-bold text-red-600 bg-red-100/80 px-2 py-0.5 rounded-md">
                          Your Choice
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* AI Explanation Box */}
              {ans.explanation && (
                <div className="mt-3 p-3.5 bg-blue-50/60 border border-blue-100 rounded-xl text-xs text-slate-700 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-blue-900 block mb-0.5">Gemini AI Explanation:</span>
                    <span>{ans.explanation}</span>
                  </div>
                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
};

export default QuizResult;
