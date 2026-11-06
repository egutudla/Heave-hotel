import React from 'react';
import { motion } from 'motion/react';
import {
  Wifi,
  Wind,
  UtensilsCrossed,
  Waves,
  Clock,
  Car,
  Coffee,
  ShieldCheck,
  Luggage,
  Sparkles,
} from 'lucide-react';
import { AmenityItem } from '../types';

interface AmenityCardProps {
  amenity: AmenityItem;
  index?: number;
}

// Icon mapper for hotel amenities
const getAmenityIcon = (iconName: string) => {
  switch (iconName.toLowerCase()) {
    case 'wifi':
      return <Wifi className="w-6 h-6" />;
    case 'ac':
    case 'wind':
    case 'air conditioning':
      return <Wind className="w-6 h-6" />;
    case 'restaurant':
    case 'dining':
      return <UtensilsCrossed className="w-6 h-6" />;
    case 'pool':
    case 'swimming pool':
      return <Waves className="w-6 h-6" />;
    case 'reception':
    case 'clock':
    case '24-hour reception':
      return <Clock className="w-6 h-6" />;
    case 'parking':
    case 'car':
      return <Car className="w-6 h-6" />;
    case 'breakfast':
    case 'coffee':
      return <Coffee className="w-6 h-6" />;
    default:
      return <Sparkles className="w-6 h-6" />;
  }
};

export const AmenityCard: React.FC<AmenityCardProps> = ({ amenity, index = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.85, delay: (index % 3) * 0.1, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -3 }}
      className="relative flex flex-col items-start p-6 bg-white rounded-xl border border-[#D5AD72]/20 shadow-[0_4px_16px_rgba(20,45,38,0.03)] hover:shadow-[0_12px_28px_rgba(20,45,38,0.08)] transition-all duration-300"
    >
      {/* Icon with warm gold subtle badge */}
      <div className="w-12 h-12 rounded-lg bg-[#F7F5F0] border border-[#D5AD72]/30 text-[#142D26] flex items-center justify-center mb-4 transition-colors group-hover:bg-[#142D26] group-hover:text-[#D5AD72]">
        {getAmenityIcon(amenity.icon)}
      </div>

      {/* Amenity Title */}
      <h4
        className="text-base sm:text-lg font-serif font-bold text-[#142D26] mb-1.5"
        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
      >
        {amenity.name}
      </h4>

      {/* Description */}
      <p className="text-xs sm:text-sm text-[#242424]/75 leading-relaxed">
        {amenity.description}
      </p>

      {/* Clear Placeholder Label as required by brief */}
      {amenity.isPlaceholder && (
        <div className="mt-4 pt-3 border-t border-[#F7F5F0] w-full">
          <span className="text-[10px] tracking-wider uppercase font-semibold text-[#B88E52]">
            [PLACEHOLDER - Confirm with hotel]
          </span>
        </div>
      )}
    </motion.div>
  );
};
