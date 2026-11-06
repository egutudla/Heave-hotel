import React from 'react';
import { motion } from 'motion/react';
import { DiningShowcase } from '../components/DiningShowcase';
import { Button } from '../components/Button';
import { ScrollReveal } from '../components/ScrollReveal';
import { ArrowRight, Utensils, Wine, Clock, Sparkles } from 'lucide-react';

interface DiningPageProps {
  onNavigate: (page: string) => void;
  onOpenBooking: () => void;
}

export const DiningPage: React.FC<DiningPageProps> = ({ onNavigate, onOpenBooking }) => {
  return (
    <div className="w-full pb-24">
      {/* Hero Banner inspired by The Palms Classic Hotel */}
      <section className="relative min-h-[50vh] sm:min-h-[58vh] flex items-center justify-center overflow-hidden bg-[#0D1F1A]">
        {/* Background Video */}
        <div className="absolute inset-0 overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            poster="/videos/restaurant-dining.jpg"
            className="w-full h-full object-cover scale-105 opacity-65"
          >
            <source
              src="/videos/restaurant-dining.mp4"
              type="video/mp4"
            />
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-[#142D26] via-[#142D26]/60 to-[#0D1F1A]/75" />
          <div className="absolute inset-0 bg-black/30" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 text-center flex flex-col items-center">
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] font-semibold text-white/70 mb-3"
          >
            <button
              onClick={() => onNavigate('home')}
              className="hover:text-[#D5AD72] transition-colors cursor-pointer"
            >
              HOME
            </button>
            <span className="text-[#D5AD72]">—</span>
            <span className="text-[#D5AD72]">DINING & GASTRONOMY</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-4xl sm:text-6xl md:text-7xl font-serif font-bold text-white tracking-tight leading-[1.12] mb-4"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Artisan Dining &{' '}
            <span
              className="text-[#E4C38E] italic font-serif font-normal"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Cuisine
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="text-base sm:text-lg text-white/85 max-w-2xl font-light leading-relaxed"
          >
            Where culinary artistry meets serene hospitality. Explore our restaurant, pool lounge, and 24-hour suite dining.
          </motion.p>
        </div>
      </section>

      {/* Main Dining Showcase Section (Matching screenshot) */}
      <DiningShowcase onReserveDining={onOpenBooking} />

      {/* Additional Features Bar */}
      <section className="py-16 bg-[#ECE8DE]/60 border-y border-[#D5AD72]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ScrollReveal yOffset={25} delay={0.1}>
              <div className="p-6 rounded-2xl bg-white border border-[#D5AD72]/30 space-y-3 shadow-xs">
                <Utensils className="w-6 h-6 text-[#B88E52]" />
                <h3
                  className="text-lg font-serif font-bold text-[#142D26]"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  Locally Sourced Organic
                </h3>
                <p className="text-xs sm:text-sm text-[#242424]/75 leading-relaxed">
                  We partner with regional coastal farmers and artisanal producers to bring crisp freshness to every creation.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal yOffset={25} delay={0.2}>
              <div className="p-6 rounded-2xl bg-white border border-[#D5AD72]/30 space-y-3 shadow-xs">
                <Wine className="w-6 h-6 text-[#B88E52]" />
                <h3
                  className="text-lg font-serif font-bold text-[#142D26]"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  Sommelier Curated Cellar
                </h3>
                <p className="text-xs sm:text-sm text-[#242424]/75 leading-relaxed">
                  Over 140 vintages carefully selected from classic European estates and new-world boutique vineyards.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal yOffset={25} delay={0.3}>
              <div className="p-6 rounded-2xl bg-white border border-[#D5AD72]/30 space-y-3 shadow-xs">
                <Clock className="w-6 h-6 text-[#B88E52]" />
                <h3
                  className="text-lg font-serif font-bold text-[#142D26]"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  24-Hour Suite Service
                </h3>
                <p className="text-xs sm:text-sm text-[#242424]/75 leading-relaxed">
                  Gourmet dishes and freshly brewed espresso delivered straight to your room whenever inspiration calls.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="pt-20 text-center px-4 sm:px-6">
        <ScrollReveal yOffset={25}>
          <div className="max-w-2xl mx-auto space-y-4">
            <span
              className="text-xs uppercase tracking-widest font-semibold text-[#B88E52]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              HavenStay Gastronomy
            </span>
            <h2
              className="text-3xl sm:text-4xl font-serif font-bold text-[#142D26]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Reserve an Unforgettable Table
            </h2>
            <p className="text-xs sm:text-sm text-[#575757] max-w-md mx-auto">
              Complimentary table reservations for in-house hotel guests and visiting diners alike.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <Button variant="gold" size="md" onClick={onOpenBooking}>
                Reserve Table or Suite
              </Button>
              <Button variant="secondary" size="md" onClick={() => onNavigate('rooms')}>
                View Rooms & Suites
              </Button>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
};
