import React, { useState, useEffect, useRef } from 'react';

interface TimerProps {
  onStateChange?: (isRunning: boolean, finalTime?: number) => void;
}

const Timer: React.FC<TimerProps> = ({ onStateChange }) => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  // Store the time value when the timer stops, to ensure the callback has the correct value
  // as `time` state might update before the callback is called with the final time.
  const finalTimeRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const formatTime = (timeInMillis: number) => {
    const milliseconds = String(timeInMillis % 1000).padStart(3, '0').slice(0, 2); // Get first two digits for MS
    const seconds = String(Math.floor((timeInMillis / 1000) % 60)).padStart(2, '0');
    const minutes = String(Math.floor((timeInMillis / (1000 * 60)) % 60)).padStart(2, '0');
    return `${minutes}:${seconds}:${milliseconds}`;
  };

  // Update finalTimeRef whenever time changes
  useEffect(() => {
    finalTimeRef.current = time;
  }, [time]);

  useEffect(() => {
    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length === 2) {
        const newIsRunning = !isRunning;
        setIsRunning(newIsRunning);

        if (newIsRunning) {
          setTime(0); // Reset timer on new start
          if (onStateChange) {
            onStateChange(newIsRunning);
          }
          timerRef.current = setInterval(() => {
            setTime(prevTime => prevTime + 10); // Increment by 10ms for smoother display
          }, 10);
        } else {
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          // Pass the final time when stopping
          if (onStateChange) {
            onStateChange(newIsRunning, finalTimeRef.current);
          }
          // Reset the display time to 00:00:00 after stopping and reporting.
          // The next start will also set time to 0, but this makes the UI update immediately.
          setTime(0);
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, onStateChange]);

  return (
    <div style={{ width: '100%', textAlign: 'center', fontSize: '10vw', fontFamily: 'monospace', overflowWrap: 'break-word' }}>
      {formatTime(time)}
    </div>
  );
};

export default Timer;
