import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Utensils, Wine, Clock, Sparkles, ArrowRight, Check } from 'lucide-react';
import { Button } from './Button';
import { ScrollReveal } from './ScrollReveal';

export interface DiningVenue {
  id: string;
  tabLabel: string;
  kicker: string;
  headlineMain: string;
  headlineItalic: string;
  headlineSecondLine?: string;
  bodyPara1: string;
  bodyPara2: string;
  videoUrl?: string;
  imageUrl: string;
  hours: string;
  dressCode: string;
  signatureDish: string;
}

export const DINING_VENUES: DiningVenue[] = [
  {
    id: 'restaurant',
    tabLabel: 'The Restaurant',
    kicker: 'THE RESTAURANT',
    headlineMain: 'Where flavour',
    headlineItalic: 'meets',
    headlineSecondLine: 'ambience',
    bodyPara1:
      "Our restaurant brings together the freshest local and continental ingredients in a warm, sophisticated space. Whether it's an intimate dinner or a relaxed brunch, every plate is crafted to impress.",
    bodyPara2:
      'Dine in, or enjoy in-room service from the comfort of your suite — the choice is always yours.',
    videoUrl: '/videos/restaurant-dining.mp4',
    imageUrl: '/videos/restaurant-dining.jpg',
    hours: 'Breakfast: 7:00 AM – 11:00 AM | Dinner: 6:00 PM – 10:30 PM',
    dressCode: 'Smart Casual',
    signatureDish: 'Pan-Seared Seabass & Truffle Infused Risotto',
  },
  {
    id: 'pool-bar',
    tabLabel: 'Palms Pool & Sunset Bar',
    kicker: 'LOUNGE & MIXOLOGY',
    headlineMain: 'Crafted cocktails under',
    headlineItalic: 'golden',
    headlineSecondLine: 'skies',
    bodyPara1:
      'Perched alongside our heated pool, the Sunset Bar offers handcrafted artisanal cocktails, premium champagnes, and light poolside tapas throughout the afternoon and evening.',
    bodyPara2:
      'Unwind with mellow ambient acoustics and panoramic sunset views as day turns to night.',
    videoUrl: '/videos/cocktail-bar.mp4',
    imageUrl: '/videos/cocktail-bar.jpg',
    hours: 'Daily: 12:00 PM – Midnight',
    dressCode: 'Resort Casual',
    signatureDish: 'Haven Botanist Gin Cocktail & Smoked Salmon Crostini',
  },
  {
    id: 'in-room',
    tabLabel: 'In-Room Suite Dining',
    kicker: 'PRIVATE DINING',
    headlineMain: 'Gourmet comfort delivered to',
    headlineItalic: 'your',
    headlineSecondLine: 'door',
    bodyPara1:
      'Indulge in our full culinary menu from the complete privacy of your bed, terrace, or living suite. Every meal is served with fine table linens and bespoke temperature cloches.',
    bodyPara2:
      'Available round the clock for late-night cravings or leisurely champagne breakfasts in bed.',
    videoUrl: '/videos/rooms-suites.mp4',
    imageUrl: '/videos/rooms-suites.jpg',
    hours: '24 Hours / 7 Days a Week',
    dressCode: 'Come as you are',
    signatureDish: 'Artisan Continental Breakfast & French Pressed Coffee',
  },
];

interface DiningShowcaseProps {
  onReserveDining?: () => void;
}

export const DiningShowcase: React.FC<DiningShowcaseProps> = ({ onReserveDining }) => {
  const [activeTab, setActiveTab] = useState<string>('restaurant');

  const venue = DINING_VENUES.find((v) => v.id === activeTab) || DINING_VENUES[0];

  return (
    <section className="py-12 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Category Tabs: Horizontally scrollable row on mobile with comfortable edge padding, centered on desktop */}
      <ScrollReveal yOffset={25}>
        <div className="mb-10 sm:mb-16 w-full">
          <div
            className="w-full overflow-x-auto scrollbar-none pb-3 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <div className="flex items-center justify-start sm:justify-center gap-3 sm:gap-3.5 w-max min-w-full sm:w-auto px-4 sm:px-0">
              {DINING_VENUES.map((item) => {
                const isActive = item.id === activeTab;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={`shrink-0 flex-shrink-0 whitespace-nowrap px-5 sm:px-7 py-2.5 rounded-full text-xs sm:text-sm font-medium tracking-wide transition-all cursor-pointer min-h-[44px] flex items-center justify-center select-none ${
                      isActive
                        ? 'bg-[#142D26] text-white shadow-md ring-2 ring-[#D5AD72]/40'
                        : 'bg-white text-[#242424] hover:bg-[#142D26]/5 border border-[#D5AD72]/30 shadow-xs'
                    }`}
                  >
                    <span>{item.tabLabel}</span>
                  </button>
                );
              })}
              {/* Extra trailing space on mobile so the final category pill is never clipped at screen edge */}
              <div className="w-5 shrink-0 flex-shrink-0 sm:hidden" aria-hidden="true" />
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Main 2-Column Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
        {/* Left Column: Rounded Media Card */}
        <div className="lg:col-span-6 w-full">
          <ScrollReveal yOffset={35}>
            <div className="relative rounded-2xl sm:rounded-[36px] overflow-hidden bg-[#ECE8DE] shadow-[0_16px_40px_rgba(20,45,38,0.12)] border border-[#D5AD72]/30 aspect-[4/3] sm:aspect-[4/3] group">
              <AnimatePresence mode="wait">
                <motion.div
                  key={venue.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className="w-full h-full relative"
                >
                  {/* HTML5 Loop Video */}
                  {venue.videoUrl ? (
                    <video
                      autoPlay
                      loop
                      muted
                      playsInline
                      poster={venue.imageUrl}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-103"
                    >
                      <source src={venue.videoUrl} type="video/mp4" />
                    </video>
                  ) : (
                    <img
                      src={venue.imageUrl}
                      alt={venue.tabLabel}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  )}

                  {/* Gentle gradient overlay for cinematic depth */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                  {/* Responsive Badge in Bottom Left - formatted to never overflow mobile screens */}
                  <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:bottom-5 sm:left-5 bg-white/95 backdrop-blur-md px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-lg sm:rounded-full text-[11px] sm:text-xs font-semibold text-[#142D26] shadow-sm flex items-center gap-1.5 max-w-[calc(100%-24px)]">
                    <Sparkles className="w-3.5 h-3.5 text-[#D5AD72] shrink-0" />
                    <span className="truncate">{venue.signatureDish}</span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </ScrollReveal>
        </div>

        {/* Right Column: Editorial Content */}
        <div className="lg:col-span-6 space-y-4 sm:space-y-6">
          <ScrollReveal yOffset={35} delay={0.15}>
            {/* Kicker */}
            <div className="flex items-center gap-2.5">
              <span className="h-[1px] w-6 bg-[#D5AD72]" />
              <span className="text-[11px] sm:text-xs uppercase tracking-[0.22em] font-semibold text-[#B88E52]">
                {venue.kicker}
              </span>
            </div>

            {/* Headline with fluid mobile sizing */}
            <h2
              className="text-2xl sm:text-4xl lg:text-5xl font-serif text-[#142D26] tracking-tight leading-[1.2] sm:leading-[1.15]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {venue.headlineMain}{' '}
              <span
                className="italic font-serif text-[#B88E52] font-normal"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                {venue.headlineItalic}
              </span>{' '}
              {venue.headlineSecondLine && (
                <span
                  className="italic font-serif text-[#B88E52] font-normal"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  {venue.headlineSecondLine}
                </span>
              )}
            </h2>

            {/* Paragraph 1 */}
            <p className="text-xs sm:text-sm md:text-base text-[#242424]/80 leading-relaxed font-normal pt-1">
              {venue.bodyPara1}
            </p>

            {/* Paragraph 2 */}
            <p className="text-xs sm:text-sm md:text-base text-[#242424]/80 leading-relaxed font-normal">
              {venue.bodyPara2}
            </p>

            {/* Practical Service Specs */}
            <div className="pt-2 border-t border-[#D5AD72]/20 grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 text-xs text-[#575757]">
              <div className="flex items-start gap-2">
                <Clock className="w-3.5 h-3.5 text-[#B88E52] shrink-0 mt-0.5" />
                <span>{venue.hours}</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-[#B88E52] shrink-0 mt-0.5" />
                <span>Dress: {venue.dressCode}</span>
              </div>
            </div>

            {/* Action Buttons - full width on mobile for easy thumb interaction */}
            <div className="pt-3 sm:pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
              <Button
                variant="gold"
                size="md"
                onClick={onReserveDining}
                icon={<ArrowRight className="w-4 h-4" />}
                className="w-full sm:w-auto shadow-sm min-h-[44px] justify-center"
              >
                Reserve a Table
              </Button>
              <button
                onClick={onReserveDining}
                className="w-full sm:w-auto px-5 py-2.5 rounded-[6px] text-xs sm:text-sm font-medium border border-[#142D26] text-[#142D26] hover:bg-[#142D26] hover:text-white transition-colors cursor-pointer min-h-[44px] flex items-center justify-center"
              >
                View Seasonal Menu
              </button>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};
