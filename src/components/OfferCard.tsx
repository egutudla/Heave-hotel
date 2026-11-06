import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { OfferItem } from '../types';
import { Button } from './Button';

interface OfferCardProps {
  offer: OfferItem;
  onClaim: (offer: OfferItem) => void;
  index?: number;
}

export const OfferCard: React.FC<OfferCardProps> = ({
  offer,
  onClaim,
  index = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.85, delay: (index % 3) * 0.12, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4 }}
      className="group relative flex flex-col justify-between overflow-hidden rounded-xl bg-white border border-[#D5AD72]/30 shadow-[0_4px_20px_rgba(20,45,38,0.04)] hover:shadow-[0_16px_36px_rgba(20,45,38,0.1)] transition-all duration-300"
    >
      {/* Background Image Header */}
      <div className="relative aspect-[16/9] overflow-hidden bg-[#ECE8DE]">
        <img
          src={offer.imageUrl}
          alt={offer.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#142D26]/80 via-transparent to-transparent" />

        {/* Badge Tag */}
        <div className="absolute top-3 left-3 bg-[#D5AD72] text-[#142D26] px-3 py-1 rounded-[4px] text-xs font-semibold tracking-wider uppercase shadow-sm">
          {offer.badge}
        </div>
      </div>

      {/* Offer Body */}
      <div className="flex flex-col flex-1 p-6 justify-between gap-4">
        <div>
          <h3
            className="text-lg sm:text-xl font-serif font-bold text-[#142D26] group-hover:text-[#B88E52] transition-colors"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {offer.title}
          </h3>
          <p className="text-xs sm:text-sm text-[#242424]/80 mt-2 leading-relaxed">
            {offer.description}
          </p>
        </div>

        {/* Footer info & CTA */}
        <div className="pt-3 border-t border-[#F7F5F0]">
          <div className="flex items-center justify-between text-xs text-[#575757] mb-3">
            <span>{offer.terms}</span>
          </div>

          {offer.isPlaceholder && (
            <div className="mb-3">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#B88E52]">
                [PLACEHOLDER - Seasonal Offer]
              </span>
            </div>
          )}

          <Button
            variant="secondary"
            fullWidth
            size="sm"
            onClick={() => onClaim(offer)}
            icon={<ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />}
          >
            View Offer Details
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
