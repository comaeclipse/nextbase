"use client";

import { useEffect, useMemo, useState } from "react";
import { CircleMarker, MapContainer, TileLayer, Tooltip } from "react-leaflet";
import type { LatLngBoundsExpression, LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

type MarkerColor = "teal" | "amber" | "rose";

export type MapMarker = {
  id: string;
  city: string;
  state: string;
  stateCode: string;
  lat: number;
  lon: number;
  population: number;
  giffordScore: string;
};

type DestinationMapProps = {
  markers: MapMarker[];
};

const MAP_CENTER: LatLngExpression = [39.8283, -98.5795];

function gradeToColor(grade: string): MarkerColor {
  const normalized = grade.trim().charAt(0).toUpperCase();
  if (["A", "B"].includes(normalized)) {
    return "teal";
  }
  if (normalized === "C") {
    return "amber";
  }
  return "rose";
}

const COLOR_PALETTE: Record<MarkerColor, { stroke: string; fill: string }> = {
  teal: { stroke: "#0f766e", fill: "rgba(20,184,166,0.75)" },
  amber: { stroke: "#b45309", fill: "rgba(251,191,36,0.7)" },
  rose: { stroke: "#be123c", fill: "rgba(244,114,182,0.65)" },
};

export function DestinationMap({ markers }: DestinationMapProps) {
  const [mounted, setMounted] = useState(false);
  const [hoveredMarkerId, setHoveredMarkerId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const bounds = useMemo<LatLngBoundsExpression | null>(() => {
    if (markers.length === 0) {
      return null;
    }
    const latitudes = markers.map((marker) => marker.lat);
    const longitudes = markers.map((marker) => marker.lon);
    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLon = Math.min(...longitudes);
    const maxLon = Math.max(...longitudes);
    return [
      [minLat, minLon],
      [maxLat, maxLon],
    ];
  }, [markers]);

  return (
    <div className="overflow-hidden rounded-3xl border border-color-border/60 shadow-lg">
      {mounted && markers.length > 0 ? (
        <MapContainer
          center={MAP_CENTER}
          zoom={4}
          minZoom={3}
          maxZoom={12}
          bounds={bounds ?? undefined}
          boundsOptions={{ padding: [40, 40] }}
          scrollWheelZoom
          className="h-[560px] w-full"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {markers.map((marker) => {
            const palette = COLOR_PALETTE[gradeToColor(marker.giffordScore)];
            const populationLabel = Number.isFinite(marker.population) && marker.population > 0
              ? marker.population.toLocaleString()
              : "N/A";
            return (
              <CircleMarker
                key={marker.id}
                center={[marker.lat, marker.lon]}
                radius={hoveredMarkerId === marker.id ? 8 : 6.5}
                pathOptions={{ color: palette.stroke, fillColor: palette.fill, weight: 1.5, fillOpacity: 1 }}
                eventHandlers={{
                  mouseover: () => setHoveredMarkerId(marker.id),
                  mouseout: () => setHoveredMarkerId((current) => (current === marker.id ? null : current)),
                }}
              >
                <Tooltip
                  direction="top"
                  offset={[0, -6]}
                  opacity={1}
                  sticky
                  className="rounded-md bg-color-surface/90 px-3 py-2 text-xs font-medium shadow-md"
                >
                  <div className="space-y-1">
                    <p className="font-semibold text-primary">
                      {marker.city}, {marker.stateCode}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Population {populationLabel}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Giffords score {marker.giffordScore || "N/A"}
                    </p>
                  </div>
                </Tooltip>
              </CircleMarker>
            );
          })}
        </MapContainer>
      ) : (
        <div className="flex h-[560px] w-full items-center justify-center bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.12),rgba(15,23,42,0.72))] text-sm text-muted-foreground">
          {markers.length === 0 ? "No destinations to plot yet." : "Loading map..."}
        </div>
      )}
    </div>
  );
}
