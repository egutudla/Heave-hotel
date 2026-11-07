import React from 'react';
import { Mail, Phone, MapPin, Clock, ArrowUpRight, ArrowUp, MessageCircle } from 'lucide-react';
import { HavenStayLogo } from './HavenStayLogo';

interface FooterProps {
  onNavigate: (page: string) => void;
  onOpenBooking: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onOpenBooking,
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#0D1F1A] text-white border-t border-[#D5AD72]/20 pt-20 pb-10 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-48 bg-radial-gradient from-[#142D26] to-transparent opacity-60 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Navigation & Information Grid matching The Palms Classic Hotel reference */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 pb-16 border-b border-white/10">
          {/* Brand Intro (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <HavenStayLogo variant="dark" size="md" showTagline={true} />
            <p className="text-xs sm:text-sm text-white/70 leading-relaxed pt-2 max-w-sm">
              Discover exceptional stays, thoughtfully designed rooms and memorable hospitality experiences at HavenStay Hotels.
            </p>
            <div className="pt-2">
              <span className="text-xs text-[#D5AD72] italic font-serif">
                "Your Comfort, Our Priority."
              </span>
            </div>
          </div>

          {/* Column 1: Main Navigation (3 cols) */}
          <div className="lg:col-span-3 space-y-3.5 pl-0 lg:pl-6">
            <h4
              className="font-serif font-semibold text-white tracking-wider text-sm uppercase"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Navigation
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-white/75 font-normal">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-[#D5AD72] transition-colors cursor-pointer text-left"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-[#D5AD72] transition-colors cursor-pointer text-left"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('rooms')}
                  className="hover:text-[#D5AD72] transition-colors cursor-pointer text-left"
                >
                  Rooms & Suites
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('dining')}
                  className="hover:text-[#D5AD72] transition-colors cursor-pointer text-left"
                >
                  Sofia Restaurant
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('pool-bar')}
                  className="hover:text-[#D5AD72] transition-colors cursor-pointer text-left"
                >
                  Palms Pool & Sunset Bar
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('events')}
                  className="hover:text-[#D5AD72] transition-colors cursor-pointer text-left"
                >
                  Events & Weddings
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('offers')}
                  className="hover:text-[#D5AD72] transition-colors cursor-pointer text-left"
                >
                  Offers & Packages
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('gallery')}
                  className="hover:text-[#D5AD72] transition-colors cursor-pointer text-left"
                >
                  Visual Gallery
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contact')}
                  className="hover:text-[#D5AD72] transition-colors cursor-pointer text-left"
                >
                  Contact Concierge
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: Experiences & Suites (3 cols) */}
          <div className="lg:col-span-3 space-y-3.5">
            <h4
              className="font-serif font-semibold text-white tracking-wider text-sm uppercase"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Accommodations
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-white/75 font-normal">
              <li>
                <button
                  onClick={() => onNavigate('rooms')}
                  className="hover:text-[#D5AD72] transition-colors cursor-pointer text-left"
                >
                  Deluxe King Room
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('rooms')}
                  className="hover:text-[#D5AD72] transition-colors cursor-pointer text-left"
                >
                  Executive Suite
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('rooms')}
                  className="hover:text-[#D5AD72] transition-colors cursor-pointer text-left"
                >
                  Haven Premier Penthouse
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('rooms')}
                  className="hover:text-[#D5AD72] transition-colors cursor-pointer text-left"
                >
                  Superior Ocean View
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('rooms')}
                  className="hover:text-[#D5AD72] transition-colors cursor-pointer text-left"
                >
                  Family Garden Suite
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('rooms')}
                  className="hover:text-[#D5AD72] transition-colors cursor-pointer text-left"
                >
                  Classic Queen Sanctuary
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact & Direct Location Details (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h4
              className="font-serif font-semibold text-white tracking-wider text-sm uppercase"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Location & Hours
            </h4>
            <div className="space-y-3.5 text-xs sm:text-sm text-white/75 font-normal">
              {/* Address with MapPin */}
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#D5AD72] flex-shrink-0 mt-0.5" />
                <span className="leading-snug">
                  450 Grand Horizon Boulevard, Prime District, Haven City
                </span>
              </div>

              {/* 24/7 Hours with Clock */}
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-[#D5AD72] flex-shrink-0" />
                <span>Reception open 24/7</span>
              </div>

              {/* Phone with Phone Icon */}
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#D5AD72] flex-shrink-0" />
                <a href="tel:+2349075772701" className="hover:text-[#D5AD72] transition-colors">
                  +234 907 577 2701
                </a>
              </div>

              {/* WhatsApp direct link */}
              <div className="flex items-center gap-3">
                <MessageCircle className="w-4 h-4 text-[#25D366] flex-shrink-0" />
                <a
                  href="https://wa.me/2349075772701"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#25D366] transition-colors flex items-center gap-1.5"
                >
                  <span>WhatsApp: +234 907 577 2701</span>
                </a>
              </div>

              {/* Get Directions Link matching reference */}
              <div className="pt-1">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('450 Grand Horizon Boulevard, Prime District, Haven City')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-[#D5AD72] hover:text-white transition-colors cursor-pointer"
                >
                  <span>Get directions</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* 
          MONUMENTAL WATERMARK BRANDING: "HAVENSTAY"
          Inspired directly by "THE PALMS" in the screenshot!
          Fills the width with massive, ghost-metallic serif typography.
        */}
        <div className="w-full text-center overflow-hidden py-10 sm:py-14 select-none pointer-events-none">
          <span
            className="text-[11vw] sm:text-[12.5vw] font-serif font-bold tracking-[0.18em] uppercase text-[#D5AD72]/10 leading-none whitespace-nowrap block"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            HAVENSTAY
          </span>
        </div>

        {/* Bottom Sub-bar with Copyright, Policies, and Back to Top pill */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-white/60 gap-4">
          <p>© {new Date().getFullYear()} HavenStay Hotels. All rights reserved.</p>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <span className="hover:text-white transition-colors cursor-pointer">Privacy Policy</span>
            <span aria-hidden="true" className="text-white/25">·</span>
            <span className="hover:text-white transition-colors cursor-pointer">Cookie Policy</span>
          </div>

          {/* Back to top pill button matching reference */}
          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-white/20 hover:border-[#D5AD72] text-white/80 hover:text-white transition-all text-xs cursor-pointer bg-white/5 hover:bg-white/10 shadow-xs"
            aria-label="Scroll back to top of page"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5 text-[#D5AD72]" />
          </button>
        </div>
      </div>
    </footer>
  );
};
