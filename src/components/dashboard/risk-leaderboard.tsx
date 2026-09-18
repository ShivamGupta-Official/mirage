'use client';

import Link from 'next/link';
import { Server, ArrowRight, ShieldAlert, ChevronRight } from 'lucide-react';
import type { HostRisk } from '@/types';
import { cn } from '@/lib/utils';

interface RiskLeaderboardProps {
  hosts: HostRisk[];
  onSelectHost?: (hostId: string) => void;
  className?: string;
}

export function RiskLeaderboard({ hosts, onSelectHost, className }: RiskLeaderboardProps) {
  const sortedHosts = [...hosts].sort((a, b) => b.riskScore - a.riskScore).slice(0, 5);

  return (
    <div className={cn('p-6 rounded-2xl bg-[#0f0e17]/80 border border-[#f5efff]/[0.08] backdrop-blur-xl shadow-xl space-y-4', className)}>
      <div className="flex items-center justify-between pb-3 border-b border-[#f5efff]/[0.08]">
        <div className="flex items-center gap-2.5">
          <Server size={15} className="text-[#f5efff]/70" />
          <h2 className="font-editorial text-lg font-light text-[#f5efff] tracking-wide">
            Host Risk Leaderboard
          </h2>
        </div>
        <Link
          href="/hosts"
          className="text-xs font-mono text-[#f5efff]/50 hover:text-[#f5efff] flex items-center gap-1 transition-colors"
        >
          View all <ChevronRight size={13} />
        </Link>
      </div>

      <div className="space-y-2.5">
        {sortedHosts.length > 0 ? (
          sortedHosts.map((h) => {
            const risk = h.riskScore;
            const barColor =
              risk >= 85 ? '#f43f5e' : risk >= 70 ? '#fb923c' : risk >= 40 ? '#facc15' : '#34d399';

            return (
              <div
                key={h.id}
                onClick={() => onSelectHost?.(h.id)}
                className="p-3 rounded-xl bg-[#f5efff]/[0.02] border border-[#f5efff]/[0.05] hover:border-[#f5efff]/[0.15] hover:bg-[#f5efff]/[0.04] transition-all cursor-pointer space-y-2 overflow-hidden"
              >
                <div className="flex items-center justify-between text-xs font-mono gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="font-semibold text-[#f5efff] flex-shrink-0">{h.ip}</span>
                    <span className="text-[#f5efff]/40 text-[11px] truncate flex-1 min-w-0">{h.hostname || 'Endpoint'}</span>
                  </div>
                  <span className="font-bold text-[11px] flex-shrink-0" style={{ color: barColor }}>
                    {risk.toFixed(1)}/100
                  </span>
                </div>

                <div className="w-full h-1 rounded-full bg-[#f5efff]/10 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, risk)}%`, backgroundColor: barColor }}
                  />
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-6 text-center text-xs font-mono text-[#f5efff]/40">
            No active host telemetry. Launch a scenario in the Cyber Range to observe scores.
          </div>
        )}
      </div>
    </div>
  );
}
