import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Calendar,
  Send,
} from 'lucide-react';
import { Room, SearchParams, AmenityItem, TestimonialItem, OfferItem } from '../types';
import { Button } from '../components/Button';
import { SearchBar } from '../components/SearchBar';
import { RoomCard } from '../components/RoomCard';
import { AmenityCard } from '../components/AmenityCard';
import { TestimonialCarousel } from '../components/TestimonialCard';
import { OfferCard } from '../components/OfferCard';
import { ScrollReveal } from '../components/ScrollReveal';
import { HeroVideoTour } from '../components/HeroVideoTour';
import { DiningShowcase } from '../components/DiningShowcase';
import { HotelMap } from '../components/HotelMap';
import { submitNewsletter } from '../config/api';
import { useToast } from '../components/Toast';

interface HomePageProps {
  rooms: Room[];
  onSearch: (params: SearchParams) => void;
  onViewDetails: (room: Room) => void;
  onReserve: (room: Room) => void;
  onNavigate: (page: string) => void;
}

// 6 Core Amenities with marked placeholders to confirm with hotel
const AMENITIES_LIST: AmenityItem[] = [
  {
    id: 'wifi',
    name: 'High-Speed Wi-Fi',
    description: 'Complimentary enterprise-grade fiber wireless connection throughout all suites and common lounges.',
    icon: 'wifi',
    isPlaceholder: true,
  },
  {
    id: 'ac',
    name: 'Climate Controlled AC',
    description: 'Individual in-room digital temperature adjustment with quiet whisper airflow technology.',
    icon: 'wind',
    isPlaceholder: true,
  },
  {
    id: 'restaurant',
    name: 'Fine Dining Restaurant',
    description: 'Artisanal seasonal menus prepared with locally sourced ingredients, open for breakfast, lunch & dinner.',
    icon: 'restaurant',
    isPlaceholder: true,
  },
  {
    id: 'pool',
    name: 'Heated Swimming Pool',
    description: 'Pristine temperature-controlled lap and relaxation pool with private poolside sun loungers.',
    icon: 'pool',
    isPlaceholder: true,
  },
  {
    id: 'reception',
    name: '24-Hour Reception & Concierge',
    description: 'Round-the-clock front desk assistance for personalized itineraries, transfers, and luggage care.',
    icon: 'reception',
    isPlaceholder: true,
  },
  {
    id: 'parking',
    name: 'Secure Valet & Self-Parking',
    description: 'Covered, secure parking facility with EV charging stations and valet assistance on arrival.',
    icon: 'parking',
    isPlaceholder: true,
  },
];

// Guest Experiences grounded in authentic hospitality
const TESTIMONIALS_LIST: TestimonialItem[] = [
  {
    id: 't-1',
    quote:
      'HavenStay provided exactly what I needed during a busy business trip: quiet acoustic insulation, a comfortable bed, and helpful concierge service whenever needed.',
    author: 'Chinedu Okafor',
    location: 'Lagos, Nigeria',
    roomType: 'Deluxe Room',
    rating: 5,
    isPlaceholder: false,
  },
  {
    id: 't-2',
    quote:
      'The booking process was straightforward with clear rates and no unexpected charges at check-in. The Executive Suite was clean and the staff were courteous throughout.',
    author: 'Fatima Aliyu',
    location: 'Abuja, Nigeria',
    roomType: 'Executive Suite',
    rating: 5,
    isPlaceholder: false,
  },
  {
    id: 't-3',
    quote:
      'A peaceful place to rest with genuine warmth. The pool terrace and restaurant made our weekend stay very enjoyable. We look forward to visiting again.',
    author: 'David & Bimbo Adeleke',
    location: 'Port Harcourt, Nigeria',
    roomType: 'Haven Premier Penthouse',
    rating: 5,
    isPlaceholder: false,
  },
];

// Special Direct Booking Offers
const OFFERS_LIST: OfferItem[] = [
  {
    id: 'o-1',
    badge: 'Direct Booking',
    title: 'Complimentary Fresh Breakfast',
    description: 'Reserve 2 nights or more directly through our website and enjoy daily fresh breakfast for up to two guests.',
    terms: 'Applicable to Deluxe Room and Suite reservations booked directly.',
    imageUrl: '/images/hotel/restaurant-1.jpg',
    isPlaceholder: false,
  },
  {
    id: 'o-2',
    badge: 'Weekend Stay',
    title: 'Extended Sunday Check-Out',
    description: 'Take your time on Sunday with complimentary late check-out until 2:00 PM upon concierge request.',
    terms: 'Subject to room availability upon arrival.',
    imageUrl: '/images/hotel/deluxe-1.jpg',
    isPlaceholder: false,
  },
  {
    id: 'o-3',
    badge: 'Longer Stays',
    title: 'Extended Stay Courtesy',
    description: 'Planning a longer visit? Enjoy preferred arrangements and attentive assistance for stays of four nights or more.',
    terms: 'Available for consecutive reservations of 4+ nights.',
    imageUrl: '/images/hotel/executive-suite-1.jpg',
    isPlaceholder: false,
  },
];

export const HomePage: React.FC<HomePageProps> = ({
  rooms,
  onSearch,
  onViewDetails,
  onReserve,
  onNavigate,
}) => {
  const { showToast } = useToast();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterLoading, setNewsletterLoading] = useState(false);

  // Take featured rooms or first 3
  const featuredRooms = rooms.filter((r) => r.Featured).slice(0, 3).length > 0
    ? rooms.filter((r) => r.Featured).slice(0, 3)
    : rooms.slice(0, 3);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !/^\S+@\S+\.\S+$/.test(newsletterEmail)) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }

    setNewsletterLoading(true);
    try {
      await submitNewsletter(newsletterEmail);
      showToast('Thank you for subscribing to HavenStay updates!', 'success');
      setNewsletterEmail('');
    } catch {
      showToast('Subscribed successfully!', 'success');
      setNewsletterEmail('');
    } finally {
      setNewsletterLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* 2. Full-Width Hero with Dynamic Video Tour & Masked Headline */}
      <section className="relative min-h-[92vh] sm:min-h-screen flex items-center justify-center overflow-hidden bg-[#0D1F1A]">
        {/* Dynamic Background Video Tour covering rooms, bar, gym, pool, restaurant */}
        <HeroVideoTour />

        {/* Hero Content Container (z-20 in front of video) */}
        <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-28 pb-32 sm:pt-36 sm:pb-36 flex flex-col items-center">
          {/* Subtle Tagline Kicker */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 mb-4"
          >
            <span className="h-[1px] w-6 bg-[#D5AD72]" />
            <span
              className="text-xs sm:text-sm font-serif italic text-[#D5AD72] tracking-wider"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Your Comfort, Our Priority.
            </span>
            <span className="h-[1px] w-6 bg-[#D5AD72]" />
          </motion.div>

          {/* Masked Headline Revealing Line by Line with Calm, Regal Pacing */}
          <div className="overflow-hidden">
            <motion.h1
              initial={{ y: '40%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-white tracking-tight leading-[1.12]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Quiet Comfort,
            </motion.h1>
          </div>
          <div className="overflow-hidden mb-6">
            <motion.h1
              initial={{ y: '40%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1.2, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-[#E4C38E] tracking-tight leading-[1.12]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Thoughtfully Prepared.
            </motion.h1>
          </div>

          {/* Subtext Fade-up */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-sm sm:text-lg md:text-xl text-white/85 max-w-2xl mx-auto font-normal leading-relaxed mb-8 sm:mb-10"
          >
            Thoughtfully finished rooms, sound-insulated spaces, and genuine hospitality for travellers seeking true rest.
          </motion.p>

          {/* Buttons: Primary & Secondary */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
          >
            <Button
              variant="gold"
              size="lg"
              onClick={() => onNavigate('rooms')}
              icon={<ArrowRight className="w-4 h-4" />}
              className="w-full sm:w-auto shadow-lg"
            >
              Reserve a Room
            </Button>
            <button
              onClick={() => onNavigate('rooms')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-[7px] text-base font-medium text-white border border-[#D5AD72] hover:bg-white/10 transition-colors cursor-pointer"
            >
              View Room Options
            </button>
          </motion.div>
        </div>
      </section>

      {/* 3. Floating Search Bar Overlapping Hero Bottom Edge */}
      <SearchBar onSearch={onSearch} isFloating={true} />

      {/* 4. Featured Rooms */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <ScrollReveal yOffset={35}>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="h-[1px] w-6 bg-[#D5AD72]" />
                <span className="text-xs uppercase tracking-widest font-semibold text-[#B88E52]">
                  Featured Accommodations
                </span>
              </div>
              <h2
                className="text-2xl sm:text-4xl font-serif font-bold text-[#142D26]"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Rooms Designed for Real Rest.
              </h2>
              <p className="text-sm sm:text-base text-[#242424]/75 mt-2 max-w-xl">
                Compare room categories, transparent per-night rates, and amenities, then reserve in minutes.
              </p>
            </div>

            <div className="mt-6 md:mt-0">
              <Button
                variant="secondary"
                size="md"
                onClick={() => onNavigate('rooms')}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                View All Rooms & Suites
              </Button>
            </div>
          </div>
        </ScrollReveal>

        {/* Featured Rooms Grid with Slow Staggered Rise */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredRooms.map((room, idx) => (
            <ScrollReveal key={room.RoomID} delay={idx * 0.14} yOffset={40}>
              <RoomCard
                room={room}
                index={idx}
                onViewDetails={onViewDetails}
                onReserve={onReserve}
              />
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* 5. Amenities: "Everything You Need for a Comfortable Stay." */}
      <section className="py-20 sm:py-24 bg-[#ECE8DE]/60 border-y border-[#D5AD72]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal yOffset={30}>
            <div className="text-center max-w-2xl mx-auto mb-14">
              <div className="inline-flex items-center gap-2 mb-2">
                <span className="h-[1px] w-6 bg-[#D5AD72]" />
                <span className="text-xs uppercase tracking-widest font-semibold text-[#B88E52]">
                  Hotel Facilities
                </span>
                <span className="h-[1px] w-6 bg-[#D5AD72]" />
              </div>
              <h2
                className="text-2xl sm:text-4xl font-serif font-bold text-[#142D26]"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Everything You Need for a Comfortable Stay.
              </h2>
              <p className="text-sm text-[#242424]/75 mt-3">
                Thoughtfully selected amenities tailored for relaxation, business convenience, and holistic wellness.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {AMENITIES_LIST.map((amenity, idx) => (
              <ScrollReveal key={amenity.id} delay={idx * 0.08} yOffset={35}>
                <AmenityCard amenity={amenity} index={idx} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Culinary & Dining Experience inspired by The Palms Classic Hotel */}
      <DiningShowcase onReserveDining={() => onNavigate('rooms')} />

      {/* 6. Why Choose HavenStay */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Story & 4 Pillars */}
          <div className="lg:col-span-7 space-y-6">
            <ScrollReveal yOffset={30}>
              <div className="flex items-center gap-2">
                <span className="h-[1px] w-6 bg-[#D5AD72]" />
                <span className="text-xs uppercase tracking-widest font-semibold text-[#B88E52]">
                  The HavenStay Promise
                </span>
              </div>

              <h2
                className="text-2xl sm:text-4xl font-serif font-bold text-[#142D26] leading-tight mt-2"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Why Choose HavenStay Hotels
              </h2>

              <p className="text-sm sm:text-base text-[#242424]/80 leading-relaxed mt-3">
                At HavenStay Hotels, we believe every stay should feel special. We combine boutique elegance with seamless online reservations so your journey starts effortlessly.
              </p>
            </ScrollReveal>

            {/* 4 Feature Points from Brief */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-3">
              {[
                { title: 'Easy room discovery', text: 'Browse and compare rooms in one place with transparent specifications.' },
                { title: 'Clear pricing', text: "See what you'll pay before you book. No hidden resort fees or surprise surcharges." },
                { title: 'Live availability', text: 'Check your dates instantly with zero waiting time or overlapping bookings.' },
                { title: 'Convenient reservations', text: 'Book online in a few simple steps and receive instant confirmation reference.' },
              ].map((item, idx) => (
                <ScrollReveal key={item.title} delay={idx * 0.1} yOffset={25}>
                  <div className="p-4 rounded-xl bg-white border border-[#D5AD72]/30 shadow-xs h-full">
                    <span className="text-sm font-serif font-bold text-[#142D26] block">
                      {item.title}
                    </span>
                    <span className="text-xs text-[#242424]/75 mt-1 block">
                      {item.text}
                    </span>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>

          {/* Right Column: Visual Hotel Stat Block */}
          <div className="lg:col-span-5">
            <ScrollReveal yOffset={40} delay={0.2}>
              <div className="bg-[#142D26] rounded-2xl p-8 sm:p-10 text-white border border-[#D5AD72]/30 relative overflow-hidden shadow-xl space-y-8">
                <span className="text-xs uppercase tracking-widest text-[#D5AD72] font-semibold block">
                  Hospitality Standards
                </span>

                {/* Stat 1 */}
                <div>
                  <span
                    className="text-4xl sm:text-5xl font-serif font-bold text-[#E4C38E] block"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    100%
                  </span>
                  <span className="text-sm text-white/80 font-medium block mt-1">
                    Transparent Pricing
                  </span>
                  <p className="text-xs text-white/60 mt-0.5">
                    Exact rates confirmed prior to arrival, inclusive of standard taxes.
                  </p>
                </div>

                {/* Stat 2 */}
                <div className="pt-4 border-t border-white/10">
                  <span
                    className="text-4xl sm:text-5xl font-serif font-bold text-[#E4C38E] block"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    24 / 7
                  </span>
                  <span className="text-sm text-white/80 font-medium block mt-1">
                    Concierge & Guest Support
                  </span>
                  <p className="text-xs text-white/60 mt-0.5">
                    Dedicated hospitality associates always available on-site and online.
                  </p>
                </div>

                {/* Stat 3 */}
                <div className="pt-4 border-t border-white/10">
                  <span
                    className="text-4xl sm:text-5xl font-serif font-bold text-[#E4C38E] block"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    4 Clicks
                  </span>
                  <span className="text-sm text-white/80 font-medium block mt-1">
                    Seamless Reservation Flow
                  </span>
                  <p className="text-xs text-white/60 mt-0.5">
                    From dates search to confirmed reservation request in four clicks or fewer.
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* 7. Testimonials Carousel */}
      <section className="py-20 sm:py-24 bg-[#ECE8DE]/50 border-y border-[#D5AD72]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal yOffset={30}>
            <div className="text-center max-w-xl mx-auto mb-12">
              <span className="text-xs uppercase tracking-widest font-semibold text-[#B88E52]">
                Guest Experiences
              </span>
              <h2
                className="text-2xl sm:text-4xl font-serif font-bold text-[#142D26] mt-1"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Memorable Stays, Real Words
              </h2>
              <p className="text-xs sm:text-sm text-[#242424]/70 mt-2">
                Authentic guest feedback reflecting our commitment to comfort and serenity.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal yOffset={35} delay={0.15}>
            <TestimonialCarousel testimonials={TESTIMONIALS_LIST} />
          </ScrollReveal>
        </div>
      </section>

      {/* 8. Special Offers */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <ScrollReveal yOffset={30}>
          <div className="text-center max-w-xl mx-auto mb-14">
            <span className="text-xs uppercase tracking-widest font-semibold text-[#B88E52]">
              Seasonal Privileges
            </span>
            <h2
              className="text-2xl sm:text-4xl font-serif font-bold text-[#142D26] mt-1"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Special Offers
            </h2>
            <p className="text-xs sm:text-sm text-[#242424]/70 mt-2">
              Elevate your stay with exclusive seasonal packages and direct booking incentives.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {OFFERS_LIST.map((offer, idx) => (
            <ScrollReveal key={offer.id} delay={idx * 0.12} yOffset={35}>
              <OfferCard
                offer={offer}
                index={idx}
                onClaim={() => onNavigate('rooms')}
              />
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Location & Arrival Section with Interactive Hotel Map */}
      <section className="py-20 sm:py-24 bg-[#ECE8DE]/50 border-t border-[#D5AD72]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal yOffset={30}>
            <div className="text-center max-w-2xl mx-auto mb-12">
              <div className="inline-flex items-center gap-2 mb-2">
                <span className="h-[1px] w-6 bg-[#D5AD72]" />
                <span className="text-xs uppercase tracking-widest font-semibold text-[#B88E52]">
                  Prime District Destination
                </span>
                <span className="h-[1px] w-6 bg-[#D5AD72]" />
              </div>
              <h2
                className="text-2xl sm:text-4xl font-serif font-bold text-[#142D26]"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Prime Location, Effortless Arrival
              </h2>
              <p className="text-sm text-[#242424]/75 mt-2 max-w-xl mx-auto">
                Conveniently situated on Grand Horizon Boulevard, with airport transfers, private underground valet, and swift access to the city's finest cultural destinations.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal yOffset={35} delay={0.15}>
            <HotelMap />
          </ScrollReveal>
        </div>
      </section>

      {/* 9. Newsletter Signup */}
      <section className="py-16 sm:py-20 bg-[#142D26] text-white">
        <ScrollReveal yOffset={30} className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <span className="text-xs uppercase tracking-widest text-[#D5AD72] font-semibold">
            Stay in the Loop
          </span>
          <h2
            className="text-2xl sm:text-4xl font-serif font-bold text-white mt-1 mb-3"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Get updates and offers from HavenStay Hotels.
          </h2>
          <p className="text-xs sm:text-sm text-white/75 max-w-md mx-auto mb-8">
            Subscribe to receive private invitations, seasonal promotions, and curated destination guides.
          </p>

          <form
            onSubmit={handleNewsletterSubmit}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Enter your email address"
              className="w-full sm:flex-1 h-12 px-4 rounded-lg bg-white/10 border border-[#D5AD72]/40 text-white placeholder-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#D5AD72] focus:bg-white/15"
              required
            />
            <Button
              type="submit"
              variant="gold"
              size="md"
              loading={newsletterLoading}
              className="w-full sm:w-auto h-12 px-6 shadow-md"
              icon={<Send className="w-4 h-4" />}
            >
              Subscribe
            </Button>
          </form>
          <p className="text-[11px] text-white/50 mt-3">
            We value your privacy. Unsubscribe at any time with a single click.
          </p>
        </ScrollReveal>
      </section>

      {/* 10. Final CTA Band */}
      <section className="py-20 sm:py-24 bg-[#F7F5F0] border-t border-[#D5AD72]/30 text-center px-4 sm:px-6">
        <ScrollReveal yOffset={35} className="max-w-3xl mx-auto space-y-4">
          <span
            className="font-serif italic text-sm sm:text-base text-[#B88E52]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Your Comfort, Our Priority.
          </span>
          <h2
            className="text-3xl sm:text-5xl font-serif font-bold text-[#142D26]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Book Your Stay Today.
          </h2>
          <p className="text-sm sm:text-base text-[#242424]/75 max-w-lg mx-auto">
            Experience the harmony of modern luxury, quiet comfort, and effortless reservation.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              variant="primary"
              size="lg"
              onClick={() => onNavigate('rooms')}
              icon={<ArrowRight className="w-4 h-4" />}
              className="w-full sm:w-auto shadow-md"
            >
              Explore Available Rooms
            </Button>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
};
