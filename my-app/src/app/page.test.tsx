import React from 'react';
import { render, screen, act, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Page from './page'; // Adjust path as necessary

// Helper function to create a TouchEvent
const createTouchEvent = (touchCount: number): TouchEvent => {
  const touchList = Array.from({ length: touchCount }, () => new Touch({ identifier: Date.now(), target: window }));
  return new TouchEvent('touchstart', {
    touches: touchList,
    bubbles: true,
    cancelable: true,
  });
};

describe('Page Integration Tests', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    // Clear localStorage before each test
    localStorage.clear();
    // Reset mock function calls
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  test('initial render: gray background, 00:00:00 timer, no clocked times', () => {
    render(<Page />);
    // Check timer display
    expect(screen.getByText('00:00:00')).toBeInTheDocument();
    // Check background color (indirectly via style attribute)
    const mainElement = screen.getByRole('main');
    expect(mainElement).toHaveStyle('background-color: gray');
    // Check for clocked times list
    expect(screen.getByText('Clocked Times')).toBeInTheDocument();
    expect(screen.getByText('No times recorded yet.')).toBeInTheDocument();
  });

  test('timer start: background turns blue, timer runs', () => {
    render(<Page />);
    const mainElement = screen.getByRole('main');

    // Start timer
    act(() => {
      window.dispatchEvent(createTouchEvent(2));
    });

    expect(mainElement).toHaveStyle('background-color: blue');

    act(() => {
      jest.advanceTimersByTime(1500); // Advance by 1.5 seconds
    });
    expect(screen.getByText('00:01:50')).toBeInTheDocument();
  });

  test('timer stop: background turns gray, time added to list, timer resets to 00:00:00', async () => {
    render(<Page />);
    const mainElement = screen.getByRole('main');

    // Start timer
    act(() => {
      window.dispatchEvent(createTouchEvent(2));
    });
    act(() => {
      jest.advanceTimersByTime(2340); // Advance by 2.34 seconds
    });
    expect(screen.getByText('00:02:34')).toBeInTheDocument();
    expect(mainElement).toHaveStyle('background-color: blue');

    // Stop timer
    act(() => {
      window.dispatchEvent(createTouchEvent(2));
    });

    expect(mainElement).toHaveStyle('background-color: gray');
    expect(screen.getByText('00:00:00')).toBeInTheDocument(); // Timer display resets

    // Check clocked times list
    // Use await waitFor to handle state updates related to list rendering
    await waitFor(() => {
      expect(screen.getByText('00:02:34')).toBeInTheDocument(); // Formatted time in the list
    });
    expect(screen.queryByText('No times recorded yet.')).not.toBeInTheDocument();
  });

  test('clocked times list: displays multiple times, highlights smallest, shows record label', async () => {
    render(<Page />);

    // Record first time: 1.00s
    act(() => { window.dispatchEvent(createTouchEvent(2)); });
    act(() => { jest.advanceTimersByTime(1000); });
    act(() => { window.dispatchEvent(createTouchEvent(2)); });

    // Record second time: 0.80s (new record)
    act(() => { window.dispatchEvent(createTouchEvent(2)); });
    act(() => { jest.advanceTimersByTime(800); });
    act(() => { window.dispatchEvent(createTouchEvent(2)); });

    // Record third time: 1.20s
    act(() => { window.dispatchEvent(createTouchEvent(2)); });
    act(() => { jest.advanceTimersByTime(1200); });
    act(() => { window.dispatchEvent(createTouchEvent(2)); });

    await waitFor(() => {
      expect(screen.getByText('00:01:00')).toBeInTheDocument();
      const recordTimeElement = screen.getByText('00:00:80');
      expect(recordTimeElement).toBeInTheDocument();
      expect(recordTimeElement).toHaveStyle('color: green');
      expect(recordTimeElement).toHaveStyle('font-weight: bold');
      // Check for the (Record Time!) span next to the record time
      const recordLabel = recordTimeElement.querySelector('span');
      expect(recordLabel).toHaveTextContent('(Record Time!)');
      expect(recordLabel).toHaveStyle('color: green');
      expect(screen.getByText('00:01:20')).toBeInTheDocument();
    });
  });

  test('localStorage: saves and loads clocked times', async () => {
    // Initial render and add one time
    const { unmount } = render(<Page />);
    act(() => { window.dispatchEvent(createTouchEvent(2)); });
    act(() => { jest.advanceTimersByTime(1500); }); // 1.50s
    act(() => { window.dispatchEvent(createTouchEvent(2)); });

    await waitFor(() => {
      expect(screen.getByText('00:01:50')).toBeInTheDocument();
    });
    
    // Check if localStorage.setItem was called (it's mocked in jest.setup.js)
    // The first call to setItem is when the component mounts with empty clockedTimes
    // The second call is after adding the first time.
    expect(localStorage.setItem).toHaveBeenCalledWith('clockedTimes', JSON.stringify([1500]));

    // Unmount and remount to simulate page reload
    unmount();
    render(<Page />);

    // Check if the time is loaded from localStorage
    await waitFor(() => {
      expect(screen.getByText('00:01:50')).toBeInTheDocument();
    });
    expect(localStorage.getItem).toHaveBeenCalledWith('clockedTimes');
    expect(screen.queryByText('No times recorded yet.')).not.toBeInTheDocument();

    // Add another time to ensure saving continues to work after loading
    act(() => { window.dispatchEvent(createTouchEvent(2)); });
    act(() => { jest.advanceTimersByTime(1000); }); // 1.00s
    act(() => { window.dispatchEvent(createTouchEvent(2)); });
    
    await waitFor(() => {
        expect(screen.getByText('00:01:00')).toBeInTheDocument();
      });
    // Check if localStorage.setItem was called with both times
    expect(localStorage.setItem).toHaveBeenCalledWith('clockedTimes', JSON.stringify([1500, 1000]));
  });
});
