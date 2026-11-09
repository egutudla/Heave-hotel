import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface DatePickerFieldProps {
  label: string;
  value: string; // ISO date string: YYYY-MM-DD
  onChange: (value: string) => void;
  minDate?: string; // ISO date string: YYYY-MM-DD
  maxDate?: string; // ISO date string: YYYY-MM-DD
  id?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  className?: string;
  displayText?: string;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const WEEKDAY_NAMES = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

/**
 * Format ISO date string (YYYY-MM-DD) to elegant human-readable date.
 * Example: "2026-11-13" -> "Friday, 13 November 2026"
 */
export function formatHumanDate(isoString?: string): string {
  if (!isoString) return '';
  const parts = isoString.split('-');
  if (parts.length !== 3) return isoString;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const date = new Date(year, month, day);

  if (isNaN(date.getTime())) return isoString;

  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Format ISO date string to a shorter, clean format for mobile buttons.
 * Example: "2026-11-13" -> "Fri, 13 Nov 2026"
 */
export function formatCompactDate(isoString?: string): string {
  if (!isoString) return '';
  const parts = isoString.split('-');
  if (parts.length !== 3) return isoString;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const date = new Date(year, month, day);

  if (isNaN(date.getTime())) return isoString;

  return date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export const DatePickerField: React.FC<DatePickerFieldProps> = ({
  label,
  value,
  onChange,
  minDate,
  maxDate,
  id,
  required = false,
  error,
  helperText,
  className = '',
  displayText,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial view month/year from current value or today
  const parseYearMonth = () => {
    if (value && value.includes('-')) {
      const [y, m] = value.split('-').map(Number);
      if (!isNaN(y) && !isNaN(m)) {
        return { year: y, month: m - 1 };
      }
    }
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  };

  const initial = parseYearMonth();
  const [viewYear, setViewYear] = useState(initial.year);
  const [viewMonth, setViewMonth] = useState(initial.month);

  // Sync view when value prop updates
  useEffect(() => {
    if (value && value.includes('-')) {
      const [y, m] = value.split('-').map(Number);
      if (!isNaN(y) && !isNaN(m)) {
        setViewYear(y);
        setViewMonth(m - 1);
      }
    }
  }, [value]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Calendar math
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
  // Adjust so Monday is 0, Sunday is 6
  const startDay = (firstDayIndex + 6) % 7;

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const mm = String(viewMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    const selectedIso = `${viewYear}-${mm}-${dd}`;
    onChange(selectedIso);
    setIsOpen(false);
  };

  const isDayDisabled = (day: number) => {
    const mm = String(viewMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    const dateStr = `${viewYear}-${mm}-${dd}`;

    if (minDate && dateStr < minDate) return true;
    if (maxDate && dateStr > maxDate) return true;
    return false;
  };

  const isDaySelected = (day: number) => {
    if (!value) return false;
    const mm = String(viewMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return value === `${viewYear}-${mm}-${dd}`;
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getFullYear() === viewYear &&
      today.getMonth() === viewMonth &&
      today.getDate() === day
    );
  };

  const formattedDisplay = value ? formatHumanDate(value) : 'Select date';

  return (
    <div ref={containerRef} className={`relative flex flex-col space-y-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-semibold uppercase tracking-wider text-[#142D26]"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Compact Interactive Field Button */}
      <button
        id={id}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        title={value ? `Selected: ${formatHumanDate(value)}` : 'Select date'}
        className={`w-full min-h-[46px] px-3.5 py-2.5 rounded-lg text-left transition-all flex items-center justify-between border cursor-pointer ${
          isOpen
            ? 'bg-white border-[#D5AD72] ring-2 ring-[#D5AD72]/40 shadow-xs'
            : error
            ? 'bg-red-50/60 border-red-300 text-red-900'
            : 'bg-[#F7F5F0] hover:bg-white border-[#D5AD72]/40 text-[#142D26]'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0 pr-2">
          <CalendarIcon className="w-4 h-4 text-[#B88E52] shrink-0" />
          <div className="flex flex-col truncate">
            <span className={`text-xs sm:text-sm font-medium truncate ${value || displayText ? 'text-[#142D26]' : 'text-stone-400'}`}>
              {displayText || formattedDisplay}
            </span>
          </div>
        </div>

        <span className="text-[11px] font-medium text-[#B88E52] shrink-0 bg-white/70 px-2 py-0.5 rounded border border-[#D5AD72]/30">
          {isOpen ? 'Close' : 'Change'}
        </span>
      </button>

      {helperText && !error && <p className="text-[11px] text-stone-500">{helperText}</p>}
      {error && <p className="text-[11px] text-red-600 font-medium">{error}</p>}

      {/* Minimal Floating Date Selector Popover */}
      {isOpen && (
        <div
          role="dialog"
          aria-label={label}
          className="absolute top-full left-0 mt-2 z-50 w-full sm:w-[320px] bg-white rounded-xl shadow-[0_16px_36px_rgba(20,45,38,0.18)] border border-[#D5AD72]/40 p-4 animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header with Month Navigation */}
          <div className="flex items-center justify-between pb-3 border-b border-[#F7F5F0]">
            <button
              type="button"
              onClick={handlePrevMonth}
              aria-label="Previous Month"
              className="p-1.5 rounded-md hover:bg-stone-100 text-[#142D26] transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span
              className="text-sm font-serif font-bold text-[#142D26]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>

            <button
              type="button"
              onClick={handleNextMonth}
              aria-label="Next Month"
              className="p-1.5 rounded-md hover:bg-stone-100 text-[#142D26] transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday labels */}
          <div className="grid grid-cols-7 gap-1 text-center py-2 text-[11px] font-semibold text-stone-500">
            {WEEKDAY_NAMES.map((d) => (
              <div key={d} className="py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Month Day Matrix */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {/* Blank leading slots */}
            {Array.from({ length: startDay }).map((_, i) => (
              <div key={`blank-${i}`} className="h-8" />
            ))}

            {/* Actual Month Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const disabled = isDayDisabled(day);
              const selected = isDaySelected(day);
              const today = isToday(day);

              return (
                <button
                  key={day}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleSelectDay(day)}
                  className={`h-8 w-8 mx-auto flex items-center justify-center rounded-md font-medium transition-all ${
                    disabled
                      ? 'text-stone-300 cursor-not-allowed pointer-events-none'
                      : selected
                      ? 'bg-[#142D26] text-[#E4C38E] font-bold shadow-xs'
                      : today
                      ? 'border border-[#D5AD72] text-[#142D26] hover:bg-[#D5AD72]/20 cursor-pointer'
                      : 'text-[#242424] hover:bg-[#D5AD72]/15 hover:text-[#142D26] cursor-pointer'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Footer note */}
          <div className="flex items-center justify-between pt-3 mt-2 border-t border-[#F7F5F0] text-[11px] text-stone-500">
            <span>Click any date to apply</span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-[#142D26] font-semibold hover:underline cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
