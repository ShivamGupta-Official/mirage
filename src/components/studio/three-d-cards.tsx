'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

interface ThreeDContextType {
  hoveredIndex: number | null;
  setHoveredIndex: (idx: number | null) => void;
  isTouchDevice: boolean;
}

const ThreeDContext = createContext<ThreeDContextType>({
  hoveredIndex: null,
  setHoveredIndex: () => {},
  isTouchDevice: false,
});

// Soft, weighted spring physics exactly modeled after Framer 3D card animation (TUofVpSz6.js)
const framerSpring = {
  type: 'spring' as const,
  damping: 38,
  stiffness: 340,
  mass: 1.4,
};

interface ThreeDCardDeckProps {
  children: React.ReactNode;
  className?: string;
  perspective?: number;
}

export function ThreeDCardDeck({
  children,
  className,
  perspective = 1300,
}: ThreeDCardDeckProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  return (
    <ThreeDContext.Provider
      value={{ hoveredIndex, setHoveredIndex, isTouchDevice }}
    >
      <div
        className={cn('relative w-full', className)}
        style={{ perspective: `${perspective}px` }}
        onMouseLeave={() => setHoveredIndex(null)}
      >
        {children}
      </div>
    </ThreeDContext.Provider>
  );
}

interface ThreeDCardItemProps {
  index: number;
  children: React.ReactNode;
  className?: string;
  initialRotateX?: number;
  initialRotateY?: number;
  hoverScale?: number;
  onClick?: () => void;
}

export function ThreeDCardItem({
  index,
  children,
  className,
  initialRotateX = -16,
  initialRotateY = -26,
  hoverScale = 1.08,
  onClick,
}: ThreeDCardItemProps) {
  const { hoveredIndex, setHoveredIndex, isTouchDevice } =
    useContext(ThreeDContext);

  const isHovered = hoveredIndex === index;
  const isAnyHovered = hoveredIndex !== null;
  const isDimmed = isAnyHovered && !isHovered;

  // On touch devices keep flat for legibility, otherwise apply Framer 3D isometric angles
  const targetRotateX = isTouchDevice || isHovered ? 0 : initialRotateX;
  const targetRotateY = isTouchDevice || isHovered ? 0 : initialRotateY;
  const targetScale = isHovered ? hoverScale : isDimmed ? 0.97 : 1;
  const targetZ = isHovered ? 45 : 0;
  const targetBrightness = isDimmed ? 0.42 : 1;
  const targetOpacity = isDimmed ? 0.60 : 1;
  const zIndex = isHovered ? 40 : 10 - index;

  return (
    <motion.div
      className={cn('relative cursor-pointer select-none', className)}
      style={{
        transformStyle: 'preserve-3d',
        zIndex,
      }}
      animate={{
        rotateX: targetRotateX,
        rotateY: targetRotateY,
        scale: targetScale,
        z: targetZ,
        filter: `brightness(${targetBrightness})`,
        opacity: targetOpacity,
      }}
      transition={framerSpring}
      onMouseEnter={() => !isTouchDevice && setHoveredIndex(index)}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}

export default ThreeDCardDeck;
