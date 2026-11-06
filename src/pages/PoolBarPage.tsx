import React from 'react';
import { motion } from 'motion/react';
import { Wine, Sun, Sparkles, Clock, GlassWater, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '../components/Button';
import { ScrollReveal } from '../components/ScrollReveal';

interface PoolBarPageProps {
  onNavigate: (page: string) => void;
  onOpenBooking: () => void;
}

export const PoolBarPage: React.FC<PoolBarPageProps> = ({ onNavigate, onOpenBooking }) => {
  return (
    <div className="w-full pb-24">
      {/* Hero Banner with Heated Swimming Pool Video Loop */}
      <section className="relative min-h-[52vh] sm:min-h-[60vh] flex items-center justify-center overflow-hidden bg-[#0D1F1A]">
        {/* Full-width Pool Video Background */}
        <div className="absolute inset-0 overflow-hidden z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            poster="/videos/swimming-pool.jpg"
            className="w-full h-full object-cover origin-center opacity-70 filter brightness-90 transform-gpu"
          >
            <source src="/videos/swimming-pool.mp4" type="video/mp4" />
            <source src="/videos/swimming-pool.webm" type="video/webm" />
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
            <span className="text-[#D5AD72]">WELLNESS & MIXOLOGY</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-4xl sm:text-6xl md:text-7xl font-serif font-bold text-white tracking-tight leading-[1.12] mb-4"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Palms Pool &{' '}
            <span
              className="text-[#E4C38E] italic font-serif font-normal"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Sunset Bar
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="text-base sm:text-lg text-white/85 max-w-2xl font-light leading-relaxed"
          >
            Pristine azure waters by day, artisan mixology and starlit ambiance by evening. Your private sanctuary of leisure.
          </motion.p>
        </div>
      </section>

      {/* Highlights Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <ScrollReveal yOffset={25} delay={0.1}>
            <div className="bg-white rounded-2xl p-8 border border-[#D5AD72]/30 space-y-4 shadow-xs">
              <Sun className="w-8 h-8 text-[#B88E52]" />
              <h3
                className="text-xl font-serif font-bold text-[#142D26]"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Temperature Controlled Lap Pool
              </h3>
              <p className="text-xs sm:text-sm text-[#242424]/75 leading-relaxed">
                Heated to a comfortable 28°C year-round. Featuring dedicated morning swim lanes, shallow sun shelves, and ergonomic hydrotherapy jets.
              </p>
              <div className="text-xs text-[#575757] pt-2">
                <span>Hours: 6:00 AM – 10:00 PM</span>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal yOffset={25} delay={0.2}>
            <div className="bg-white rounded-2xl p-8 border border-[#D5AD72]/30 space-y-4 shadow-xs">
              <Wine className="w-8 h-8 text-[#B88E52]" />
              <h3
                className="text-xl font-serif font-bold text-[#142D26]"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Signature Mixology Lounge
              </h3>
              <p className="text-xs sm:text-sm text-[#242424]/75 leading-relaxed">
                Handcrafted coastal cocktails infused with botanical syrups, fresh pressed citrus, and rare single malts served poolside or at the marble bar.
              </p>
              <div className="text-xs text-[#575757] pt-2">
                <span>Hours: 12:00 PM – Midnight</span>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal yOffset={25} delay={0.3}>
            <div className="bg-white rounded-2xl p-8 border border-[#D5AD72]/30 space-y-4 shadow-xs">
              <Sparkles className="w-8 h-8 text-[#B88E52]" />
              <h3
                className="text-xl font-serif font-bold text-[#142D26]"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Private Poolside Cabanas
              </h3>
              <p className="text-xs sm:text-sm text-[#242424]/75 leading-relaxed">
                Shaded daybeds with personalized butler service, chilled towel service, fresh fruit skewers, and bluetooth ambient sound connectivity.
              </p>
              <div className="text-xs text-[#575757] pt-2">
                <span>Complimentary for Suite Guests</span>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Video Showcase Ribbon */}
        <div className="mt-16 rounded-3xl overflow-hidden relative shadow-xl border border-[#D5AD72]/30 bg-[#0D1F1A]">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center">
            {/* Left Video Container */}
            <div className="relative aspect-[16/10] sm:aspect-[16/9] lg:aspect-auto lg:h-[420px] overflow-hidden">
              <video
                autoPlay
                loop
                muted
                playsInline
                poster="/videos/cocktail-bar.jpg"
                className="w-full h-full object-cover origin-center transform-gpu"
              >
                <source src="/videos/cocktail-bar.mp4" type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/20 to-[#0D1F1A]/80 hidden lg:block" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D1F1A] via-transparent to-transparent lg:hidden" />
            </div>

            {/* Right Information */}
            <div className="p-8 sm:p-12 text-white space-y-6">
              <div className="inline-flex items-center gap-2">
                <span className="h-[1px] w-6 bg-[#D5AD72]" />
                <span className="text-xs uppercase tracking-widest font-semibold text-[#D5AD72]">
                  Evening Rituals
                </span>
              </div>

              <h3
                className="text-2xl sm:text-4xl font-serif font-bold text-white leading-tight"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Sunset Acoustics & Bespoke Spritzes
              </h3>

              <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-light">
                Join fellow guests every evening from 5:30 PM to 7:00 PM for complimentary sommelier wine tastings and signature sunset canapés as twilight settles over the pool terrace.
              </p>

              <div className="pt-2 flex flex-wrap gap-4">
                <Button variant="gold" size="md" onClick={onOpenBooking}>
                  Reserve Daybed or Suite
                </Button>
                <Button variant="secondary" size="md" onClick={() => onNavigate('dining')}>
                  Explore Sofia Restaurant
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
