'use client';

import { useEffect, useRef } from 'react';
import { Activity, CircleAlert } from 'lucide-react';
import type { ThreatEventDisplay } from '@/types';
import { cn } from '@/lib/utils';

const SEVERITY_CONFIG = {
  INFO:     { color: '#60a5fa', bg: 'rgba(96,165,250,0.08)',  label: 'INFO'     },
  LOW:      { color: '#60a5fa', bg: 'rgba(96,165,250,0.08)',  label: 'LOW'      },
  MEDIUM:   { color: '#fbbf24', bg: 'rgba(251,191,36,0.08)',  label: 'MED'      },
  HIGH:     { color: '#f97316', bg: 'rgba(249,115,22,0.08)',  label: 'HIGH'     },
  CRITICAL: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',    label: 'CRIT'     },
};

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    });
  } catch {
    return '--:--:--';
  }
}

interface ThreatStreamProps {
  events: ThreatEventDisplay[];
}

export function ThreatStream({ events }: ThreatStreamProps) {
  const listRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to top (newest) when new events arrive
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [events.length]);

  return (
    <div
      className="p-5 rounded-2xl bg-[#0f0e17]/80 border border-[#f5efff]/[0.08] backdrop-blur-xl flex flex-col shadow-xl"
      style={{ maxHeight: '440px' }}
      role="log"
      aria-label="Live threat event stream"
      aria-live="polite"
      aria-atomic="false"
      aria-relevant="additions"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#f5efff]/[0.08]">
        <div className="flex items-center gap-2.5">
          <Activity size={15} className="text-[#f5efff]/70" />
          <span className="font-editorial text-lg font-light text-[#f5efff] tracking-wide">
            Live Threat Stream
          </span>
        </div>
        <div className="flex items-center gap-2 px-2.5 py-0.5 rounded-full border border-[#f5efff]/10 bg-[#f5efff]/[0.03]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399] animate-pulse" />
          <span className="font-mono text-[10px] text-[#f5efff]/50 font-medium">{events.length} events</span>
        </div>
      </div>

      {/* Events list */}
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto no-scrollbar py-2 space-y-1"
      >
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <Activity size={24} className="text-[#f5efff]/20" />
            <div className="text-xs text-[#f5efff]/40 font-mono">
              <div className="mb-1 text-[#f5efff]/60 font-semibold">Monitoring active</div>
              <div className="text-[11px] text-[#f5efff]/30">
                Events will stream into this feed as optical packets are observed
              </div>
            </div>
          </div>
        ) : (
          events.map((event, index) => {
            const cfg = SEVERITY_CONFIG[event.severity] ?? SEVERITY_CONFIG.INFO;
            const isCampaign = event.threatType === 'MULTI_HOST_CAMPAIGN';

            return (
              <div
                key={event.id}
                className={cn(
                  'flex items-start gap-3 px-3 py-2 rounded-xl threat-event-new transition-colors',
                  isCampaign && 'campaign-detected',
                  'hover:bg-[#f5efff]/[0.03] border border-transparent hover:border-[#f5efff]/[0.05]'
                )}
                style={{
                  background: index === 0 ? cfg.bg : undefined,
                  borderLeft: index === 0 ? `2px solid ${cfg.color}` : undefined,
                }}
                aria-label={`${cfg.label}: ${event.message}`}
              >
                {/* Time */}
                <span
                  className="font-mono flex-shrink-0 mt-0.5 text-[10px] text-[#f5efff]/40"
                  style={{ width: '56px' }}
                >
                  {formatTime(event.timestamp)}
                </span>

                {/* Severity badge */}
                <span
                  className="flex-shrink-0 mt-0.5 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider text-center"
                  style={{
                    color: cfg.color,
                    background: cfg.bg,
                    border: `1px solid ${cfg.color}30`,
                    minWidth: '38px',
                  }}
                >
                  {cfg.label}
                </span>

                {/* Message */}
                <div className="flex-1 min-w-0">
                  <div
                    className="text-xs leading-relaxed"
                    style={{
                      color: isCampaign ? '#f43f5e' : index === 0 ? '#f5efff' : 'rgba(245, 239, 255, 0.75)',
                      fontWeight: isCampaign ? 700 : index < 3 ? 500 : 400,
                    }}
                  >
                    {event.message}
                  </div>
                  {(event.srcIp || event.dstIp) && (
                    <div className="font-mono text-[10px] text-[#f5efff]/35 mt-0.5 flex items-center gap-1.5">
                      {event.srcIp && <span>{event.srcIp}</span>}
                      {event.srcIp && event.dstIp && <span>→</span>}
                      {event.dstIp && <span>{event.dstIp}</span>}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
