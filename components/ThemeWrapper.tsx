
import React from 'react';

interface ThemeWrapperProps {
  theme: string;
  children: React.ReactNode;
}

const ThemeWrapper: React.FC<ThemeWrapperProps> = ({ theme, children }) => {
  let bgClass = "bg-neutral-950";
  
  switch (theme) {
    case 'CHRISTMAS':
      bgClass = "bg-gradient-to-b from-green-900 to-red-950";
      break;
    case 'HALLOWEEN':
      bgClass = "bg-gradient-to-b from-orange-900 to-purple-950";
      break;
    case 'NEW_YEAR':
      bgClass = "bg-gradient-to-b from-slate-900 to-yellow-900";
      break;
    case 'VALENTINE':
      bgClass = "bg-gradient-to-b from-pink-900 to-red-900";
      break;
    default:
      bgClass = "bg-neutral-950";
  }

  return (
    <div className={`min-h-screen ${bgClass} transition-colors duration-500 text-white`}>
      {children}
    </div>
  );
};

export default ThemeWrapper;
