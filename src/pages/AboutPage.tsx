import React from 'react';
import { motion } from 'motion/react';
import { Heart, Compass, Eye, Users, ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from '../components/Button';

interface AboutPageProps {
  onNavigate: (page: string) => void;
  onOpenBooking: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate, onOpenBooking }) => {
  return (
    <div className="pt-24 sm:pt-28 pb-20">
      {/* Header Banner with Architectural Video Background */}
      <section className="relative min-h-[48vh] sm:min-h-[54vh] flex items-center justify-center overflow-hidden bg-[#0D1F1A] text-white px-4 sm:px-6 border-b border-[#D5AD72]/20">
        {/* Full-width architectural & lobby video background */}
        <div className="absolute inset-0 overflow-hidden z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            poster="/videos/hotel-tour.jpg"
            className="w-full h-full object-cover origin-center opacity-65 filter brightness-85 transform-gpu"
          >
            <source
              src="/videos/hotel-tour.mp4"
              type="video/mp4"
            />
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-[#142D26] via-[#142D26]/65 to-[#0D1F1A]/75" />
          <div className="absolute inset-0 bg-black/30" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-4 pt-16 pb-12">
          <div className="inline-flex items-center gap-2">
            <span className="h-[1px] w-6 bg-[#D5AD72]" />
            <span
              className="text-xs sm:text-sm font-serif italic text-[#D5AD72]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Our Story & Philosophy
            </span>
            <span className="h-[1px] w-6 bg-[#D5AD72]" />
          </div>
          <h1
            className="text-3xl sm:text-5xl md:text-6xl font-serif font-bold tracking-tight text-white"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            About HavenStay Hotels
          </h1>
          <p
            className="font-serif italic text-base sm:text-lg text-[#E4C38E]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            "Your Comfort, Our Priority."
          </p>
        </div>
      </section>

      {/* Main Narrative & Pillars */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        {/* Core Belief */}
        <div className="bg-white rounded-2xl p-8 sm:p-12 border border-[#D5AD72]/30 shadow-xs text-center max-w-3xl mx-auto">
          <span className="text-xs uppercase tracking-widest font-semibold text-[#B88E52] block mb-2">
            Our Core Belief
          </span>
          <p
            className="text-xl sm:text-2xl font-serif text-[#142D26] leading-relaxed"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            At HavenStay Hotels, we believe every stay should feel special. We are committed to making your accommodation experience comfortable, convenient and memorable.
          </p>
        </div>

        {/* Mission & Vision Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl p-8 border border-[#D5AD72]/30 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-lg bg-[#F7F5F0] border border-[#D5AD72]/30 text-[#142D26] flex items-center justify-center">
              <Compass className="w-6 h-6 text-[#B88E52]" />
            </div>
            <h3
              className="text-xl font-serif font-bold text-[#142D26]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Our Mission
            </h3>
            <p className="text-sm text-[#242424]/80 leading-relaxed">
              To make hotel reservations simple, convenient and accessible by connecting travellers with quality accommodation.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 border border-[#D5AD72]/30 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-lg bg-[#F7F5F0] border border-[#D5AD72]/30 text-[#142D26] flex items-center justify-center">
              <Eye className="w-6 h-6 text-[#B88E52]" />
            </div>
            <h3
              className="text-xl font-serif font-bold text-[#142D26]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Our Vision
            </h3>
            <p className="text-sm text-[#242424]/80 leading-relaxed">
              To become a trusted accommodation booking platform known for convenience, transparency and an excellent customer experience.
            </p>
          </div>
        </div>

        {/* Who We Welcome */}
        <div className="bg-[#ECE8DE]/60 rounded-2xl p-8 sm:p-12 border border-[#D5AD72]/30">
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="text-xs uppercase tracking-widest font-semibold text-[#B88E52]">
              Inclusive Hospitality
            </span>
            <h3
              className="text-2xl font-serif font-bold text-[#142D26] mt-1"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Who We Welcome
            </h3>
            <p className="text-xs sm:text-sm text-[#242424]/75 mt-1">
              Thoughtfully curated accommodations tailored for diverse lifestyles and journeys.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 text-center">
            {['Tourists', 'Business Travellers', 'Couples', 'Families', 'Students'].map((item) => (
              <div
                key={item}
                className="p-4 rounded-xl bg-white border border-[#D5AD72]/30 shadow-xs"
              >
                <Users className="w-5 h-5 text-[#B88E52] mx-auto mb-2" />
                <span className="text-xs font-semibold text-[#142D26] block">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center pt-8 space-y-4">
          <h3
            className="text-2xl sm:text-3xl font-serif font-bold text-[#142D26]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Ready to Experience HavenStay?
          </h3>
          <div className="flex justify-center gap-4">
            <Button
              variant="primary"
              size="md"
              onClick={() => onNavigate('rooms')}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Explore Rooms & Suites
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
