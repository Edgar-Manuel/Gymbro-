import { useState, useEffect } from 'react';
import { useAppStore } from '@/store';
import { dbHelpers } from '@/db';
import { slugifyGym, getCurrentLocation, detectarGymCercano } from '@/utils/gymUtils';

export type GymInfo = { gymId: string; gymNombre: string; lat?: number; lng?: number; count?: number };

export function useGymContext() {
  const { currentUser, setCurrentUser } = useAppStore();
  const [gymsConocidos, setGymsConocidos] = useState<GymInfo[]>([]);
  const [gymActual, setGymActualState] = useState<GymInfo | null>(null);
  const [detectandoGym, setDetectandoGym] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    dbHelpers.getAllGyms(currentUser.id).then(gyms => {
      setGymsConocidos(gyms);
      if (currentUser.gymActual) {
        const found = gyms.find(g => g.gymId === currentUser.gymActual);
        if (found) setGymActualState(found);
        else if (currentUser.gymActualNombre) {
          setGymActualState({ gymId: currentUser.gymActual, gymNombre: currentUser.gymActualNombre });
        }
      }
    });
  }, [currentUser]);

  const detectarGymPorUbicacion = async (): Promise<GymInfo | null> => {
    setDetectandoGym(true);
    try {
      const coords = await getCurrentLocation();
      if (!coords) return null;
      const gymsConCoords = gymsConocidos.filter(g => g.lat != null && g.lng != null) as { gymId: string; gymNombre: string; lat: number; lng: number }[];
      const found = detectarGymCercano(coords, gymsConCoords);
      if (found) {
        setGymActualState(found);
        return found;
      }
      return null;
    } finally {
      setDetectandoGym(false);
    }
  };

  const seleccionarGym = async (gymId: string, gymNombre: string) => {
    if (!currentUser) return;
    const updated = { ...currentUser, gymActual: gymId, gymActualNombre: gymNombre };
    setCurrentUser(updated);
    setGymActualState({ gymId, gymNombre });
    try { await dbHelpers.updateUser?.(updated); } catch {}
  };

  const crearNuevoGym = async (gymNombre: string): Promise<GymInfo> => {
    if (!currentUser) throw new Error('No user');
    const coords = await getCurrentLocation();
    const gymId = slugifyGym(currentUser.id, gymNombre);
    const info: GymInfo = { gymId, gymNombre, lat: coords?.lat, lng: coords?.lng };
    await seleccionarGym(gymId, gymNombre);
    setGymsConocidos(prev => [...prev.filter(g => g.gymId !== gymId), { ...info, count: 0 }]);
    return info;
  };

  return { gymActual, gymsConocidos, detectandoGym, detectarGymPorUbicacion, seleccionarGym, crearNuevoGym };
}
