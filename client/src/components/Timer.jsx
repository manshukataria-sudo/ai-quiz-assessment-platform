import React, { useEffect, useState } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

const Timer = ({ initialMinutes = 10, onTimeUp }) => {
  const [secondsLeft, setSecondsLeft] = useState(initialMinutes * 60);

  useEffect(() => {
    if (secondsLeft <= 0) {
      if (onTimeUp) onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (onTimeUp) onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft, onTimeUp]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const isUrgent = secondsLeft < 60;

  return (
    <div
      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full font-mono text-sm font-semibold border transition-all ${
        isUrgent
          ? 'bg-red-50 text-red-700 border-red-200 animate-pulse'
          : 'bg-slate-100 text-slate-700 border-slate-200'
      }`}
    >
      {isUrgent ? (
        <AlertTriangle className="w-4 h-4 text-red-600" />
      ) : (
        <Clock className="w-4 h-4 text-blue-600" />
      )}
      <span>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
    </div>
  );
};

export default Timer;
