export interface RunningZone {
  name: string;
  shortName: string;
  description: string;
  minPaceSec: number;
  maxPaceSec: number;
  minSpeedKmh: number;
  maxSpeedKmh: number;
  effortLevel: string;
}

export interface RunningZones {
  vdot: number;
  thresholdPaceSec: number;
  zones: RunningZone[];
}

const T_COEFF = 626;
const T_K = 0.0216;
const E_COEFF = 878;
const E_K = 0.0262;

function predictTPace(vdot: number): number {
  return Math.round(T_COEFF * Math.exp(-T_K * vdot));
}

function predictEPace(vdot: number): number {
  return Math.round(E_COEFF * Math.exp(-E_K * vdot));
}

function predict3kFromVDOT(vdot: number): number {
  return Math.round(predictTPace(vdot) * 3 * 1.08);
}

function predict5kFromVDOT(vdot: number): number {
  return Math.round(predictTPace(vdot) * 5);
}

function estimateVDOTFrom3k(timeSec: number): number {
  for (let vdot = 30; vdot <= 85; vdot += 0.5) {
    if (predict3kFromVDOT(vdot) <= timeSec + 5) {
      return vdot;
    }
  }
  return 30;
}

function estimateVDOTFrom5k(timeSec: number): number {
  for (let vdot = 30; vdot <= 85; vdot += 0.5) {
    if (predict5kFromVDOT(vdot) <= timeSec + 10) {
      return vdot;
    }
  }
  return 30;
}

export function calculateVDOT(
  race3kSec?: number,
  race5kSec?: number
): number {
  let totalVDOT = 0;
  let count = 0;
  
  if (race3kSec && race3kSec > 0) {
    totalVDOT += estimateVDOTFrom3k(race3kSec);
    count++;
  }
  if (race5kSec && race5kSec > 0) {
    totalVDOT += estimateVDOTFrom5k(race5kSec);
    count++;
  }
  
  if (count === 0) return 45;
  
  return Math.round((totalVDOT / count) * 10) / 10;
}

export function generateRunningZones(vdot: number): RunningZones {
  const tPace = predictTPace(vdot);
  const ePace = predictEPace(vdot);
  const iPace = Math.round(tPace * 0.93);
  const rPace = Math.round(tPace * 0.86);
  const mPace = Math.round((tPace + ePace) / 2);
  
  return {
    vdot,
    thresholdPaceSec: tPace,
    zones: [
      {
        name: 'Regeneração',
        shortName: 'R',
        description: 'Corrida muito leve, conversacional',
        minPaceSec: ePace + 30,
        maxPaceSec: ePace + 60,
        minSpeedKmh: paceToSpeed(ePace + 60),
        maxSpeedKmh: paceToSpeed(ePace + 30),
        effortLevel: 'Muito Fácil',
      },
      {
        name: 'Corrida Leve',
        shortName: 'E',
        description: 'Conversational pace, fácil',
        minPaceSec: ePace,
        maxPaceSec: ePace + 30,
        minSpeedKmh: paceToSpeed(ePace + 30),
        maxSpeedKmh: paceToSpeed(ePace),
        effortLevel: 'Fácil',
      },
      {
        name: 'Maratona',
        shortName: 'M',
        description: 'Ritmo sustentável para longas distâncias',
        minPaceSec: mPace,
        maxPaceSec: ePace,
        minSpeedKmh: paceToSpeed(ePace),
        maxSpeedKmh: paceToSpeed(mPace),
        effortLevel: 'Moderado',
      },
      {
        name: 'Limiar',
        shortName: 'T',
        description: 'Ritmo de limiar lático, conforto desconfortável',
        minPaceSec: tPace,
        maxPaceSec: mPace,
        minSpeedKmh: paceToSpeed(mPace),
        maxSpeedKmh: paceToSpeed(tPace),
        effortLevel: 'Difícil',
      },
      {
        name: 'Intervalado',
        shortName: 'I',
        description: 'Acima do limiar, alta intensidade',
        minPaceSec: iPace,
        maxPaceSec: tPace,
        minSpeedKmh: paceToSpeed(tPace),
        maxSpeedKmh: paceToSpeed(iPace),
        effortLevel: 'Muito Difícil',
      },
      {
        name: 'Repetições',
        shortName: 'S',
        description: 'Velocidade máxima ou próxima, sprints',
        minPaceSec: rPace - 15,
        maxPaceSec: iPace,
        minSpeedKmh: paceToSpeed(iPace),
        maxSpeedKmh: paceToSpeed(rPace - 15),
        effortLevel: 'Máximo',
      },
    ],
  };
}

function paceToSpeed(paceSec: number): number {
  return Math.round((3600 / paceSec) * 10) / 10;
}

export function formatPace(paceSec: number): string {
  const mins = Math.floor(paceSec / 60);
  const secs = Math.round(paceSec % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function formatPaceFromSpeed(speedKmh: number): string {
  const paceSec = 3600 / speedKmh;
  return formatPace(paceSec);
}

export function getZoneByIntensity(
  zones: RunningZone[],
  intensity: number
): RunningZone | undefined {
  const zoneMapping: Record<number, string> = {
    55: 'R',
    60: 'E',
    65: 'E',
    70: 'M',
    75: 'M',
    80: 'T',
    85: 'I',
    90: 'R',
    95: 'R',
  };
  
  const shortName = zoneMapping[Math.round(intensity)] || 'E';
  return zones.find(z => z.shortName === shortName);
}

export function getPaceForZone(
  zones: RunningZones,
  zoneShortName: string,
  targetIntensity?: number
): { min: number; max: number; avg: number } {
  const zone = zones.zones.find(z => z.shortName === zoneShortName);
  if (!zone) {
    return { min: zones.thresholdPaceSec, max: zones.thresholdPaceSec, avg: zones.thresholdPaceSec };
  }
  
  if (targetIntensity) {
    const ratio = (targetIntensity - 60) / 40;
    const avgPace = zone.minPaceSec - ratio * (zone.minPaceSec - zone.maxPaceSec);
    return {
      min: zone.maxPaceSec,
      max: zone.minPaceSec,
      avg: Math.round(avgPace),
    };
  }
  
  return {
    min: zone.maxPaceSec,
    max: zone.minPaceSec,
    avg: Math.round((zone.minPaceSec + zone.maxPaceSec) / 2),
  };
}
