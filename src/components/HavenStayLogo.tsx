import React from 'react';

interface LogoProps {
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  className?: string;
  onClick?: () => void;
}

export const HavenStayLogo: React.FC<LogoProps> = ({
  variant = 'light',
  size = 'md',
  showTagline = true,
  className = '',
  onClick,
}) => {
  const isDark = variant === 'dark';

  // Sizing definitions
  const emblemSizes = {
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-16 h-16',
  };

  const titleSizes = {
    sm: 'text-base tracking-[0.16em]',
    md: 'text-xl tracking-[0.2em]',
    lg: 'text-2xl sm:text-3xl tracking-[0.22em]',
  };

  const subSizes = {
    sm: 'text-[9px] tracking-[0.28em]',
    md: 'text-[10px] tracking-[0.32em]',
    lg: 'text-xs tracking-[0.36em]',
  };

  const taglineSizes = {
    sm: 'text-[9px]',
    md: 'text-[11px]',
    lg: 'text-sm',
  };

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-3 select-none ${
        onClick ? 'cursor-pointer group' : ''
      } ${className}`}
      role="banner"
      aria-label="HavenStay Hotels Logo"
    >
      {/* Precision Vector Emblem matching the PDF Cover Art */}
      <div className={`relative flex-shrink-0 ${emblemSizes[size]} transition-transform duration-300 group-hover:scale-[1.02]`}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-sm"
        >
          <defs>
            {/* Metallic Gold Gradient for Luxury Brand Integrity */}
            <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E5C38E" />
              <stop offset="35%" stopColor="#D5AD72" />
              <stop offset="70%" stopColor="#B88E52" />
              <stop offset="100%" stopColor="#E2C496" />
            </linearGradient>
            <linearGradient id="goldGleam" x1="10%" y1="0%" x2="90%" y2="100%">
              <stop offset="0%" stopColor="#FAF1E4" />
              <stop offset="40%" stopColor="#D5AD72" />
              <stop offset="100%" stopColor="#8F662A" />
            </linearGradient>
          </defs>

          {/* Outer circle ring */}
          <circle
            cx="50"
            cy="50"
            r="46"
            stroke="url(#goldGrad)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Inner concentric ring */}
          <circle
            cx="50"
            cy="50"
            r="42"
            stroke="url(#goldGrad)"
            strokeWidth="0.8"
            opacity="0.6"
          />

          {/* Architectural Pediment & Home/Hotel Arch with 4-Pane Window */}
          <path
            d="M 50 56 L 43 62 L 43 72 L 57 72 L 57 62 Z"
            stroke="url(#goldGleam)"
            strokeWidth="1.2"
            fill="none"
          />
          {/* Window 4-grid */}
          <line x1="50" y1="62" x2="50" y2="72" stroke="url(#goldGleam)" strokeWidth="0.8" />
          <line x1="43" y1="67" x2="57" y2="67" stroke="url(#goldGleam)" strokeWidth="0.8" />

          {/* Majestic Serif Monogram 'H' */}
          {/* Left upright pillar with serifs */}
          <path
            d="M 28 26 L 36 26 M 32 26 L 32 72 M 28 72 L 36 72"
            stroke="url(#goldGleam)"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Right upright pillar with serifs */}
          <path
            d="M 64 26 L 72 26 M 68 26 L 68 72 M 64 72 L 72 72"
            stroke="url(#goldGleam)"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Elegant sweeping crossbar ribbon curve */}
          <path
            d="M 28 48 C 38 43, 44 55, 72 47"
            stroke="url(#goldGrad)"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
          {/* Under-flourish accent curve */}
          <path
            d="M 32 52 C 45 61, 55 45, 68 53"
            stroke="url(#goldGrad)"
            strokeWidth="1.8"
            opacity="0.85"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Typography stack */}
      <div className="flex flex-col text-left">
        <span
          className={`font-serif font-bold uppercase ${titleSizes[size]} transition-colors duration-200 ${
            isDark ? 'text-white' : 'text-[#142D26]'
          }`}
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          HavenStay
        </span>

        {/* Spaced "HOTELS" subtitle */}
        <div className="flex items-center gap-1.5 -mt-0.5">
          <span
            className={`h-[1px] w-2.5 ${isDark ? 'bg-[#D5AD72]/60' : 'bg-[#D5AD72]'}`}
          />
          <span
            className={`font-serif uppercase font-semibold ${subSizes[size]} ${
              isDark ? 'text-[#D5AD72]' : 'text-[#8C6830]'
            }`}
          >
            Hotels
          </span>
          <span
            className={`h-[1px] w-2.5 ${isDark ? 'bg-[#D5AD72]/60' : 'bg-[#D5AD72]'}`}
          />
        </div>

        {/* Brand Tagline */}
        {showTagline && (
          <span
            className={`italic font-serif mt-0.5 ${taglineSizes[size]} text-[#D5AD72] font-medium tracking-wide`}
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Your Comfort, Our Priority.
          </span>
        )}
      </div>
    </div>
  );
};
