import React from 'react';

interface EyebrowProps {
  label: string;
  tag?: string;
  className?: string;
}

export function Eyebrow({ label, tag, className = '' }: EyebrowProps) {
  return (
    <div className={`eyebrow-label ${className}`}>
      {tag && (
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#f5efff] shadow-[0_0_8px_#f5efff]" />
      )}
      <span>{label}</span>
    </div>
  );
}
