import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { cn } from "@/lib/utils";

interface MapViewProps {
  className?: string;
  initialCenter?: { lat: number; lng: number };
  initialZoom?: number;
  onMapReady?: (map: L.Map) => void;
}

export function MapView({
  className,
  initialCenter = { lat: 25.7617, lng: -80.1918 }, // Default to Miami
  initialZoom = 11,
  onMapReady,
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    // Initialize Leaflet Map
    const map = L.map(mapContainer.current, {
      zoomControl: true,
      attributionControl: true,
    }).setView([initialCenter.lat, initialCenter.lng], initialZoom);

    // Load OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    mapRef.current = map;

    if (onMapReady) {
      onMapReady(map);
    }

    // Cleanup on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [initialCenter.lat, initialCenter.lng, initialZoom, onMapReady]);

  return (
    <div 
      ref={mapContainer} 
      className={cn("w-full h-full min-h-[350px]", className)} 
      style={{ position: "relative", zIndex: 1 }}
    />
  );
}
