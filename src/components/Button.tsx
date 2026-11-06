import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'primary' | 'secondary' | 'gold' | 'outline-gold' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  iconPosition = 'right',
  loading = false,
  disabled = false,
  className = '',
  children,
  ...props
}) => {
  // Base styling adhering to luxury typography and 44px+ touch targets
  const baseStyles =
    'relative inline-flex items-center justify-center font-sans font-medium transition-all duration-200 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D5AD72] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none cursor-pointer';

  // Variant rules:
  // Primary: Forest green (#142D26), white text, subtle rounded, hover lift
  // Secondary: Transparent/Ivory with green border (#142D26)
  // Gold: Warm Gold (#D5AD72) with Forest Green (#142D26) text - Key CTAs
  // Outline Gold: Transparent with gold border
  // Ghost: Transparent with minimal hover
  const variants = {
    primary:
      'bg-[#142D26] text-white hover:bg-[#1C3E35] active:bg-[#0D1F1A] shadow-sm hover:shadow-md border border-[#142D26]',
    secondary:
      'bg-transparent text-[#142D26] border border-[#142D26] hover:bg-[#142D26] hover:text-white',
    gold:
      'bg-[#D5AD72] text-[#142D26] font-semibold hover:bg-[#E4C38E] active:bg-[#B88E52] shadow-sm hover:shadow-md border border-[#D5AD72]',
    'outline-gold':
      'bg-transparent text-[#142D26] border border-[#D5AD72] hover:bg-[#D5AD72]/15',
    ghost:
      'bg-transparent text-[#142D26] hover:bg-[#142D26]/5 active:bg-[#142D26]/10',
  };

  const sizes = {
    sm: 'text-xs px-3.5 py-2 rounded-[5px] min-h-[38px] tracking-wide gap-1.5',
    md: 'text-sm px-5 py-2.5 rounded-[6px] min-h-[44px] tracking-wide gap-2',
    lg: 'text-base px-7 py-3.5 rounded-[7px] min-h-[48px] tracking-wide gap-2.5',
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <motion.button
      whileHover={!disabled && !loading ? { y: -1 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Processing...</span>
        </span>
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="flex-shrink-0">{icon}</span>}
          <span>{children}</span>
          {icon && iconPosition === 'right' && <span className="flex-shrink-0">{icon}</span>}
        </>
      )}
    </motion.button>
  );
};
