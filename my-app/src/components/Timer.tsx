import React, { useState, useEffect, useRef } from 'react';

interface TimerProps {
  onStateChange?: (isRunning: boolean, finalTime?: number) => void;
}

const Timer: React.FC<TimerProps> = ({ onStateChange }) => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const finalTimeRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const formatTime = (timeInMillis: number) => {
    const milliseconds = String(timeInMillis % 1000).padStart(3, '0').slice(0, 2);
    const seconds = String(Math.floor((timeInMillis / 1000) % 60)).padStart(2, '0');
    const minutes = String(Math.floor((timeInMillis / (1000 * 60)) % 60)).padStart(2, '0');
    return (
      <div className='h-screen flex flex-col justify-center items-center'>
        <span style={{ fontSize: '16vw', display: 'inline-block'}}>{minutes}</span><span style={{ fontSize: '25vw' }}>{seconds}:{milliseconds}</span>
      </div>
    );
  };

  useEffect(() => {
    finalTimeRef.current = time;
  }, [time]);

  // Start/stop timer on single touch or mouse click
  const handleStartStop = () => {
    const newIsRunning = !isRunning;
    setIsRunning(newIsRunning);

    if (newIsRunning) {
      setTime(0);
      if (onStateChange) {
        onStateChange(newIsRunning);
      }
      timerRef.current = setInterval(() => {
        setTime(prevTime => prevTime + 10);
      }, 10);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (onStateChange) {
        onStateChange(newIsRunning, finalTimeRef.current);
      }
      setTime(0);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return (
    <div
      className="w-full text-center text-[14vw] break-words font-mono select-none fixed-width"
      onTouchStart={e => { if (e.touches.length === 1) handleStartStop(); }}
      onClick={handleStartStop}
    >
      {formatTime(time)}
    </div>
  );
};

export default Timer;
