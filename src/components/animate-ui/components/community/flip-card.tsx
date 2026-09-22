/* eslint-disable @next/next/no-img-element */
'use client';

import { Button } from '@/components/ui/button';
import { easeOut, motion } from 'motion/react';
import * as React from 'react';
import { Github, Linkedin, Twitter } from 'lucide-react';

export interface FlipCardData {
  name: string;
  username: string;
  image: string;
  bio: string;
  stats: {
    following: number;
    followers: number;
    posts?: number;
  };
  socialLinks?: {
    linkedin?: string;
    github?: string;
    twitter?: string;
  };
}

interface FlipCardProps {
  data: FlipCardData;
}

export function FlipCard({ data }: FlipCardProps) {
  const [isFlipped, setIsFlipped] = React.useState(false);

  const isTouchDevice =
    typeof window !== 'undefined' && 'ontouchstart' in window;

  const handleClick = () => {
    if (isTouchDevice) setIsFlipped(!isFlipped);
  };

  const handleMouseEnter = () => {
    if (!isTouchDevice) setIsFlipped(true);
  };

  const handleMouseLeave = () => {
    if (!isTouchDevice) setIsFlipped(false);
  };

  const cardVariants = {
    front: { rotateY: 0, transition: { duration: 0.5, ease: easeOut } },
    back: { rotateY: 180, transition: { duration: 0.5, ease: easeOut } },
  };

  return (
    <div
      className="mt-2 relative w-40 h-60 md:w-60 md:h-80 cursor-pointer mx-auto"
      style={{ perspective: '1000px' }}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* FRONT: Profile */}
      <motion.div
        className="absolute inset-0 rounded-xl border border-white/15 px-4 py-6 flex flex-col items-center justify-center bg-gradient-to-br from-[#121120] via-[#0c0b14] to-[#08080c] text-center shadow-2xl"
        animate={isFlipped ? 'back' : 'front'}
        variants={cardVariants}
        style={{
          transformStyle: 'preserve-3d',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
        }}
      >
        <img
          src={data.image}
          alt={data.name}
          className="size-20 md:size-24 rounded-full object-cover mb-4 border border-white/20 shadow-xl"
        />
        <h2 className="text-lg font-bold text-white tracking-wide">{data.name}</h2>
        <p className="text-sm text-zinc-400 font-mono">@{data.username}</p>
      </motion.div>

      {/* BACK: Bio + Stats + Socials */}
      <motion.div
        className="absolute inset-0 rounded-xl border border-white/15 px-4 py-6 flex flex-col justify-between items-center gap-y-4 bg-gradient-to-tr from-[#121120] via-[#0c0b14] to-[#08080c] text-white shadow-2xl"
        initial={{ rotateY: 180 }}
        animate={isFlipped ? 'front' : 'back'}
        variants={cardVariants}
        style={{
          transformStyle: 'preserve-3d',
          rotateY: 180,
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
        }}
      >
        <p className="text-xs md:text-sm text-zinc-300 text-center leading-relaxed">
          {data.bio}
        </p>

        <div className="px-4 flex items-center justify-between w-full font-mono text-center">
          <div>
            <p className="text-sm font-bold text-white">{data.stats.following}</p>
            <p className="text-[10px] text-zinc-400 uppercase">Following</p>
          </div>
          <div>
            <p className="text-sm font-bold text-white">{data.stats.followers}</p>
            <p className="text-[10px] text-zinc-400 uppercase">Followers</p>
          </div>
          {data.stats.posts && (
            <div>
              <p className="text-sm font-bold text-white">{data.stats.posts}</p>
              <p className="text-[10px] text-zinc-400 uppercase">Posts</p>
            </div>
          )}
        </div>

        {/* Social Media Icons */}
        <div className="flex items-center justify-center gap-4 text-zinc-400">
          {data.socialLinks?.linkedin && (
            <a
              href={data.socialLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white hover:scale-110 transition-all"
            >
              <Linkedin size={18} />
            </a>
          )}
          {data.socialLinks?.github && (
            <a
              href={data.socialLinks.github}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white hover:scale-110 transition-all"
            >
              <Github size={18} />
            </a>
          )}
          {data.socialLinks?.twitter && (
            <a
              href={data.socialLinks.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white hover:scale-110 transition-all"
            >
              <Twitter size={18} />
            </a>
          )}
        </div>

        <Button className="w-full bg-white hover:bg-zinc-200 text-zinc-950 font-medium text-xs py-2 rounded-lg transition-colors">
          Follow
        </Button>
      </motion.div>
    </div>
  );
}

export default FlipCard;
