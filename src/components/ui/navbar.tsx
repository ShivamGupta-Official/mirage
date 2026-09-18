'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Shield,
  Activity,
  AlertTriangle,
  Server,
  GitBranch,
  Zap,
  Terminal,
  Eye,
  Database,
  Cpu,
  Radar,
  Settings,
  CircleAlert,
  Wifi,
  WifiOff,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard',   label: 'Overview',    icon: Radar },
  { href: '/monitor',     label: 'Live Monitor', icon: Activity },
  { href: '/threats',     label: 'Threats',     icon: AlertTriangle },
  { href: '/hosts',       label: 'Hosts',       icon: Server },
  { href: '/campaigns',   label: 'Campaigns',   icon: GitBranch },
  { href: '/traffic',     label: 'Traffic',     icon: Zap },
  { href: '/models',      label: 'Models',      icon: Cpu },
  { href: '/simulation',  label: 'Simulation',  icon: Terminal },
  { href: '/forensics',   label: 'Forensics',   icon: Database },
];

interface NavbarProps {
  sensorOnline?: boolean;
  wsConnected?: boolean;
  alertCount?: number;
}

export function Navbar({
  sensorOnline = true,
  wsConnected = false,
  alertCount = 0,
}: NavbarProps) {
  const pathname = usePathname();

  return (
    <nav
      className="glass-nav fixed top-0 left-0 right-0 z-50 h-16 border-b border-[#f5efff]/[0.08] bg-[#08080c]/85 backdrop-blur-2xl"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-between h-full px-4 md:px-6 max-w-[1680px] mx-auto gap-4">
        {/* Left: Brand Logo & Enclave Tag */}
        <Link
          href="/"
          className="flex items-center gap-3 flex-shrink-0 group focus:outline-none"
          aria-label="MIRAGE — go to home"
        >
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-[#f5efff]/20 bg-[#f5efff]/5 transition-all duration-300 group-hover:border-[#f5efff]/50 group-hover:shadow-[0_0_20px_rgba(245,239,255,0.2)]">
            <Shield className="h-4 w-4 text-[#f5efff] transition-transform duration-300 group-hover:scale-110" />
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-sm font-bold tracking-[0.2em] text-[#f5efff] group-hover:text-white transition-colors">
              MIRAGE
            </span>
            <span className="font-mono text-[9px] uppercase tracking-widest text-[#f5efff]/45">
              NTRO // SOC ENCLAVE
            </span>
          </div>
        </Link>

        {/* Center: Sleek Pill Nav items */}
        <div
          className="hidden lg:flex items-center gap-1.5 p-1 rounded-full bg-[#f5efff]/[0.03] border border-[#f5efff]/[0.08] overflow-x-auto no-scrollbar"
          role="menubar"
        >
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                role="menuitem"
                className={cn(
                  'flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono transition-all duration-200 whitespace-nowrap',
                  isActive
                    ? 'bg-[#f5efff]/12 text-[#f5efff] border border-[#f5efff]/25 shadow-[0_0_15px_rgba(245,239,255,0.08)] font-medium'
                    : 'text-[#f5efff]/50 hover:text-[#f5efff] hover:bg-[#f5efff]/5 border border-transparent',
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon size={12} className={cn('flex-shrink-0', isActive ? 'text-[#f5efff]' : 'text-[#f5efff]/50')} />
                {label}
              </Link>
            );
          })}
        </div>

        {/* Mobile/Tablet Fallback Nav Bar */}
        <div
          className="flex lg:hidden items-center gap-1 overflow-x-auto no-scrollbar py-1"
          role="menubar"
        >
          {NAV_ITEMS.slice(0, 4).map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                role="menuitem"
                className={cn(
                  'flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono whitespace-nowrap',
                  isActive
                    ? 'bg-[#f5efff]/12 text-[#f5efff] border border-[#f5efff]/25'
                    : 'text-[#f5efff]/50 hover:text-[#f5efff]',
                )}
              >
                <Icon size={11} />
                {label}
              </Link>
            );
          })}
        </div>

        {/* Right side status & Controls */}
        <div className="flex items-center gap-2.5 md:gap-3.5 flex-shrink-0">
          {/* Alert count */}
          {alertCount > 0 && (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-rose-500/10 border border-rose-500/25 text-rose-400"
              aria-label={`${alertCount} active alerts`}
            >
              <CircleAlert size={11} />
              {alertCount > 99 ? '99+' : alertCount}
            </div>
          )}

          {/* Sensor status */}
          <div
            className="flex items-center gap-2 px-2.5 py-1 rounded-full border border-[#f5efff]/10 bg-[#f5efff]/[0.03]"
            aria-label={`Sensor ${sensorOnline ? 'online' : 'offline'}`}
          >
            <span
              className={cn(
                'h-2 w-2 rounded-full',
                sensorOnline
                  ? 'bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse'
                  : 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'
              )}
              aria-hidden="true"
            />
            <span className="font-mono text-[10px] tracking-[0.15em] text-[#f5efff]/60 font-semibold">
              SENSOR
            </span>
          </div>

          {/* WS connection */}
          <div
            className="p-1.5 rounded-full border border-[#f5efff]/10 bg-[#f5efff]/[0.02]"
            aria-label={`WebSocket ${wsConnected ? 'connected' : 'disconnected'}`}
          >
            {wsConnected ? (
              <Wifi size={13} className="text-emerald-400" />
            ) : (
              <WifiOff size={13} className="text-[#f5efff]/40" />
            )}
          </div>

          {/* Settings */}
          <Link
            href="/settings"
            aria-label="Settings"
            className="h-8 w-8 flex items-center justify-center rounded-full border border-[#f5efff]/15 bg-[#f5efff]/5 text-[#f5efff]/70 hover:text-[#f5efff] hover:border-[#f5efff]/35 hover:bg-[#f5efff]/10 transition-all duration-300"
          >
            <Settings size={13} />
          </Link>

          {/* One-Way Diode Badge */}
          <div
            className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#f5efff]/15 bg-[#f5efff]/5 text-[#f5efff]/80"
            title="Passive monitoring active — unidirectional optical diode enforced"
          >
            <Eye size={12} className="text-emerald-400" />
            <span className="font-mono text-[9px] tracking-[0.2em] font-bold uppercase">
              ONE-WAY
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}
