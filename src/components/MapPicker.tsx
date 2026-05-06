import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Locate, Loader2 } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import type L from 'leaflet';

interface MapPickerProps {
  lat?: number;
  lng?: number;
  onChange: (lat: number, lng: number) => void;
}

const DEFAULT_LAT = 40.416775;
const DEFAULT_LNG = -3.703790;

export default function MapPicker({ lat, lng, onChange }: MapPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Dynamic import to avoid SSR issues
    import('leaflet').then((Leaflet) => {
      // Fix default icon paths broken by webpack/vite bundling
      delete (Leaflet.Icon.Default.prototype as Record<string, unknown>)._getIconUrl;
      Leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      const initialLat = lat ?? DEFAULT_LAT;
      const initialLng = lng ?? DEFAULT_LNG;

      const map = Leaflet.map(containerRef.current!, {
        center: [initialLat, initialLng],
        zoom: lat ? 16 : 13,
        zoomControl: true,
      });

      Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OSM</a>',
        maxZoom: 19,
      }).addTo(map);

      const marker = Leaflet.marker([initialLat, initialLng], { draggable: true }).addTo(map);
      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        onChange(pos.lat, pos.lng);
      });

      map.on('click', (e: L.LeafletMouseEvent) => {
        marker.setLatLng(e.latlng);
        onChange(e.latlng.lat, e.latlng.lng);
      });

      mapRef.current = map;
      markerRef.current = marker;
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  // Update marker when props change externally
  useEffect(() => {
    if (!markerRef.current || lat == null || lng == null) return;
    markerRef.current.setLatLng([lat, lng]);
    mapRef.current?.setView([lat, lng], 16);
  }, [lat, lng]);

  const handleLocate = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        if (markerRef.current) {
          markerRef.current.setLatLng([latitude, longitude]);
          mapRef.current?.setView([latitude, longitude], 17);
        }
        onChange(latitude, longitude);
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="relative w-full rounded-xl overflow-hidden border" style={{ height: 220 }}>
      <div ref={containerRef} className="w-full h-full" />
      <Button
        type="button"
        size="sm"
        variant="secondary"
        className="absolute bottom-2 right-2 z-[1000] shadow gap-1.5"
        onClick={handleLocate}
        disabled={locating}
      >
        {locating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Locate className="w-3.5 h-3.5" />}
        Mi ubicación
      </Button>
      <div className="absolute top-2 left-0 right-0 flex justify-center z-[1000] pointer-events-none">
        <span className="bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full">
          Toca o arrastra el pin para marcar el gym
        </span>
      </div>
    </div>
  );
}
