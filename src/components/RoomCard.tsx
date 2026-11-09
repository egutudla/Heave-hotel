import React from 'react';
import { motion } from 'motion/react';
import { Users, Wifi, Wind, Bed, ArrowRight, Sparkles, Check } from 'lucide-react';
import { Room } from '../types';
import { Button } from './Button';
import { formatNaira } from '../utils/currency';

interface RoomCardProps {
  room: Room;
  onViewDetails: (room: Room) => void;
  onReserve: (room: Room) => void;
  index?: number;
}

export const RoomCard: React.FC<RoomCardProps> = ({
  room,
  onViewDetails,
  onReserve,
  index = 0,
}) => {
  // Parse amenities string to array and extract first 3
  const amenityList = room.Amenities
    ? room.Amenities.split(',')
        .map((a) => a.trim())
        .filter(Boolean)
        .slice(0, 3)
    : ['High-speed Wi-Fi', 'Air conditioning', 'Premium linens'];

  return (
    <motion.article
      initial={{ opacity: 0, y: 38 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.85, delay: (index % 3) * 0.12, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4 }}
      className="group flex flex-col bg-white rounded-xl overflow-hidden border border-[#D5AD72]/25 shadow-[0_4px_20px_rgba(20,45,38,0.04)] hover:shadow-[0_16px_36px_rgba(20,45,38,0.12)] transition-all duration-300"
    >
      {/* Room Image Container with 5% zoom on hover */}
      <div className="relative aspect-[16/10] overflow-hidden bg-[#ECE8DE]">
        <img
          src={room.ImageURL || '/images/hotel/deluxe-1.jpg'}
          alt={room.Name}
          loading="lazy"
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement;
            target.onerror = null;
            target.src = '/images/hotel/deluxe-1.jpg';
          }}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Ambient Dark-to-Transparent Gradient Overlay for Image Contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#142D26]/70 via-[#142D26]/10 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

        {/* Room Type Tag - Clean unboxed text with subtle backdrop */}
        <div className="absolute top-3 left-3 bg-[#142D26]/85 backdrop-blur-sm text-white px-3 py-1 rounded-[4px] text-xs font-medium tracking-wide">
          {room.Type}
        </div>

        {/* Price Tag in Bottom Right */}
        <div className="absolute bottom-3 right-3 bg-[#142D26]/90 backdrop-blur-sm px-3.5 py-1.5 rounded-[4px] border border-[#D5AD72]/40 text-right">
          <div className="flex items-baseline gap-1 text-white">
            <span
              className="text-base sm:text-lg font-serif font-bold text-[#E4C38E]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {formatNaira(room.PricePerNight)}
            </span>
            <span className="text-[11px] sm:text-xs text-white/80 font-normal">/ night</span>
          </div>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="flex flex-col flex-1 p-5 sm:p-6 justify-between gap-4">
        <div>
          {/* Unboxed Metadata: Guest Count & Bed Type */}
          <div className="flex items-center gap-2 text-xs text-[#575757] mb-1.5">
            <span className="flex items-center gap-1 font-medium text-[#142D26]">
              <Users className="w-3.5 h-3.5 text-[#B88E52]" />
              Up to {room.MaxGuests} Guests
            </span>
            <span aria-hidden="true" className="text-[#D5AD72]">·</span>
            <span>{room.BedType || 'King / Queen Bed'}</span>
          </div>

          {/* Room Title */}
          <h3
            className="text-xl font-serif font-bold text-[#142D26] group-hover:text-[#B88E52] transition-colors leading-snug"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {room.Name}
          </h3>

          {/* Description snippet */}
          <p className="text-xs sm:text-sm text-[#242424]/75 line-clamp-2 mt-2 leading-relaxed">
            {room.Description}
          </p>
        </div>

        {/* 3 Amenities with Icons - Clean Unboxed Layout */}
        <div className="pt-3 border-t border-[#F7F5F0]">
          <span className="block text-[11px] font-semibold uppercase tracking-wider text-[#142D26]/70 mb-2">
            Selected Highlights
          </span>
          <ul className="grid grid-cols-1 gap-1.5 text-xs text-[#242424]">
            {amenityList.map((amenity, i) => (
              <li key={i} className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#B88E52] flex-shrink-0" />
                <span className="truncate">{amenity}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5 pt-2">
          {/* View Details Button with sliding gold arrow */}
          <button
            onClick={() => onViewDetails(room)}
            className="group/btn relative inline-flex items-center justify-center text-xs sm:text-sm font-medium py-2.5 px-3 rounded-[5px] border border-[#D5AD72] text-[#142D26] hover:bg-[#D5AD72]/15 transition-all duration-200 cursor-pointer overflow-hidden"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1.5 text-[#B88E52] transition-transform duration-300 group-hover/btn:translate-x-1" />
          </button>

          {/* Reserve Now Button */}
          <Button
            variant="primary"
            size="sm"
            onClick={() => onReserve(room)}
            className="shadow-sm"
          >
            Reserve Now
          </Button>
        </div>
      </div>
    </motion.article>
  );
};
