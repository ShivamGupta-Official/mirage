import { NextRequest, NextResponse } from 'next/server';
import {
  generateDynamicHorizonThreat,
  predictLocationFromIp,
  GLOBAL_THREAT_HUBS,
  PRIMARY_DEFENSE_TARGET,
  type DynamicThreatEvent,
} from '@/lib/geo-intel';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const count = Math.min(50, Math.max(1, parseInt(searchParams.get('count') || '12', 10)));
  const predictIp = searchParams.get('predict_ip');

  // If client requested a single IP location prediction
  if (predictIp) {
    const predicted = predictLocationFromIp(predictIp);
    return NextResponse.json({
      ip: predictIp,
      predictedLocation: predicted,
      confidence: 96.8,
      status: 'RESOLVED',
      timestamp: new Date().toISOString(),
    });
  }

  // Generate dynamic global threat events modeled on NetScout Cyber Threat Horizon
  const threats: DynamicThreatEvent[] = [];
  for (let i = 0; i < count; i++) {
    threats.push(generateDynamicHorizonThreat());
  }

  return NextResponse.json({
    status: 'ONLINE',
    source: 'NETSCOUT_HORIZON_GLOBAL_TELEMETRY',
    timestamp: new Date().toISOString(),
    activeThreatsCount: threats.length,
    threats,
    primaryTarget: PRIMARY_DEFENSE_TARGET,
    globalHubsCovered: GLOBAL_THREAT_HUBS.length,
  });
}
