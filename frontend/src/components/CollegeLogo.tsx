import React from 'react';

interface CollegeLogoProps {
  className?: string;
  size?: number;
}

export const CollegeLogo: React.FC<CollegeLogoProps> = ({ className = '', size = 44 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 rounded-full shadow-md ${className}`}
    >
      {/* Outer Crimson / Maroon Border */}
      <circle cx="50" cy="50" r="48" fill="#7f1d1d" stroke="#b91c1c" strokeWidth="2" />
      {/* Middle Golden Band */}
      <circle cx="50" cy="50" r="44" fill="#14532d" stroke="#facc15" strokeWidth="3" />
      {/* Inner Cream / Light Green Disc */}
      <circle cx="50" cy="50" r="35" fill="#f0fdf4" stroke="#15803d" strokeWidth="1.5" />
      
      {/* Gear / Vocational Cogwheel Symbol */}
      <circle cx="50" cy="50" r="22" fill="#dcfce7" stroke="#166534" strokeWidth="1.5" strokeDasharray="3 2" />
      
      {/* Open Book of Knowledge */}
      <path
        d="M32 58 C40 54, 46 56, 50 59 C54 56, 60 54, 68 58 L68 44 C60 40, 54 42, 50 45 C46 42, 40 40, 32 44 Z"
        fill="#ffffff"
        stroke="#166534"
        strokeWidth="1.5"
      />
      <line x1="50" y1="45" x2="50" y2="59" stroke="#166534" strokeWidth="1.5" />

      {/* Flame of Education / Torch */}
      <path
        d="M50 31 C47 35, 45 37, 47 40 C49 42, 51 42, 53 40 C55 37, 53 35, 50 31 Z"
        fill="#f59e0b"
      />
      <path
        d="M50 33 C49 35, 48 37, 49 39 C50 40, 51 40, 52 39 C53 37, 52 35, 50 33 Z"
        fill="#ef4444"
      />

      {/* Graduation Cap / Wrench / Agriculture Sprout Motif */}
      <circle cx="40" cy="48" r="2.5" fill="#15803d" />
      <circle cx="60" cy="48" r="2.5" fill="#d97706" />

      {/* Ethiopian Flag Ribbon Colors at Bottom Arc */}
      <path d="M35 70 Q50 75 65 70" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M38 73 Q50 78 62 73" stroke="#eab308" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M41 76 Q50 81 59 76" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" />

      {/* Star / Spark */}
      <polygon points="50,22 51.5,25.5 55,26 52.5,28.5 53,32 50,30 47,32 47.5,28.5 45,26 48.5,25.5" fill="#facc15" />
    </svg>
  );
};

export default CollegeLogo;
