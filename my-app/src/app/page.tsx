'use client'; // This is a client component

import Timer from '@/components/Timer';
import { useState, useMemo, useEffect } from 'react'; // Import useEffect

// Helper function to format time, can be moved to a utils file if needed
const formatTimeDisplay = (timeInMillis: number): string => {
  const milliseconds = String(timeInMillis % 1000).padStart(3, '0').slice(0, 2); // Get first two digits for MS
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
    <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
      <aside style={{
        width: '200px', // Adjust width as needed
        padding: '20px',
        borderRight: '1px solid #ccc',
        overflowY: 'auto', // Make it scrollable
        backgroundColor: '#f0f0f0', // Light background for the list area
      }}>
        <h2>Clocked Times</h2>
        {clockedTimes.length === 0 && <p>No times recorded yet.</p>}
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {clockedTimes.map((time, index) => (
            <li key={index} style={{
              fontSize: '1.2rem', // Smaller font size
              padding: '5px 0',
              color: time === smallestTime ? 'green' : 'inherit', // Highlight smallest time
              fontWeight: time === smallestTime ? 'bold' : 'normal',
            }}>
              {formatTimeDisplay(time)}
              {time === smallestTime && <span style={{ marginLeft: '10px', color: 'green', fontSize: '0.9rem' }}>(Record Time!)</span>}
            </li>
          ))}
        </ul>
      </aside>
      <main style={{
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: timerIsRunning ? 'blue' : 'gray',
        transition: 'background-color 0.3s ease', // Smooth transition
        position: 'relative', // Needed if you want to position elements absolutely within main
      }}>
        <Timer onStateChange={handleTimerStateChange} />
      </main>
    </div>
  );
}
