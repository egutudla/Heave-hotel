import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Calendar, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '../components/Button';
import { OfferCard } from '../components/OfferCard';
import { ScrollReveal } from '../components/ScrollReveal';
import { OfferItem } from '../types';

interface OffersPageProps {
  onNavigate: (page: string) => void;
  onOpenBooking: () => void;
}

const OFFERS: OfferItem[] = [
  {
    id: 'o-1',
    badge: 'Direct Privilege',
    title: 'Complimentary Artisan Breakfast',
    description:
      'Book directly on our official website and enjoy daily chef-curated breakfast for two, served at Sofia Restaurant or in-suite.',
    terms: 'Valid on all Deluxe King & Suite reservations through this season.',
    imageUrl: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=800&q=80',
    isPlaceholder: true,
  },
  {
    id: 'o-2',
    badge: 'Weekend Sanctuary',
    title: 'Extended Sunday Late Check-Out',
    description:
      'Unwind at your leisure with guaranteed 3:00 PM late check-out on all Friday-to-Sunday weekend getaways.',
    terms: 'Subject to room availability upon arrival confirmation.',
    imageUrl: '/videos/swimming-pool.jpg',
    isPlaceholder: true,
  },
  {
    id: 'o-3',
    badge: 'Extended Journey',
    title: 'Stay 4 Nights, Pay for 3',
    description:
      'Enjoy a fourth night complimentary when booking an extended business stay or relaxing holiday in any executive suite.',
    terms: 'Applicable automatically for stays of 4 consecutive nights or longer.',
    imageUrl: '/videos/hotel-tour.jpg',
    isPlaceholder: true,
  },
  {
    id: 'o-4',
    badge: 'Romance Package',
    title: 'Couples Retreat & Champagne Arrival',
    description:
      'Chilled vintage champagne, artisan chocolate truffles, and a private cabana daybed reservation for two.',
    terms: 'Select during booking checkout under special amenities.',
    imageUrl: '/videos/cocktail-bar.jpg',
    isPlaceholder: true,
  },
];

export const OffersPage: React.FC<OffersPageProps> = ({ onNavigate, onOpenBooking }) => {
  return (
    <div className="w-full pb-24">
      {/* Hero Banner with Architectural Video Background */}
      <section className="relative min-h-[50vh] sm:min-h-[58vh] flex items-center justify-center overflow-hidden bg-[#0D1F1A]">
        {/* Full-width Video Background */}
        <div className="absolute inset-0 overflow-hidden z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            poster="/videos/hotel-tour.jpg"
            className="w-full h-full object-cover origin-center opacity-65 filter brightness-85 transform-gpu"
          >
            <source src="/videos/hotel-tour.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-[#142D26] via-[#142D26]/60 to-[#0D1F1A]/75" />
          <div className="absolute inset-0 bg-black/30" />
        </div>

        {/* Content */}
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
            <span className="text-[#D5AD72]">PRIVILEGES & OFFERS</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-4xl sm:text-6xl md:text-7xl font-serif font-bold text-white tracking-tight leading-[1.12] mb-4"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Special Offers &{' '}
            <span
              className="text-[#E4C38E] italic font-serif font-normal"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Packages
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="text-base sm:text-lg text-white/85 max-w-2xl font-light leading-relaxed"
          >
            Enjoy preferred privileges, complimentary dining, and extended stays designed exclusively for guests booking directly with HavenStay.
          </motion.p>
        </div>
      </section>

      {/* Offers Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {OFFERS.map((offer, idx) => (
            <ScrollReveal key={offer.id} yOffset={30} delay={0.1 * idx}>
              <OfferCard offer={offer} onClaim={onOpenBooking} />
            </ScrollReveal>
          ))}
        </div>

        {/* Direct Booking Guarantee Card */}
        <div className="mt-16 bg-white rounded-2xl p-8 sm:p-12 border border-[#D5AD72]/40 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div className="space-y-2">
              <span className="font-serif font-bold text-lg text-[#142D26] block">
                Best Rate Guaranteed
              </span>
              <p className="text-xs text-[#575757] leading-relaxed">
                Found a lower rate elsewhere within 24 hours? We will match it and offer an additional 10% credit.
              </p>
            </div>
            <div className="space-y-2">
              <span className="font-serif font-bold text-lg text-[#142D26] block">
                Flexible Cancellation
              </span>
              <p className="text-xs text-[#575757] leading-relaxed">
                Plans change seamlessly. Modify or cancel your reservation up to 48 hours prior to arrival with zero penalty.
              </p>
            </div>
            <div className="space-y-2">
              <span className="font-serif font-bold text-lg text-[#142D26] block">
                Priority Room Upgrades
              </span>
              <p className="text-xs text-[#575757] leading-relaxed">
                Direct bookers receive top consideration for complimentary floor and suite view upgrades upon check-in.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
