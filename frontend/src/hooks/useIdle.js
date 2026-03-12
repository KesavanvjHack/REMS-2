import { useState, useEffect } from 'react';
import throttle from 'lodash/throttle';

const useIdle = (timeoutMinutes = 5) => {
  const [isIdle, setIsIdle] = useState(false);

  useEffect(() => {
    let timeoutId;

    const handleActivity = throttle(() => {
      setIsIdle(false);
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setIsIdle(true), timeoutMinutes * 60 * 1000);
    }, 1000);

    // Initial timeout
    timeoutId = setTimeout(() => setIsIdle(true), timeoutMinutes * 60 * 1000);

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('scroll', handleActivity);
    window.addEventListener('click', handleActivity);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      window.removeEventListener('click', handleActivity);
      clearTimeout(timeoutId);
    };
  }, [timeoutMinutes]);

  return isIdle;
};

export default useIdle;
