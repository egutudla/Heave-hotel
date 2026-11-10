import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Phone, ChevronRight, MessageCircle } from 'lucide-react';
import { HavenStayLogo } from './HavenStayLogo';
import { Button } from './Button';

interface NavbarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  onOpenBooking?: () => void;
  forceSolid?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activePage,
  onNavigate,
  onOpenBooking,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'rooms', label: 'Rooms' },
    { id: 'dining', label: 'Dining' },
    { id: 'pool-bar', label: 'Pool & Bar' },
    { id: 'events', label: 'Events' },
    { id: 'offers', label: 'Offers' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleNavClick = (pageId: string) => {
    onNavigate(pageId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Floating Curved Pill Capsule Header inspired by The Palms Classic Hotel */}
      <header className="fixed top-3 sm:top-5 left-0 right-0 z-40 px-3 sm:px-6 pointer-events-none transition-all duration-300">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className={`pointer-events-auto max-w-7xl mx-auto rounded-full transition-all duration-300 flex items-center justify-between px-3 sm:px-5 lg:px-6 py-2 sm:py-2.5 ${
            isScrolled
              ? 'bg-[#F7F5F0]/95 backdrop-blur-md shadow-[0_12px_40px_rgba(20,45,38,0.18)] border border-[#D5AD72]/45 scale-[0.99]'
              : 'bg-[#F7F5F0]/90 backdrop-blur-md shadow-[0_8px_32px_rgba(20,45,38,0.12)] border border-[#D5AD72]/35'
          }`}
        >
          {/* Brand Logo on Left */}
          <div className="flex-shrink-0 pl-1">
            <HavenStayLogo
              variant="light"
              size="sm"
              showTagline={false}
              onClick={() => handleNavClick('home')}
              className="cursor-pointer"
            />
          </div>

          {/* Desktop Center Navigation Links */}
          <nav className="hidden lg:flex items-center gap-3.5 xl:gap-5.5">
            {navLinks.map((link) => {
              const isActive = activePage === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`group relative py-1 text-xs lg:text-sm tracking-wide font-medium transition-colors duration-200 cursor-pointer ${
                    isActive
                      ? 'text-[#B88E52] font-semibold'
                      : 'text-[#242424]/85 hover:text-[#142D26]'
                  }`}
                >
                  {link.label}
                  {/* Active / Hover Animated Gold Indicator */}
                  <span
                    className={`absolute bottom-0 left-0 h-[2px] bg-[#D5AD72] transition-all duration-300 ease-out ${
                      isActive ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}
                  />
                </button>
              );
            })}
          </nav>

          {/* Right Action: Metallic Gold Pill "RESERVE" Button */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              onClick={() => {
                if (onOpenBooking) {
                  onOpenBooking();
                } else {
                  handleNavClick('rooms');
                }
              }}
              className="cursor-pointer select-none rounded-full px-4 sm:px-6 py-2 text-xs sm:text-xs uppercase font-semibold tracking-widest text-[#142D26] bg-gradient-to-r from-[#D5AD72] via-[#E4C38E] to-[#B88E52] shadow-sm hover:shadow-md hover:brightness-105 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <span>Reserve</span>
            </button>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-full text-[#142D26] hover:bg-[#142D26]/10 transition-colors cursor-pointer"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </motion.div>
      </header>

      {/* Mobile Drawer Navigation with Staggered Reveal */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-50 bg-[#142D26]/60 backdrop-blur-sm lg:hidden"
            />

            {/* Slide-in Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-xs bg-[#F7F5F0] shadow-2xl p-6 flex flex-col justify-between lg:hidden overflow-y-auto"
            >
              <div>
                {/* Header inside drawer */}
                <div className="flex items-center justify-between pb-6 border-b border-[#D5AD72]/20">
                  <HavenStayLogo
                    variant="light"
                    size="sm"
                    showTagline={false}
                    onClick={() => handleNavClick('home')}
                  />
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 text-[#142D26] hover:bg-[#142D26]/10 rounded-full transition-colors cursor-pointer"
                    aria-label="Close menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Staggered Links */}
                <div className="mt-8 space-y-2">
                  {navLinks.map((link, idx) => {
                    const isActive = activePage === link.id;
                    return (
                      <motion.button
                        key={link.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.08 * (idx + 1), duration: 0.3 }}
                        onClick={() => handleNavClick(link.id)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left text-base font-medium transition-all ${
                          isActive
                            ? 'bg-[#142D26] text-white'
                            : 'text-[#242424] hover:bg-[#142D26]/5'
                        }`}
                      >
                        <span>{link.label}</span>
                        <ChevronRight
                          className={`w-4 h-4 ${
                            isActive ? 'text-[#D5AD72]' : 'text-[#242424]/40'
                          }`}
                        />
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-6 border-t border-[#D5AD72]/20 space-y-4">
                <Button
                  variant="gold"
                  fullWidth
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onOpenBooking) {
                      onOpenBooking();
                    } else {
                      handleNavClick('rooms');
                    }
                  }}
                >
                  Reserve Your Stay
                </Button>

                <div className="pt-2 flex flex-col items-center justify-center gap-2 text-xs">
                  <a
                    href="tel:+2349075772701"
                    className="text-[#142D26] font-medium hover:text-[#B88E52] transition-colors flex items-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#D5AD72]" />
                    <span>Concierge: +234 907 577 2701</span>
                  </a>
                  <a
                    href="https://wa.me/2349075772701"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#25D366] font-medium hover:underline transition-colors flex items-center gap-1.5"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                    <span>WhatsApp Concierge</span>
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
