import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  MapPin,
  Navigation,
  Compass,
  Car,
  Plane,
  Train,
  ExternalLink,
  Copy,
  Check,
  Maximize2,
} from 'lucide-react';
import { Button } from './Button';
import { useToast } from './Toast';

interface HotelMapProps {
  className?: string;
  showTransitDetails?: boolean;
}

export const HotelMap: React.FC<HotelMapProps> = ({
  className = '',
  showTransitDetails = true,
}) => {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);
  const [mapStyle, setMapStyle] = useState<'streets' | 'satellite'>('streets');

  const hotelAddress = '450 Grand Horizon Boulevard, Prime District, Haven City';
  const googleMapsDirectionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    hotelAddress
  )}`;

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(hotelAddress);
    setCopied(true);
    showToast('Hotel address copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className={`w-full ${className}`} id="location-map">
      {/* Map Card Container */}
      <div className="relative rounded-[24px] sm:rounded-[32px] overflow-hidden border border-[#D5AD72]/40 shadow-[0_16px_48px_rgba(20,45,38,0.12)] bg-[#0D1F1A]">
        {/* Interactive Responsive Map Iframe (OpenStreetMap high-res styled view) */}
        <div className="relative aspect-[16/10] sm:aspect-[21/9] min-h-[380px] sm:min-h-[460px] w-full overflow-hidden">
          <iframe
            title="HavenStay Hotels Location Map"
            width="100%"
            height="100%"
            frameBorder="0"
            scrolling="no"
            marginHeight={0}
            marginWidth={0}
            src="https://www.openstreetmap.org/export/embed.html?bbox=5.5900%2C6.3200%2C5.6250%2C6.3500&amp;layer=mapnik&amp;marker=6.3350%2C5.6037"
            className="w-full h-full filter contrast-[1.05] brightness-[0.92] grayscale-[0.25]"
            loading="lazy"
          />

          {/* Ambient Vignette Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#142D26]/75 via-transparent to-[#142D26]/30 pointer-events-none" />

          {/* Luxury Pin Marker with Pulsing Ring */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20 flex flex-col items-center">
            {/* Glowing Pulse */}
            <span className="relative flex h-10 w-10">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D5AD72] opacity-60"></span>
              <span className="relative inline-flex rounded-full h-10 w-10 bg-[#142D26] border-2 border-[#D5AD72] shadow-2xl items-center justify-center text-[#D5AD72]">
                <MapPin className="w-5 h-5 fill-[#D5AD72]" />
              </span>
            </span>

            {/* Pin Badge */}
            <div className="mt-2 bg-[#142D26]/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#D5AD72]/60 shadow-xl text-center whitespace-nowrap">
              <span
                className="font-serif font-bold text-xs text-white tracking-wide block"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                HavenStay Hotels
              </span>
              <span className="text-[10px] text-[#D5AD72] font-medium tracking-wider uppercase block">
                Prime District Sanctuary
              </span>
            </div>
          </div>

          {/* Floating Information Overlay Box (Top Left / Bottom Left on Mobile) */}
          <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 max-w-sm w-[calc(100%-2rem)] sm:w-auto pointer-events-auto">
            <div className="bg-[#142D26]/95 backdrop-blur-md rounded-2xl p-5 border border-[#D5AD72]/40 shadow-2xl text-white space-y-3.5">
              <div>
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-[#D5AD72] font-semibold">
                  <Compass className="w-3.5 h-3.5" />
                  <span>Hotel Coordinates</span>
                </div>
                <h4
                  className="text-lg font-serif font-bold text-white mt-0.5"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  HavenStay Luxury Sanctuary
                </h4>
                <p className="text-xs text-white/75 mt-1 leading-relaxed">
                  {hotelAddress}
                </p>
              </div>

              {/* Action Buttons: Directions & Copy */}
              <div className="pt-2 border-t border-white/10 flex items-center gap-2">
                <a
                  href={googleMapsDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#D5AD72] text-[#142D26] font-semibold text-xs hover:bg-[#E4C38E] transition-all shadow-sm cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Open in Maps</span>
                </a>

                <button
                  onClick={handleCopyAddress}
                  className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                  title="Copy physical address"
                  aria-label="Copy physical address"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-[#D5AD72]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Transit & Arrival Guide Bottom Panel */}
        {showTransitDetails && (
          <div className="bg-[#142D26] p-6 sm:p-8 border-t border-[#D5AD72]/30 text-white">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Airport Transfer */}
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-[#D5AD72]/30 flex items-center justify-center text-[#D5AD72] flex-shrink-0">
                  <Plane className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wider font-semibold text-[#D5AD72] block">
                    Airport Transfer
                  </span>
                  <span className="text-sm font-semibold text-white block mt-0.5">
                    20 – 25 Minutes
                  </span>
                  <p className="text-xs text-white/60 mt-1">
                    Complimentary executive chauffeur available upon advance reservation request.
                  </p>
                </div>
              </div>

              {/* Central Rail & Transit */}
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-[#D5AD72]/30 flex items-center justify-center text-[#D5AD72] flex-shrink-0">
                  <Train className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wider font-semibold text-[#D5AD72] block">
                    Central Station
                  </span>
                  <span className="text-sm font-semibold text-white block mt-0.5">
                    10 Minutes
                  </span>
                  <p className="text-xs text-white/60 mt-1">
                    Direct access via Prime Boulevard express line and local taxi stand.
                  </p>
                </div>
              </div>

              {/* Private Valet & EV */}
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-[#D5AD72]/30 flex items-center justify-center text-[#D5AD72] flex-shrink-0">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wider font-semibold text-[#D5AD72] block">
                    Valet & Parking
                  </span>
                  <span className="text-sm font-semibold text-white block mt-0.5">
                    On-Site 24/7
                  </span>
                  <p className="text-xs text-white/60 mt-1">
                    Covered secure underground garage with high-speed EV charging stations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
