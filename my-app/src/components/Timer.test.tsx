import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import Timer from './Timer'; // Adjust path as necessary

// Helper function to create a TouchEvent
const createTouchEvent = (touchCount: number): TouchEvent => {
  const touchList = Array.from({ length: touchCount }, () => new Touch({ identifier: Date.now(), target: window }));
  return new TouchEvent('touchstart', {
    touches: touchList,
    bubbles: true,
    cancelable: true,
  });
};

describe('Timer Component', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers(); // Important to restore real timers
  });

  test('renders initial time as 00:00:00', () => {
    render(<Timer />);
    expect(screen.getByText('00:00:00')).toBeInTheDocument();
  });

  test('starts timer on two-finger touch, updates time, and calls onStateChange', () => {
    const onStateChangeMock = jest.fn();
    render(<Timer onStateChange={onStateChangeMock} />);

    // Initial state
    expect(screen.getByText('00:00:00')).toBeInTheDocument();
    expect(onStateChangeMock).not.toHaveBeenCalled();

    // Start timer
    act(() => {
      window.dispatchEvent(createTouchEvent(2));
    });

    expect(onStateChangeMock).toHaveBeenCalledWith(true); // isRunning = true
    expect(onStateChangeMock).toHaveBeenCalledTimes(1);

    // Advance time by 1 second (100 * 10ms)
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(screen.getByText('00:01:00')).toBeInTheDocument();

    // Advance time by another 0.5 second
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(screen.getByText('00:01:50')).toBeInTheDocument();
  });

  test('stops timer on second two-finger touch, calls onStateChange with final time, and resets display', () => {
    const onStateChangeMock = jest.fn();
    render(<Timer onStateChange={onStateChangeMock} />);

    // Start timer
    act(() => {
      window.dispatchEvent(createTouchEvent(2));
    });
    expect(onStateChangeMock).toHaveBeenCalledWith(true);

    // Advance time by 1.23 seconds
    act(() => {
      jest.advanceTimersByTime(1230);
    });
    expect(screen.getByText('00:01:23')).toBeInTheDocument();

    // Stop timer
    act(() => {
      window.dispatchEvent(createTouchEvent(2));
    });

    expect(onStateChangeMock).toHaveBeenCalledWith(false, 1230); // isRunning = false, finalTime = 1230ms
    expect(onStateChangeMock).toHaveBeenCalledTimes(2);
    expect(screen.getByText('00:00:00')).toBeInTheDocument(); // Timer display resets
  });

  test('timer does not start with one-finger touch', () => {
    const onStateChangeMock = jest.fn();
    render(<Timer onStateChange={onStateChangeMock} />);

    act(() => {
      window.dispatchEvent(createTouchEvent(1));
    });

    expect(onStateChangeMock).not.toHaveBeenCalled();
    expect(screen.getByText('00:00:00')).toBeInTheDocument();
  });

  test('timer correctly formats time with minutes and seconds', () => {
    const onStateChangeMock = jest.fn();
    render(<Timer onStateChange={onStateChangeMock} />);

    // Start timer
    act(() => {
      window.dispatchEvent(createTouchEvent(2));
    });

    // Advance time to 1 minute, 30 seconds, 500 ms (90500 ms)
    act(() => {
      jest.advanceTimersByTime(90500);
    });
    expect(screen.getByText('01:30:50')).toBeInTheDocument();

     // Stop timer
     act(() => {
      window.dispatchEvent(createTouchEvent(2));
    });
    expect(onStateChangeMock).toHaveBeenCalledWith(false, 90500);
    expect(screen.getByText('00:00:00')).toBeInTheDocument();
  });

  test('cleans up event listener and interval on unmount', () => {
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

    const { unmount } = render(<Timer />);

    // Start timer to ensure interval is set
    act(() => {
      window.dispatchEvent(createTouchEvent(2));
    });
    expect(setInterval).toHaveBeenCalledTimes(1); // setInterval is mocked by fake timers

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('touchstart', expect.any(Function));
    // Check if clearInterval was called for the timerRef.current
    // This is a bit indirect with fake timers, but if an interval was set, it should be cleared.
    // We expect it to be called once for the timerRef.current when unmounting.
    expect(clearIntervalSpy).toHaveBeenCalledTimes(1);
  });
});
