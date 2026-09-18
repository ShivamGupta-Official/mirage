import type { Metadata } from 'next';
import { MirageProvider } from '@/components/providers/mirage-provider';
import { DashboardShell } from '@/components/ui/dashboard-shell';

export const metadata: Metadata = {
  title: {
    template: '%s | MIRAGE',
    default: 'Overview | MIRAGE',
  },
};

export default function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen text-[#f5efff]"
      style={{
        backgroundColor: '#08080c',
        backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(245, 239, 255, 0.035) 0%, transparent 70%)',
      }}
    >
      <DashboardShell>{children}</DashboardShell>
    </div>
  );
}
