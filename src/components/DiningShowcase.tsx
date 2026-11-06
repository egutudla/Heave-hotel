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
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);

  const venue = DINING_VENUES.find((v) => v.id === activeTab) || DINING_VENUES[0];

  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Category Tabs inspired by The Palms Classic Hotel */}
      <ScrollReveal yOffset={25}>
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-12 sm:mb-16 overflow-x-auto pb-2 scrollbar-none">
          {DINING_VENUES.map((item) => {
            const isActive = item.id === activeTab;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-5 sm:px-7 py-2.5 rounded-full text-xs sm:text-sm font-medium tracking-wide transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#142D26] text-white shadow-md'
                    : 'bg-white text-[#242424] hover:bg-[#142D26]/5 border border-[#D5AD72]/30'
                }`}
              >
                <span>{item.tabLabel}</span>
              </button>
            );
          })}
        </div>
      </ScrollReveal>

      {/* Main 2-Column Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        {/* Left Card: Rounded Card with Video / Image matching reference screenshot */}
        <div className="lg:col-span-6">
          <ScrollReveal yOffset={35}>
            <div className="relative rounded-[28px] sm:rounded-[36px] overflow-hidden bg-[#ECE8DE] shadow-[0_20px_50px_rgba(20,45,38,0.12)] border border-[#D5AD72]/30 aspect-[4/3] group">
              <AnimatePresence mode="wait">
                <motion.div
                  key={venue.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                  {/* Badge in Bottom Left */}
                  <div className="absolute bottom-5 left-5 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#142D26] shadow-sm flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#D5AD72]" />
                    <span>{venue.signatureDish}</span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </ScrollReveal>
        </div>

        {/* Right Column: Editorial Typography matching reference screenshot */}
        <div className="lg:col-span-6 space-y-6">
          <ScrollReveal yOffset={35} delay={0.15}>
            {/* Kicker with dash: — THE RESTAURANT */}
            <div className="flex items-center gap-2.5">
              <span className="h-[1px] w-6 bg-[#D5AD72]" />
              <span className="text-xs uppercase tracking-[0.22em] font-semibold text-[#B88E52]">
                {venue.kicker}
              </span>
            </div>

            {/* Headline: Where flavour meets ambience */}
            <h2
              className="text-3xl sm:text-5xl lg:text-6xl font-serif text-[#142D26] tracking-tight leading-[1.12]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {venue.headlineMain}{' '}
              <span
                className="italic font-serif text-[#B88E52] font-normal"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                {venue.headlineItalic}
              </span>
              {venue.headlineSecondLine && (
                <>
                  <br />
                  <span
                    className="italic font-serif text-[#B88E52] font-normal"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    {venue.headlineSecondLine}
                  </span>
                </>
              )}
            </h2>

            {/* Paragraph 1 */}
            <p className="text-sm sm:text-base text-[#242424]/80 leading-relaxed font-normal pt-2">
              {venue.bodyPara1}
            </p>

            {/* Paragraph 2 */}
            <p className="text-sm sm:text-base text-[#242424]/80 leading-relaxed font-normal">
              {venue.bodyPara2}
            </p>

            {/* Practical Service Specs */}
            <div className="pt-2 border-t border-[#D5AD72]/20 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#575757]">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-[#B88E52] flex-shrink-0" />
                <span>{venue.hours}</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#B88E52] flex-shrink-0" />
                <span>Dress: {venue.dressCode}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-wrap items-center gap-3">
              <Button
                variant="gold"
                size="md"
                onClick={onReserveDining}
                icon={<ArrowRight className="w-4 h-4" />}
                className="shadow-sm"
              >
                Reserve a Table
              </Button>
              <button
                onClick={onReserveDining}
                className="px-5 py-2.5 rounded-[6px] text-xs sm:text-sm font-medium border border-[#142D26] text-[#142D26] hover:bg-[#142D26] hover:text-white transition-colors cursor-pointer"
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
