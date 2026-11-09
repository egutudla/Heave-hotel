import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export interface HotelScene {
  id: string;
  name: string;
  tag: string;
  videoUrl: string;
  posterUrl: string;
  description: string;
}

export const HOTEL_SCENES: HotelScene[] = [
  {
    id: 'overview',
    name: 'Hotel Tour',
    tag: 'Full Experience',
    videoUrl: '/videos/hotel-tour.mp4',
    posterUrl: '/videos/hotel-tour.jpg',
    description: 'Experience refined spaces designed for effortless rest and hospitality.',
  },
  {
    id: 'rooms',
    name: 'Rooms & Suites',
    tag: 'King Beds & Linens',
    videoUrl: '/videos/rooms-suites.mp4',
    posterUrl: '/videos/rooms-suites.jpg',
    description: 'Quiet sanctuaries with Egyptian cotton bedding and spa rainfall showers.',
  },
  {
    id: 'pool',
    name: 'Swimming Pool',
    tag: 'Heated Lap Pool',
    videoUrl: '/videos/swimming-pool.mp4',
    posterUrl: '/videos/swimming-pool.jpg',
    description: 'Pristine temperature-controlled waters with private poolside cabanas.',
  },
  {
    id: 'restaurant',
    name: 'The Restaurant',
    tag: 'Artisan Dining',
    videoUrl: '/videos/restaurant-dining.mp4',
    posterUrl: '/videos/restaurant-dining.jpg',
    description: 'Fresh seasonal continental creations prepared with culinary precision.',
  },
  {
    id: 'bar',
    name: 'Cocktail Bar',
    tag: 'Lounge & Drinks',
    videoUrl: '/videos/cocktail-bar.mp4',
    posterUrl: '/videos/cocktail-bar.jpg',
    description: 'Signature mixology, artisanal spirits, and relaxed evening atmosphere.',
  },
  {
    id: 'presidential',
    name: 'Presidential Suite',
    tag: 'Signature Residence',
    videoUrl: '/videos/gym-fitness.mp4',
    posterUrl: '/videos/gym-fitness.jpg',
    description: 'Bespoke residence with plush king bedroom, living lounge, and freestanding soaking bath.',
  },
];

interface HeroVideoTourProps {
  onSceneChange?: (scene: HotelScene) => void;
}

export const HeroVideoTour: React.FC<HeroVideoTourProps> = ({ onSceneChange }) => {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);

  const currentScene = HOTEL_SCENES[currentSceneIndex];

  // Auto-cycle steadily through hotel spaces every 20 seconds (calm, unhurried pace)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSceneIndex((prev) => (prev + 1) % HOTEL_SCENES.length);
    }, 20000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (onSceneChange) {
      onSceneChange(currentScene);
    }
  }, [currentSceneIndex]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#0D1F1A]">
      {/* 
        Seamless Crossfade Background Video:
        - Mode is simultaneous crossfade (no black flashes, no jitter).
        - Fixed hardware-accelerated transform to prevent any sub-pixel shake.
        - Zero controls, zero sound, zero buttons.
      */}
      <AnimatePresence initial={false}>
        <motion.div
          key={currentScene.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2.8, ease: 'easeInOut' }}
          className="absolute inset-0 w-full h-full transform-gpu"
        >
          {/* Steady Poster Image Underneath Video to Prevent Flashes */}
          <img
            src={currentScene.posterUrl}
            alt={currentScene.name}
            className="absolute inset-0 w-full h-full object-cover filter brightness-85 transform-gpu"
          />

          {/* Autoplaying Silent Video Loop with Gentle 0.75x Playback Rate */}
          <video
            key={currentScene.videoUrl}
            autoPlay
            loop
            muted
            playsInline
            poster={currentScene.posterUrl}
            onLoadedMetadata={(e) => {
              e.currentTarget.playbackRate = 0.75;
            }}
            onPlay={(e) => {
              e.currentTarget.playbackRate = 0.75;
            }}
            className="absolute inset-0 w-full h-full object-cover filter brightness-85 transform-gpu"
          >
            <source src={currentScene.videoUrl} type="video/mp4" />
          </video>
        </motion.div>
      </AnimatePresence>

      {/* Luxury Cinematic Ambient Overlays for Crisp Typography Contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#142D26] via-[#142D26]/55 to-[#0D1F1A]/70 pointer-events-none" />
      <div className="absolute inset-0 bg-black/35 pointer-events-none" />
    </div>
  );
};

