'use client'; // This is a client component

import Timer from '@/components/Timer';
import { useState, useMemo, useEffect } from 'react'; // Import useEffect

// Helper function to format time, can be moved to a utils file if needed
const formatTimeDisplay = (timeInMillis: number): string => {
  const milliseconds = String(timeInMillis % 1000).padStart(3, '0').slice(0, 3); // Get first three digits for MS
  const seconds = String(Math.floor((timeInMillis / 1000) % 60)).padStart(2, '0');
  const minutes = String(Math.floor((timeInMillis / (1000 * 60)) % 60)).padStart(2, '0');
  return `${minutes}:${seconds}:${milliseconds}`;
};

export default function Page() {
  const [timerIsRunning, setTimerIsRunning] = useState(false);
  const [clockedTimes, setClockedTimes] = useState<number[]>([]); // Store times in milliseconds for easy comparison

  // Load clockedTimes from localStorage on initial mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedTimes = localStorage.getItem('clockedTimes');
      if (storedTimes) {
        try {
          const parsedTimes = JSON.parse(storedTimes);
          if (Array.isArray(parsedTimes) && parsedTimes.every(time => typeof time === 'number')) {
            setClockedTimes(parsedTimes);
          } else {
            console.error("Invalid data found in localStorage for clockedTimes.");
            localStorage.removeItem('clockedTimes'); // Clear invalid data
          }
        } catch (error) {
          console.error("Failed to parse clockedTimes from localStorage:", error);
          localStorage.removeItem('clockedTimes'); // Clear corrupted data
        }
      }
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  // Save clockedTimes to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Only save if clockedTimes has been initialized (i.e., not the initial empty array before loading from localStorage)
      // This check might be too simplistic if the user legitimately clears all times.
      // A more robust check might involve a separate "loaded" state, but for this scope,
      // saving even an empty array after user interaction is fine.
      localStorage.setItem('clockedTimes', JSON.stringify(clockedTimes));
    }
  }, [clockedTimes]); // Run this effect whenever clockedTimes changes

  const handleTimerStateChange = (isRunning: boolean, finalTime?: number) => {
    setTimerIsRunning(isRunning);
    if (!isRunning && finalTime !== undefined) {
      setClockedTimes(prevTimes => [...prevTimes, finalTime]);
    }
  };

  const smallestTime = useMemo(() => {
    if (clockedTimes.length === 0) {
      return null;
    }
    return Math.min(...clockedTimes);
  }, [clockedTimes]);

  return (
    <div className="flex h-screen w-screen">
      <aside
        className="fixed top-0 left-0 w-[200px] p-5 overflow-y-auto bg-transparent pointer-events-none touch-none z-50"
        style={{ background: 'transparent' }}
      >
        <button
          className="pointer-events-auto mb-3 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
          onClick={() => setClockedTimes([])}
          disabled={clockedTimes.length === 0}
        >
          Clear All
        </button>
        {clockedTimes.length === 0 && <p className="pointer-events-auto text-xs">No times recorded yet.</p>}
        <ul className="list-none p-0 pointer-events-auto">
          {clockedTimes.map((time, index) => (
        <li
          key={index}
          className={
            `text-[1.2rem] py-1 ${time === smallestTime ? 'text-green-600 font-bold' : ''} pointer-events-auto bg-gray-100/90 shadow-sm p-2 rounded-md mb-2 transition-colors duration-300 hover:bg-gray-200`
          }
        >
          {formatTimeDisplay(time)}
          {time === smallestTime && (
            <span className="ml-2 text-green-600 text-[0.6rem] pointer-events-auto animate animate-pulse">(⭐️)</span>
          )}
        </li>
          ))}
        </ul>
      </aside>
      <main
        className={`h-screen w-screen flex flex-col items-center justify-center flex-grow transition-colors duration-300 relative ${timerIsRunning ? 'bg-blue-600' : 'bg-gray-500'}`}
      >
        <Timer onStateChange={handleTimerStateChange} />
      </main>
    </div>
  );
}
