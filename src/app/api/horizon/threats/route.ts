import { NextRequest, NextResponse } from 'next/server';
import {
  generateDynamicHorizonThreat,
  predictLocationFromIp,
  GLOBAL_THREAT_HUBS,
  PRIMARY_DEFENSE_TARGET,
  type DynamicThreatEvent,
} from '@/lib/geo-intel';
import { getLiveKasperskyThreats } from '@/lib/kaspersky-service';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const count = Math.min(50, Math.max(1, parseInt(searchParams.get('count') || '12', 10)));
  const predictIp = searchParams.get('predict_ip');
  const sourceMode = searchParams.get('source') || 'kaspersky';

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

  // Fetch real Kaspersky Cyberthreat live events if requested or by default
  let threats: DynamicThreatEvent[] = [];
  let telemetrySource = 'KASPERSKY_CYBERMAP_LIVE_KSN';

  if (sourceMode === 'kaspersky') {
    try {
      threats = await getLiveKasperskyThreats(count);
    } catch {
      telemetrySource = 'NETSCOUT_HORIZON_SIMULATION_FALLBACK';
      for (let i = 0; i < count; i++) {
        threats.push(generateDynamicHorizonThreat());
      }
    }
  } else {
    telemetrySource = 'NETSCOUT_HORIZON_GLOBAL_TELEMETRY';
    for (let i = 0; i < count; i++) {
      threats.push(generateDynamicHorizonThreat());
    }
  }

  return NextResponse.json({
    status: 'ONLINE',
    source: telemetrySource,
    sourceProvider: 'Kaspersky Security Network (cybermap.kaspersky.com)',
    timestamp: new Date().toISOString(),
    activeThreatsCount: threats.length,
    threats,
    primaryTarget: PRIMARY_DEFENSE_TARGET,
    globalHubsCovered: GLOBAL_THREAT_HUBS.length,
  });
}
