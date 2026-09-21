import { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import { Spin } from "antd";
import {
  Map,
  Marker,
  NavigationControl,
  LngLatBounds,
  setWorkerUrl,
} from "maplibre-gl";
import maplibreWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import type { RoutePointDto, StopDto } from "@/shared/types/api";
import { strings } from "@/shared/strings";
import "maplibre-gl/dist/maplibre-gl.css";
import "./YandexMap.css";

/*
 * MapLibre runs GeoJSON layers (the employee route line) in a Web Worker.
 * By default it looks for the worker file next to the bundled JS, which Vite
 * does not emit, so the worker never starts and the route line is never drawn.
 * `?worker&url` makes Vite bundle the worker and gives us its real URL.
 */
setWorkerUrl(maplibreWorkerUrl);

const ARROW_IMAGE_ID = "route-arrow";
const ARROW_OUTLINE_COLOR = "#1F6B2D";
// Distance between direction arrows along the route, in meters.
const ARROW_SPACING_M = 60;
// Segments shorter than this are GPS jitter while standing still: no arrows there.
const ARROW_MIN_SEGMENT_M = 15;

type LngLat = [number, number];

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function distanceMeters(a: LngLat, b: LngLat): number {
  const earthRadius = 6371000;
  const dLat = toRad(b[1] - a[1]);
  const dLng = toRad(b[0] - a[0]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a[1])) * Math.cos(toRad(b[1])) * Math.sin(dLng / 2) ** 2;
  return 2 * earthRadius * Math.asin(Math.sqrt(h));
}

// Compass bearing from a to b in degrees (0 = north, 90 = east).
function bearingDegrees(a: LngLat, b: LngLat): number {
  const dLng = toRad(b[0] - a[0]);
  const lat1 = toRad(a[1]);
  const lat2 = toRad(b[1]);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return (((Math.atan2(y, x) * 180) / Math.PI) + 360) % 360;
}

/*
 * Points placed on the route every ARROW_SPACING_M meters, each carrying the
 * direction of travel at that spot.
 */
function buildArrowFeatures(coordinates: LngLat[]) {
  const features: Array<{
    type: "Feature";
    properties: { bearing: number };
    geometry: { type: "Point"; coordinates: LngLat };
  }> = [];

  let nextArrowAt = ARROW_SPACING_M / 2;

  for (let i = 1; i < coordinates.length; i += 1) {
    const from = coordinates[i - 1];
    const to = coordinates[i];

    if (!from || !to) continue;

    const length = distanceMeters(from, to);

    if (length < ARROW_MIN_SEGMENT_M) continue;

    const bearing = bearingDegrees(from, to);
    let position = nextArrowAt;

    while (position <= length) {
      const t = position / length;
      features.push({
        type: "Feature",
        properties: { bearing },
        geometry: {
          type: "Point",
          coordinates: [
            from[0] + (to[0] - from[0]) * t,
            from[1] + (to[1] - from[1]) * t,
          ],
        },
      });
      position += ARROW_SPACING_M;
    }

    nextArrowAt = position - length;
  }

  return features;
}

// Small white arrowhead pointing up (north); MapLibre rotates it along the route.
function createArrowImage(): ImageData | null {
  const size = 32;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const context = canvas.getContext("2d");
  if (!context) return null;

  context.beginPath();
  context.moveTo(16, 4);
  context.lineTo(27, 26);
  context.lineTo(16, 20);
  context.lineTo(5, 26);
  context.closePath();
  context.fillStyle = "#FFFFFF";
  context.fill();
  context.lineWidth = 2;
  context.lineJoin = "round";
  context.strokeStyle = ARROW_OUTLINE_COLOR;
  context.stroke();

  return context.getImageData(0, 0, size, size);
}

// Whole of Uzbekistan: [[west, south], [east, north]] in [lng, lat].
const UZBEKISTAN_BOUNDS: [[number, number], [number, number]] = [
  [55.9, 37.1],
  [73.2, 45.6],
];
const DEFAULT_VIEW_PADDING = 24;

const ROUTE_COLOR = "#309C44";
const STOP_COLOR = "#D97706";

function createCurrentLocationElement() {
  const element = document.createElement("div");
  element.className = "current-location-marker";

  const pulse = document.createElement("span");
  pulse.className = "current-location-marker__pulse";

  const dot = document.createElement("span");
  dot.className = "current-location-marker__dot";

  const label = document.createElement("span");
  label.className = "current-location-marker__label";

  element.append(pulse, dot, label);

  return { element, label };
}

interface YandexMapProps {
  regionCenter?: [number, number] | null;
  route?: RoutePointDto[];
  stops?: StopDto[];
  liveMarker?: [number, number] | null;
  onStopClick?: (stop: StopDto) => void;
}

export function YandexMap({
  regionCenter,
  route,
  stops,
  liveMarker,
  onStopClick,
}: YandexMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);

  const routeSourceId = "employee-route";
  const routeLayerId = "employee-route-line";
  const arrowSourceId = "employee-route-arrows";
  const arrowLayerId = "employee-route-arrows-layer";

  const stopMarkersRef = useRef<Marker[]>([]);
  const currentMarkerRef = useRef<Marker | null>(null);
  const currentLabelRef = useRef<HTMLSpanElement | null>(null);
  const lastLiveCenterRef = useRef<[number, number] | null>(null);

  const [isReady, setIsReady] = useState(false);
  const [loadError, setLoadError] = useState(false);

  /*
   * Initialize MapLibre
   */
  useEffect(() => {
    if (!containerRef.current) return;

    const map = new Map({
      container: containerRef.current,

      style: {
        version: 8,

        sources: {
          osm: {
            type: "raster",
            tiles: [
              "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
            ],
            tileSize: 256,
            attribution: "© OpenStreetMap contributors",
          },
        },

        layers: [
          {
            id: "osm",
            type: "raster",
            source: "osm",
          },
        ],
      },

      bounds: UZBEKISTAN_BOUNDS,
      fitBoundsOptions: { padding: DEFAULT_VIEW_PADDING },
    });

    map.addControl(
      new NavigationControl(),
      "top-right",
    );

    map.on("load", () => {
      setIsReady(true);
      setLoadError(false);
    });

    
    map.on("error", () => {
      setLoadError(true);
    });

    map.on("sourcedata", (event) => {
      if (event.isSourceLoaded) {
        setLoadError(false);
      }
    });

    const loadTimeoutId = window.setTimeout(() => {
      setIsReady((current) => {
        if (!current) {
          setLoadError(true);
        }
        return current;
      });
    }, 5000);

    mapRef.current = map;

    return () => {
      window.clearTimeout(loadTimeoutId);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  /*
   * Region center
   */
  useEffect(() => {
    const map = mapRef.current;

    if (!isReady || !map) return;

    if (route && route.length > 0) return;
    if (stops && stops.length > 0) return;

    if (regionCenter) {
      map.flyTo({
        center: [regionCenter[1], regionCenter[0]],
        zoom: 10,
      });
    } else {
      map.fitBounds(UZBEKISTAN_BOUNDS, { padding: DEFAULT_VIEW_PADDING });
    }
  }, [
    isReady,
    regionCenter,
    route,
    stops,
  ]);

  /*
   * Employee route
   */
  useEffect(() => {
    const map = mapRef.current;

    if (!isReady || !map) return;

    if (map.getLayer(arrowLayerId)) {
      map.removeLayer(arrowLayerId);
    }

    if (map.getSource(arrowSourceId)) {
      map.removeSource(arrowSourceId);
    }

    if (map.getLayer(routeLayerId)) {
      map.removeLayer(routeLayerId);
    }

    if (map.getSource(routeSourceId)) {
      map.removeSource(routeSourceId);
    }

    if (!route || route.length === 0) return;

    const coordinates: LngLat[] = Array.isArray(route)
      ? route.map((point) => [
          point.longitude,
          point.latitude,
        ])
      : [];

    map.addSource(routeSourceId, {
      type: "geojson",
      data: {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates,
        },
      },
    });

    map.addLayer({
      id: routeLayerId,
      type: "line",
      source: routeSourceId,

      layout: {
        "line-join": "round",
        "line-cap": "round",
      },

      paint: {
        "line-color": ROUTE_COLOR,
        "line-width": 4,
        "line-opacity": 0.85,
      },
    });

    /*
     * Direction arrows along the route
     */
    if (!map.hasImage(ARROW_IMAGE_ID)) {
      const arrowImage = createArrowImage();

      if (arrowImage) {
        map.addImage(ARROW_IMAGE_ID, arrowImage, { pixelRatio: 2 });
      }
    }

    if (map.hasImage(ARROW_IMAGE_ID)) {
      map.addSource(arrowSourceId, {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: buildArrowFeatures(coordinates),
        },
      });

      map.addLayer({
        id: arrowLayerId,
        type: "symbol",
        source: arrowSourceId,

        layout: {
          "icon-image": ARROW_IMAGE_ID,
          "icon-size": 0.85,
          "icon-rotate": ["get", "bearing"],
          "icon-rotation-alignment": "map",
          "icon-pitch-alignment": "map",
          "icon-padding": 6,
        },
      });
    }

    const bounds = new LngLatBounds();

    coordinates.forEach(([lng, lat]) => {
      bounds.extend([lng, lat]);
    });

    map.fitBounds(bounds, {
      padding: 48,
    });
  }, [isReady, route]);

  /*
   * Stop markers
   */
  useEffect(() => {
    const map = mapRef.current;

    if (!isReady || !map) return;

    stopMarkersRef.current.forEach((marker) => {
      marker.remove();
    });

    stopMarkersRef.current = [];

    if (!stops || stops.length === 0) return;

    stops.forEach((stop) => {
      const element = document.createElement("div");

      element.style.width = "14px";
      element.style.height = "14px";
      element.style.borderRadius = "50%";
      element.style.backgroundColor = STOP_COLOR;
      element.style.border = "2px solid white";
      element.style.boxShadow =
        "0 1px 4px rgba(0, 0, 0, 0.35)";
      element.style.cursor = "pointer";

      if (onStopClick) {
        element.addEventListener("click", () => {
          onStopClick(stop);
        });
      }

      const marker = new Marker({
        element,
      })
        .setLngLat([
          stop.longitude,
          stop.latitude,
        ])
        .addTo(map);

      stopMarkersRef.current.push(marker);
    });
  }, [
    isReady,
    stops,
    onStopClick,
  ]);

  /*
   * Current location marker: the live position when we have one, otherwise
   * the last point of the route (with the time it was recorded).
   */
  useEffect(() => {
    const map = mapRef.current;

    if (!isReady || !map) return;

    const lastPoint =
      route && route.length > 0 ? route[route.length - 1] : undefined;

    let position: LngLat | null = null;
    let labelText = "";

    if (liveMarker) {
      position = [liveMarker[1], liveMarker[0]];
      labelText = strings.map.now;
    } else if (lastPoint) {
      position = [lastPoint.longitude, lastPoint.latitude];
      labelText = `${strings.map.lastLocation} · ${dayjs(lastPoint.timestamp).format("HH:mm")}`;
    }

    if (!position) {
      currentMarkerRef.current?.remove();
      currentMarkerRef.current = null;
      currentLabelRef.current = null;
      lastLiveCenterRef.current = null;
      return;
    }

    if (!currentMarkerRef.current) {
      const { element, label } = createCurrentLocationElement();

      currentLabelRef.current = label;
      currentMarkerRef.current = new Marker({ element })
        .setLngLat(position)
        .addTo(map);
    } else {
      currentMarkerRef.current.setLngLat(position);
    }

    if (currentLabelRef.current) {
      currentLabelRef.current.textContent = labelText;
    }

    if (!liveMarker) {
      lastLiveCenterRef.current = null;
      return;
    }

    // Follow the employee while live updates arrive.
    const [lat, lng] = liveMarker;
    const lastCenter = lastLiveCenterRef.current;
    const hasMovedEnough =
      !lastCenter ||
      Math.abs(lastCenter[0] - lat) > 0.0005 ||
      Math.abs(lastCenter[1] - lng) > 0.0005;

    if (hasMovedEnough) {
      lastLiveCenterRef.current = [lat, lng];
      map.flyTo({ center: [lng, lat], duration: 800 });
    }
  }, [
    isReady,
    route,
    liveMarker,
  ]);

  return (
    <div className="yandex-map">
      <div
        ref={containerRef}
        className="yandex-map__surface"
      />

      {!isReady && !loadError && (
        <div className="yandex-map__overlay">
          <Spin size="large" />
        </div>
      )}

      {loadError && (
        <div className="yandex-map__overlay">
          <p className="yandex-map__error">
            {strings.map.loadError}
          </p>
        </div>
      )}
    </div>
  );
}