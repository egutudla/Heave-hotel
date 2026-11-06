import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';
import { TestimonialItem } from '../types';

interface TestimonialCarouselProps {
  testimonials: TestimonialItem[];
}

export const TestimonialCarousel: React.FC<TestimonialCarouselProps> = ({
  testimonials,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for prev, 1 for next
  const touchStartX = useRef<number | null>(null);

  const total = testimonials.length;

  const nextTestimonial = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  const prevTestimonial = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  };

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (diff > 45) {
      nextTestimonial();
    } else if (diff < -45) {
      prevTestimonial();
    }
    touchStartX.current = null;
  };

  const current = testimonials[currentIndex];

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 40 : -40,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -40 : 40,
      opacity: 0,
    }),
  };

  return (
    <div
      className="relative max-w-4xl mx-auto px-4 sm:px-6"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Testimonial Card Frame */}
      <div className="bg-white rounded-2xl border border-[#D5AD72]/30 p-8 sm:p-12 shadow-[0_8px_30px_rgba(20,45,38,0.06)] relative overflow-hidden">
        {/* Subtle decorative quote watermark */}
        <Quote className="absolute top-6 right-6 w-16 h-16 text-[#D5AD72]/15 pointer-events-none" />

        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={current.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="flex flex-col items-center text-center space-y-6"
          >
            {/* Rating Stars */}
            <div className="flex items-center gap-1">
              {[...Array(current.rating)].map((_, i) => (
                <Star
                  key={i}
                  className="w-4 h-4 fill-[#D5AD72] text-[#D5AD72]"
                  aria-hidden="true"
                />
              ))}
            </div>

            {/* Quote Body */}
            <blockquote className="text-base sm:text-xl font-serif italic text-[#142D26] leading-relaxed max-w-2xl">
              "{current.quote}"
            </blockquote>

            {/* Author info with clean unboxed typographic separator */}
            <div className="text-sm">
              <span className="font-semibold text-[#142D26] block sm:inline">
                {current.author}
              </span>
              <span className="hidden sm:inline mx-2 text-[#D5AD72]">·</span>
              <span className="text-[#575757] block sm:inline text-xs sm:text-sm">
                Stayed in {current.roomType}
              </span>
            </div>

            {/* Placeholder Notice */}
            {current.isPlaceholder && (
              <span className="inline-block text-[11px] font-semibold uppercase tracking-wider text-[#B88E52] bg-[#F7F5F0] px-3 py-1 rounded-[4px] border border-[#D5AD72]/30">
                [PLACEHOLDER - Guest review will replace this text]
              </span>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Carousel Navigation Controls */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#F7F5F0]">
          <div className="flex items-center gap-2">
            <button
              onClick={prevTestimonial}
              className="p-2 rounded-full border border-[#D5AD72]/50 text-[#142D26] hover:bg-[#142D26] hover:text-white transition-colors cursor-pointer"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextTestimonial}
              className="p-2 rounded-full border border-[#D5AD72]/50 text-[#142D26] hover:bg-[#142D26] hover:text-white transition-colors cursor-pointer"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Dots Indicator */}
          <div className="flex items-center gap-2">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setDirection(idx > currentIndex ? 1 : -1);
                  setCurrentIndex(idx);
                }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentIndex
                    ? 'w-6 bg-[#D5AD72]'
                    : 'w-2 bg-[#D5AD72]/30 hover:bg-[#D5AD72]/60'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
