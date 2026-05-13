export function slugifyGym(userId: string, gymNombre: string): string {
  const normalized = gymNombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
  return `${userId.slice(0, 8)}-${normalized}`;
}

export function getCurrentLocation(): Promise<{ lat: number; lng: number } | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) { resolve(null); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { timeout: 5000, enableHighAccuracy: false }
    );
  });
}

export function calcularDistanciaMetros(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function detectarGymCercano(
  coordActual: { lat: number; lng: number },
  gymsConocidos: { gymId: string; gymNombre: string; lat: number; lng: number }[],
  radioMetros = 300
): { gymId: string; gymNombre: string } | null {
  let closest: { gymId: string; gymNombre: string } | null = null;
  let minDist = Infinity;
  for (const g of gymsConocidos) {
    const dist = calcularDistanciaMetros(coordActual.lat, coordActual.lng, g.lat, g.lng);
    if (dist <= radioMetros && dist < minDist) {
      minDist = dist;
      closest = { gymId: g.gymId, gymNombre: g.gymNombre };
    }
  }
  return closest;
}
