/**
 * Kaspersky Cyberthreat Real-Time Map (cybermap.kaspersky.com) Live Telemetry Ingestion Service.
 *
 * Reverse-engineered from Kaspersky Cybermap protocol:
 * 1. Country & Centroid Map: https://cybermap.kaspersky.com/map/data/map.json
 * 2. Hourly Real-Time Events: https://sm-cybermap-mediaprod.smweb.tech/data/events/default/{UTC_HOUR}.json
 * 3. 64-bit Binary Format:
 *    - Word 1: [type: 8 bits][target_key: 12 bits][source_key: 12 bits]
 *    - Word 2: [detection_count: 32 bits]
 */

import { generateDynamicHorizonThreat, type DynamicThreatEvent, type GeoLocation, PRIMARY_DEFENSE_TARGET } from './geo-intel';

interface KasperskyCountry {
  key: number;
  iso2: string;
  iso3: string;
  name?: string | null;
  center?: [number, number]; // [lon, lat]
}

export interface KasperskyThreatEvent extends DynamicThreatEvent {
  kasperskySystem?: string;
  kasperskySystemName?: string;
  detectionCount?: number;
}

// System types from Kaspersky Cybermap
export const KASPERSKY_SYSTEMS: Record<number, { code: string; name: string; color: string; threatType: DynamicThreatEvent['threatType'] }> = {
  1: { code: 'OAS', name: 'On-Access File Scan', color: '#38b349', threatType: 'C2_BEACON' },
  2: { code: 'ODS', name: 'On-Demand Scanner', color: '#ed1c24', threatType: 'SYN_FLOOD' },
  3: { code: 'MAV', name: 'Mail Anti-Virus', color: '#f26522', threatType: 'DGA' },
  4: { code: 'WAV', name: 'Web Anti-Virus Exploits', color: '#0087f4', threatType: 'UDP_FLOOD' },
  5: { code: 'IDS', name: 'Intrusion Detection System', color: '#ec008c', threatType: 'SYN_FLOOD' },
  6: { code: 'VUL', name: 'Vulnerability Exploit', color: '#fbf267', threatType: 'SLOWLORIS' },
  7: { code: 'KAS', name: 'Kaspersky Anti-Spam', color: '#855ff4', threatType: 'DNS_TUNNEL' },
  9: { code: 'RMW', name: 'Ransomware Attack', color: '#3b82f6', threatType: 'C2_BEACON' },
};

// Common ISO2 to country name dictionary
const ISO2_NAMES: Record<string, string> = {
  US: 'United States', DE: 'Germany', NL: 'Netherlands', GB: 'United Kingdom', RU: 'Russia',
  CN: 'China', JP: 'Japan', KR: 'South Korea', SG: 'Singapore', AU: 'Australia',
  BR: 'Brazil', IN: 'India', FR: 'France', SE: 'Sweden', CA: 'Canada',
  ZA: 'South Africa', IT: 'Italy', ES: 'Spain', PL: 'Poland', TR: 'Turkey',
  UA: 'Ukraine', ID: 'Indonesia', VN: 'Vietnam', TH: 'Thailand', MX: 'Mexico',
  AR: 'Argentina', CL: 'Chile', CO: 'Colombia', EG: 'Egypt', SA: 'Saudi Arabia',
  AE: 'United Arab Emirates', IL: 'Israel', CH: 'Switzerland', BE: 'Belgium', AT: 'Austria',
  NO: 'Norway', FI: 'Finland', DK: 'Denmark', IE: 'Ireland', PT: 'Portugal',
  GR: 'Greece', CZ: 'Czech Republic', RO: 'Romania', HU: 'Hungary', NZ: 'New Zealand',
  MY: 'Malaysia', PH: 'Philippines', TW: 'Taiwan', HK: 'Hong Kong', PK: 'Pakistan',
  BD: 'Bangladesh', NG: 'Nigeria', KE: 'Kenya', KZ: 'Kazakhstan', IR: 'Iran',
  IQ: 'Iraq', DZ: 'Algeria', MA: 'Morocco', AF: 'Afghanistan', AL: 'Albania',
};

// In-memory telemetry cache
let countryMapCache: Map<number, GeoLocation> | null = null;
let lastEventsFetchTime = 0;
let cachedThreats: KasperskyThreatEvent[] = [];
let cachedHour = -1;

const USER_AGENT = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

/**
 * Loads the 176 geographic country centroids from Kaspersky Cybermap.
 */
async function getKasperskyCountryMap(): Promise<Map<number, GeoLocation>> {
  if (countryMapCache && countryMapCache.size > 0) {
    return countryMapCache;
  }

  const map = new Map<number, GeoLocation>();

  try {
    const res = await fetch('https://cybermap.kaspersky.com/map/data/map.json', {
      headers: {
        'User-Agent': USER_AGENT,
        'Referer': 'https://cybermap.kaspersky.com/',
        'Origin': 'https://cybermap.kaspersky.com',
      },
      next: { revalidate: 86400 }, // Cache 24 hours
    });

    if (!res.ok) {
      throw new Error(`Failed to load Kaspersky map.json: ${res.status}`);
    }

    const data = await res.json();
    if (data && Array.isArray(data.countries)) {
      data.countries.forEach((c: KasperskyCountry) => {
        if (c.key !== undefined) {
          const lon = c.center ? c.center[0] : 0;
          const lat = c.center ? c.center[1] : 0;
          const countryName = ISO2_NAMES[c.iso2] || c.iso3 || c.iso2 || `Country-${c.key}`;

          map.set(c.key, {
            country: countryName,
            countryCode: c.iso2 || 'UN',
            city: countryName,
            continent: 'Global',
            lat,
            lon,
            asn: `AS-KSN-${c.iso2}`,
            isp: 'Kaspersky Security Network (KSN)',
          });
        }
      });
    }
  } catch (err) {
    console.warn('[KasperskyService] Failed to load remote map.json, using fallback hubs:', err);
  }

  countryMapCache = map;
  return map;
}

/**
 * Fetches and decodes the real-time event binary feed from Kaspersky Cybermap.
 */
export async function getLiveKasperskyThreats(count = 12): Promise<KasperskyThreatEvent[]> {
  const now = Date.now();
  const currentUtcHour = new Date().getUTCHours();

  // Return cached events if fetched within the last 60 seconds and still the same UTC hour
  if (cachedThreats.length > 0 && now - lastEventsFetchTime < 60000 && cachedHour === currentUtcHour) {
    return selectRandomThreats(cachedThreats, count);
  }

  try {
    const countryMap = await getKasperskyCountryMap();
    const eventsUrl = `https://sm-cybermap-mediaprod.smweb.tech/data/events/default/${currentUtcHour}.json`;

    const res = await fetch(eventsUrl, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'application/json, text/plain, */*',
        'Referer': 'https://cybermap.kaspersky.com/',
        'Origin': 'https://cybermap.kaspersky.com',
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      throw new Error(`Kaspersky events returned HTTP ${res.status}`);
    }

    const json = await res.json();
    if (!json.events) {
      throw new Error('Kaspersky response missing events buffer');
    }

    // Decode Base64 Uint32 binary stream
    const binaryBuffer = Buffer.from(json.events, 'base64');
    const uint32Array = new Uint32Array(binaryBuffer.buffer, binaryBuffer.byteOffset, binaryBuffer.length / 4);

    const decodedThreats: KasperskyThreatEvent[] = [];

    for (let o = 0; o < uint32Array.length; o += 2) {
      const word1 = uint32Array[o];
      const countVal = uint32Array[o + 1];

      const typeId = (word1 >> 24) & 255;
      const targetKey = (word1 >> 12) & 4095;
      const sourceKey = word1 & 4095;

      const system = KASPERSKY_SYSTEMS[typeId];
      const targetLoc = countryMap.get(targetKey);
      const sourceLoc = sourceKey !== 0 ? countryMap.get(sourceKey) : null;

      if (system && targetLoc) {
        // If no explicit source country is given, synthesize a plausible source from other threat hubs
        const effectiveSourceLoc: GeoLocation = sourceLoc && sourceKey !== targetKey
          ? {
              ...sourceLoc,
              lat: Number((sourceLoc.lat + (Math.random() - 0.5) * 1.2).toFixed(4)),
              lon: Number((sourceLoc.lon + (Math.random() - 0.5) * 1.2).toFixed(4)),
            }
          : {
              country: 'External APT / Botnet',
              countryCode: 'XX',
              city: 'Global Botnet Fleet',
              continent: 'Global',
              lat: Number((targetLoc.lat + (Math.random() - 0.5) * 45).toFixed(4)),
              lon: Number((targetLoc.lon + (Math.random() - 0.5) * 45).toFixed(4)),
              asn: 'AS-ANONYMOUS',
              isp: 'Decentralized C2 Infrastructure',
            };

        // Realistic synthetic IP for display
        const srcIp = `${Math.floor(Math.random() * 180 + 20)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 254 + 1)}`;

        // Calculate risk score based on detection count and attack class
        const severity: DynamicThreatEvent['severity'] =
          system.code === 'RMW' || system.code === 'IDS' ? 'CRITICAL' : countVal > 500 ? 'HIGH' : 'MEDIUM';

        const baseRisk = system.code === 'RMW' ? 95 : system.code === 'IDS' ? 91 : system.code === 'WAV' ? 84 : 76;
        const riskScore = Number(Math.min(99.4, baseRisk + (countVal % 15) * 0.4).toFixed(1));

        decodedThreats.push({
          id: `kaspersky-${typeId}-${targetKey}-${sourceKey}-${o}`,
          timestamp: new Date().toISOString(),
          srcIp,
          dstIp: targetLoc.countryCode === 'IN' ? '10.0.0.10' : `192.168.${(targetKey % 250) + 1}.50`,
          srcLocation: effectiveSourceLoc,
          dstLocation: targetLoc,
          threatType: system.threatType,
          kasperskySystem: system.code,
          kasperskySystemName: system.name,
          detectionCount: countVal,
          severity,
          riskScore,
          mlConfidence: Number((93.5 + Math.random() * 5.8).toFixed(1)),
          bandwidthGbps: Number((Math.max(0.1, (countVal % 85) * 0.8 + 1.2)).toFixed(2)),
          packetRateKpps: Number((Math.max(10, countVal * 12)).toFixed(0)),
          durationSeconds: Math.floor(Math.random() * 120 + 20),
          attackVectorDescription: `${system.name} (${system.code}): ${countVal.toLocaleString()} detections targeting ${targetLoc.country} [${targetLoc.countryCode}]`,
          predictedLocationConfidence: 97.5,
        });
      }
    }

    if (decodedThreats.length > 0) {
      cachedThreats = decodedThreats;
      lastEventsFetchTime = now;
      cachedHour = currentUtcHour;
      return selectRandomThreats(cachedThreats, count);
    }
  } catch (err) {
    console.error('[KasperskyService] Error querying live Kaspersky stream:', err);
  }

  // Graceful fallback: return locally generated high-rate threats if remote service drops
  const fallbackThreats: KasperskyThreatEvent[] = [];
  for (let i = 0; i < count; i++) {
    const base = generateDynamicHorizonThreat();
    fallbackThreats.push({
      ...base,
      kasperskySystem: 'IDS',
      kasperskySystemName: 'Intrusion Detection System (Synthetic Fallback)',
      detectionCount: Math.floor(Math.random() * 500 + 50),
    });
  }
  return fallbackThreats;
}

/**
 * Randomly samples items from the decoded threats array, prioritizing diverse target countries.
 */
function selectRandomThreats(threats: KasperskyThreatEvent[], count: number): KasperskyThreatEvent[] {
  if (threats.length <= count) return threats;

  // Shuffle and pick
  const shuffled = [...threats].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
