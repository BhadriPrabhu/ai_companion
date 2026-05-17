import React from 'react';

export const FlatUpArrow = ({ size = 28, strokeWidth = 2, color = 'gray' }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      // Removing explicit height prop lets it scale proportionally based on the wide viewBox
      viewBox="0 2 24 11" 
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="square"
      strokeLinejoin="miter"
      // This ensures it behaves like an inline text icon and fits cleanly in layouts
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      {/* Framed perfectly inside a 24x11 window */}
      <polyline points="2,11 12,4 22,11" />
    </svg>
  );
}

export default FlatUpArrow;