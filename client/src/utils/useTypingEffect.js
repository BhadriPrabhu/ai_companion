import { useState, useEffect, useRef } from 'react';

export const useTypingEffect = (text, speed = 50) => {
  const [displayedText, setDisplayedText] = useState('');
  const index = useRef(0);

  useEffect(() => {
    setDisplayedText('');
    index.current = 0;
  }, [text]);

  useEffect(() => {
    if (index.current < text.length) {
      const timeoutId = setTimeout(() => {
        setDisplayedText((prev) => prev + text.charAt(index.current));
        index.current += 1;
      }, speed);

      return () => clearTimeout(timeoutId);
    }
  }, [displayedText, text, speed]);

  return displayedText;
};