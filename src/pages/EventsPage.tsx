import React from 'react';
import { motion } from 'motion/react';
import { Users, Award, Calendar, HeartHandshake, Wine, ArrowRight } from 'lucide-react';
import { Button } from '../components/Button';
import { ScrollReveal } from '../components/ScrollReveal';

interface EventsPageProps {
  onNavigate: (page: string) => void;
  onOpenBooking: () => void;
}

export const EventsPage: React.FC<EventsPageProps> = ({ onNavigate, onOpenBooking }) => {
  return (
    <div className="w-full pb-24">
      {/* Hero Banner with Ballroom/Restaurant Video Loop */}
      <section className="relative min-h-[50vh] sm:min-h-[58vh] flex items-center justify-center overflow-hidden bg-[#0D1F1A]">
        <div className="absolute inset-0 overflow-hidden z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            poster="/videos/restaurant-dining.jpg"
            className="w-full h-full object-cover origin-center opacity-65 filter brightness-85 transform-gpu"
          >
            <source src="/videos/restaurant-dining.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-[#142D26] via-[#142D26]/60 to-[#0D1F1A]/75" />
          <div className="absolute inset-0 bg-black/30" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 text-center flex flex-col items-center">
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
            <span className="text-[#D5AD72]">MEETINGS & CELEBRATIONS</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-4xl sm:text-6xl md:text-7xl font-serif font-bold text-white tracking-tight leading-[1.12] mb-4"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Events &{' '}
            <span
              className="text-[#E4C38E] italic font-serif font-normal"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Gatherings
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="text-base sm:text-lg text-white/85 max-w-2xl font-light leading-relaxed"
          >
            From executive board summits to intimate wedding receptions, our dedicated events team ensures flawless hospitality.
          </motion.p>
        </div>
      </section>

      {/* Venues Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 space-y-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <ScrollReveal yOffset={25} delay={0.1}>
            <div className="bg-white rounded-2xl p-8 border border-[#D5AD72]/30 space-y-3 shadow-xs">
              <Users className="w-8 h-8 text-[#B88E52]" />
              <h3
                className="text-xl font-serif font-bold text-[#142D26]"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                The Grand Ballroom
              </h3>
              <p className="text-xs sm:text-sm text-[#242424]/75 leading-relaxed">
                Accommodating up to 220 guests banquet style or 300 theatre style. Equipped with discrete acoustics, 4K projection, and adjustable warm ambient lighting.
              </p>
              <div className="pt-2 text-xs font-semibold text-[#142D26]">
                <span>Capacity: 220–300 Guests</span>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal yOffset={25} delay={0.2}>
            <div className="bg-white rounded-2xl p-8 border border-[#D5AD72]/30 space-y-3 shadow-xs">
              <Award className="w-8 h-8 text-[#B88E52]" />
              <h3
                className="text-xl font-serif font-bold text-[#142D26]"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Executive Boardroom
              </h3>
              <p className="text-xs sm:text-sm text-[#242424]/75 leading-relaxed">
                Polished walnut boardroom table with ergonomic leather executive chairs, integrated video conferencing, and dedicated secretarial support.
              </p>
              <div className="pt-2 text-xs font-semibold text-[#142D26]">
                <span>Capacity: 18–24 Delegates</span>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal yOffset={25} delay={0.3}>
            <div className="bg-white rounded-2xl p-8 border border-[#D5AD72]/30 space-y-3 shadow-xs">
              <Wine className="w-8 h-8 text-[#B88E52]" />
              <h3
                className="text-xl font-serif font-bold text-[#142D26]"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Poolside Terrace Receptions
              </h3>
              <p className="text-xs sm:text-sm text-[#242424]/75 leading-relaxed">
                Al fresco cocktail receptions under the stars. Perfect for celebratory dinners, product debuts, and wedding welcome parties.
              </p>
              <div className="pt-2 text-xs font-semibold text-[#142D26]">
                <span>Capacity: 120 Guests</span>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Contact Events Team Box */}
        <div className="bg-[#ECE8DE]/60 rounded-3xl p-8 sm:p-12 border border-[#D5AD72]/30 text-center max-w-3xl mx-auto space-y-4">
          <HeartHandshake className="w-10 h-10 text-[#B88E52] mx-auto" />
          <h3
            className="text-2xl sm:text-3xl font-serif font-bold text-[#142D26]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Plan Your Occasion with HavenStay
          </h3>
          <p className="text-xs sm:text-sm text-[#575757] max-w-lg mx-auto">
            Our event planners and executive culinary team tailor custom menus, room block rates, and audiovisual solutions for your guests.
          </p>
          <div className="pt-2 flex justify-center gap-4">
            <Button variant="primary" size="md" onClick={() => onNavigate('contact')}>
              Inquire with Events Concierge
            </Button>
            <Button variant="secondary" size="md" onClick={onOpenBooking}>
              Reserve Room Blocks
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
