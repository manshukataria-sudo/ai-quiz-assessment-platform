import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Timer from '../components/Timer';
import { 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  AlertCircle, 
  HelpCircle, 
  Award,
  Send
} from 'lucide-react';

const TakeQuiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [currentIndex, setCurrentIndex] = useState(0);
  // Map of questionIndex => selectedOptionIndex
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await api.get(`/quizzes/${id}`);
        setQuiz(response.data.data);
      } catch (err) {
        console.error('Fetch quiz error:', err);
        setError('Quiz not found or could not be loaded.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [id]);

  const handleOptionSelect = (optionIndex) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentIndex]: optionIndex
    }));
  };

  const handleClearOption = () => {
    setSelectedAnswers((prev) => {
      const copy = { ...prev };
      delete copy[currentIndex];
      return copy;
    });
  };

  const handleSubmitQuiz = async () => {
    if (submitting) return;
    setSubmitting(true);

    const timeTakenSeconds = Math.round((Date.now() - startTime) / 1000);

    const formattedAnswers = quiz.questions.map((q, idx) => ({
      questionIndex: idx,
      questionId: q._id,
      selectedOptionIndex: selectedAnswers[idx] !== undefined ? selectedAnswers[idx] : -1
    }));

    try {
      const response = await api.post('/attempts/submit', {
        quizId: quiz._id,
        answers: formattedAnswers,
        timeTakenSeconds
      });

      const attemptResult = response.data.data;
      navigate(`/result/${attemptResult._id}`);
    } catch (err) {
      console.error('Failed to submit attempt:', err);
      alert('Error submitting quiz: ' + (err.response?.data?.message || err.message));
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm text-slate-500 font-medium">Preparing assessment...</p>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-red-50 rounded-2xl border border-red-200 text-center">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-red-800">Quiz Unavailable</h3>
        <p className="text-sm text-red-600 mt-1 mb-4">{error}</p>
        <button
          onClick={() => navigate('/quizzes')}
          className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700"
        >
          Back to Quizzes
        </button>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentIndex];
  const totalQuestions = quiz.questions.length;
  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-6">
      
      {/* Top Bar: Title, Tags, Timer */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {quiz.topic}
              </span>
              <span className="text-xs font-semibold uppercase px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {quiz.difficulty}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{quiz.title}</h1>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <Timer initialMinutes={quiz.timeLimitMinutes || 10} onTimeUp={handleSubmitQuiz} />
            <button
              onClick={handleSubmitQuiz}
              disabled={submitting}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>Submit</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>Answered {answeredCount} of {totalQuestions} Questions</span>
          <span>{progressPercent}% Completed</span>
        </div>
        <div className="w-full bg-slate-100 h-2 rounded-full mt-1.5 overflow-hidden">
          <div
            className="bg-blue-600 h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-6">
        
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
            Question {currentIndex + 1} of {totalQuestions}
          </span>
          <span className="text-xs text-slate-400 font-medium">
            {currentQuestion.points || 1} Point{(currentQuestion.points || 1) > 1 ? 's' : ''}
          </span>
        </div>

        <h2 className="text-lg sm:text-xl font-semibold text-slate-900 leading-relaxed mb-6">
          {currentQuestion.questionText}
        </h2>

        {/* Options List */}
        <div className="space-y-3">
          {currentQuestion.options.map((option, optIdx) => {
            const isSelected = selectedAnswers[currentIndex] === optIdx;
            const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
            return (
              <button
                key={optIdx}
                type="button"
                onClick={() => handleOptionSelect(optIdx)}
                className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-4 ${
                  isSelected
                    ? 'bg-blue-50/80 border-blue-500 shadow-sm ring-1 ring-blue-500 text-blue-950'
                    : 'bg-slate-50/40 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-slate-300 text-slate-600'
                  }`}
                >
                  {letters[optIdx] || optIdx + 1}
                </div>
                <span className="text-sm font-medium flex-1">{option}</span>
                {isSelected && <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
          <button
            type="button"
            onClick={handleClearOption}
            className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors"
          >
            Clear Selection
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
              disabled={currentIndex === 0}
              className="flex items-center gap-1 px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {currentIndex === totalQuestions - 1 ? (
              <button
                type="button"
                onClick={handleSubmitQuiz}
                disabled={submitting}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold shadow-sm transition-colors"
              >
                <Award className="w-4 h-4" />
                <span>Finish & Review</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setCurrentIndex((prev) => Math.min(prev + 1, totalQuestions - 1))}
                className="flex items-center gap-1 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm transition-colors"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Bottom Question Grid Navigator */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          Question Palette
        </div>
        <div className="flex flex-wrap gap-2">
          {quiz.questions.map((_, idx) => {
            const isAnswered = selectedAnswers[idx] !== undefined;
            const isCurrent = currentIndex === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`w-9 h-9 rounded-xl font-semibold text-xs transition-all ${
                  isCurrent
                    ? 'ring-2 ring-blue-600 bg-blue-600 text-white'
                    : isAnswered
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default TakeQuiz;
