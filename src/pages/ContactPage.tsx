import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, Navigation, MessageCircle, ArrowUpRight } from 'lucide-react';
import { Button } from '../components/Button';
import { useToast } from '../components/Toast';
import { HotelMap } from '../components/HotelMap';
import { ScrollReveal } from '../components/ScrollReveal';

interface ContactPageProps {
  onNavigate: (page: string) => void;
  onOpenBooking: () => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onNavigate, onOpenBooking }) => {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      showToast('Please complete all required fields.', 'error');
      return;
    }

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setLoading(false);
    setSubmitted(true);
    showToast('Your message has been sent to the HavenStay concierge team.', 'success');
  };

  return (
    <div className="pt-24 sm:pt-28 pb-20">
      {/* Header Banner with Hospitality Video Background */}
      <section className="relative min-h-[48vh] sm:min-h-[54vh] flex items-center justify-center overflow-hidden bg-[#0D1F1A] text-white px-4 sm:px-6 border-b border-[#D5AD72]/20 text-center">
        {/* Full-width hospitality & concierge video background */}
        <div className="absolute inset-0 overflow-hidden z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            poster="/videos/cocktail-bar.jpg"
            className="w-full h-full object-cover origin-center opacity-65 filter brightness-85 transform-gpu"
          >
            <source
              src="/videos/cocktail-bar.mp4"
              type="video/mp4"
            />
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-[#142D26] via-[#142D26]/65 to-[#0D1F1A]/75" />
          <div className="absolute inset-0 bg-black/35" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto space-y-3 pt-16 pb-12">
          <div className="inline-flex items-center gap-2">
            <span className="h-[1px] w-6 bg-[#D5AD72]" />
            <span
              className="text-xs sm:text-sm font-serif italic text-[#D5AD72]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Guest Relations
            </span>
            <span className="h-[1px] w-6 bg-[#D5AD72]" />
          </div>
          <h1
            className="text-3xl sm:text-5xl md:text-6xl font-serif font-bold tracking-tight text-white"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            We're Here to Help
          </h1>
          <p className="text-sm sm:text-base text-white/80 max-w-lg mx-auto">
            Whether inquiring about group bookings, special requests, or itinerary guidance, our team is at your service.
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Contact Details (5 cols) */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <h2
                className="text-2xl font-serif font-bold text-[#142D26]"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Reach Out Directly
              </h2>
              <p className="text-xs sm:text-sm text-[#242424]/75 mt-1">
                Our front desk and concierge team operate around the clock.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-[#D5AD72]/30 shadow-xs">
                <div className="w-10 h-10 rounded-lg bg-[#F7F5F0] flex items-center justify-center text-[#B88E52] flex-shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="text-xs sm:text-sm">
                  <span className="font-semibold text-[#142D26] block">Physical Address</span>
                  <span className="text-[#575757]">
                    450 Grand Horizon Boulevard, Prime District, Haven City
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-[#D5AD72]/30 shadow-xs">
                <div className="w-10 h-10 rounded-lg bg-[#F7F5F0] flex items-center justify-center text-[#B88E52] flex-shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="text-xs sm:text-sm">
                  <span className="font-semibold text-[#142D26] block">Telephone</span>
                  <a href="tel:+2349075772701" className="text-[#142D26] font-medium block hover:text-[#B88E52] transition-colors">
                    +234 907 577 2701
                  </a>
                  <span className="text-[11px] text-[#B88E52]">Direct line & 24/7 reception</span>
                </div>
              </div>

              {/* WhatsApp Concierge */}
              <div className="flex items-start gap-4 p-4 rounded-xl bg-[#142D26] text-white border border-[#D5AD72]/40 shadow-xs">
                <div className="w-10 h-10 rounded-lg bg-[#25D366]/20 flex items-center justify-center text-[#25D366] flex-shrink-0">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div className="text-xs sm:text-sm flex-1">
                  <span className="font-semibold text-white block">WhatsApp Chat</span>
                  <span className="text-white/80 block">+234 907 577 2701</span>
                  <div className="pt-2">
                    <a
                      href="https://wa.me/2349075772701"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#25D366] text-white text-xs font-semibold hover:bg-[#20ba59] transition-colors shadow-xs"
                    >
                      <span>Message on WhatsApp</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-[#D5AD72]/30 shadow-xs">
                <div className="w-10 h-10 rounded-lg bg-[#F7F5F0] flex items-center justify-center text-[#B88E52] flex-shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="text-xs sm:text-sm">
                  <span className="font-semibold text-[#142D26] block">Electronic Inquiries</span>
                  <span className="text-[#575757] block">concierge@havenstayhotels.com</span>
                  <span className="text-[#575757] block">reservations@havenstayhotels.com</span>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-[#D5AD72]/30 shadow-xs">
                <div className="w-10 h-10 rounded-lg bg-[#F7F5F0] flex items-center justify-center text-[#B88E52] flex-shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="text-xs sm:text-sm">
                  <span className="font-semibold text-[#142D26] block">Reception & Check-in</span>
                  <span className="text-[#575757] block">Check-in: 3:00 PM onwards</span>
                  <span className="text-[#575757] block">Check-out: 11:00 AM</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-8 sm:p-10 border border-[#D5AD72]/40 shadow-sm">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-14 h-14 mx-auto rounded-full bg-[#142D26] text-[#D5AD72] flex items-center justify-center shadow-md">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3
                  className="text-2xl font-serif font-bold text-[#142D26]"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  Message Dispatched
                </h3>
                <p className="text-sm text-[#575757] max-w-sm mx-auto">
                  Thank you for writing to HavenStay Hotels. A guest representative will respond to your inquiry shortly.
                </p>
                <div className="pt-4">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setSubmitted(false);
                      setName('');
                      setEmail('');
                      setPhone('');
                      setMessage('');
                    }}
                  >
                    Send Another Message
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3
                  className="text-xl font-serif font-bold text-[#142D26] mb-2"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  Send a Direct Message
                </h3>

                <div>
                  <label htmlFor="contact-name" className="block text-xs font-semibold uppercase text-[#142D26] mb-1">
                    Your Name
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Julian Montgomery"
                    required
                    className="w-full h-11 px-3.5 bg-[#F7F5F0] border border-[#D5AD72]/40 rounded-lg text-sm text-[#242424] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D5AD72]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-email" className="block text-xs font-semibold uppercase text-[#142D26] mb-1">
                      Email Address
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="julian@example.com"
                      required
                      className="w-full h-11 px-3.5 bg-[#F7F5F0] border border-[#D5AD72]/40 rounded-lg text-sm text-[#242424] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D5AD72]"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-phone" className="block text-xs font-semibold uppercase text-[#142D26] mb-1">
                      Phone Number
                    </label>
                    <input
                      id="contact-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 019-2834"
                      className="w-full h-11 px-3.5 bg-[#F7F5F0] border border-[#D5AD72]/40 rounded-lg text-sm text-[#242424] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D5AD72]"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-message" className="block text-xs font-semibold uppercase text-[#142D26] mb-1">
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="How can our hospitality team assist your upcoming stay?"
                    required
                    className="w-full p-3 bg-[#F7F5F0] border border-[#D5AD72]/40 rounded-lg text-sm text-[#242424] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D5AD72]"
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    loading={loading}
                    fullWidth
                    size="md"
                    icon={<Send className="w-4 h-4" />}
                  >
                    Send Message
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Location & Map Section */}
        <div className="mt-16 sm:mt-24 pt-12 border-t border-[#D5AD72]/20">
          <ScrollReveal yOffset={30}>
            <div className="text-center max-w-xl mx-auto mb-10">
              <div className="inline-flex items-center gap-2 mb-2">
                <span className="h-[1px] w-6 bg-[#D5AD72]" />
                <span className="text-xs uppercase tracking-widest font-semibold text-[#B88E52]">
                  Find HavenStay Hotels
                </span>
                <span className="h-[1px] w-6 bg-[#D5AD72]" />
              </div>
              <h2
                className="text-2xl sm:text-4xl font-serif font-bold text-[#142D26]"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Prime Location, Effortless Arrival
              </h2>
              <p className="text-xs sm:text-sm text-[#242424]/75 mt-2">
                Nestled on Grand Horizon Boulevard in the serene Prime District, with seamless connections to airports, railway, and cultural landmarks.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal yOffset={35} delay={0.15}>
            <HotelMap />
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
};
