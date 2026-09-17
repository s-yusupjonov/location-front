import { useEffect, useRef, useState } from "react";
import { Spin } from "antd";
import {
  Map,
  Marker,
  NavigationControl,
  LngLatBounds,
} from "maplibre-gl";
import type { RoutePointDto, StopDto } from "@/shared/types/api";
import { strings } from "@/shared/strings";
import "maplibre-gl/dist/maplibre-gl.css";
import "./YandexMap.css";

const DEFAULT_CENTER: [number, number] = [69.240562, 41.311081];
const DEFAULT_ZOOM = 6;

const ROUTE_COLOR = "#309C44";
const STOP_COLOR = "#D97706";
const LIVE_COLOR = "#309C44";

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

  const stopMarkersRef = useRef<Marker[]>([]);
  const liveMarkerRef = useRef<Marker | null>(null);
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

      center: [DEFAULT_CENTER[1], DEFAULT_CENTER[0]],
      zoom: DEFAULT_ZOOM,
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
    }, 1000);

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
      map.flyTo({
        center: [DEFAULT_CENTER[1], DEFAULT_CENTER[0]],
        zoom: DEFAULT_ZOOM,
      });
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

    if (map.getLayer(routeLayerId)) {
      map.removeLayer(routeLayerId);
    }

    if (map.getSource(routeSourceId)) {
      map.removeSource(routeSourceId);
    }

    if (!route || route.length === 0) return;

    const coordinates: [number, number][] = Array.isArray(route)
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
   * Live employee marker
   */
  useEffect(() => {
    const map = mapRef.current;

    if (!isReady || !map) return;

    if (!liveMarker) {
      liveMarkerRef.current?.remove();
      liveMarkerRef.current = null;
      lastLiveCenterRef.current = null;
      return;
    }

    const [lat, lng] = liveMarker;

    if (!liveMarkerRef.current) {
      const element = document.createElement("div");

      element.style.width = "16px";
      element.style.height = "16px";
      element.style.borderRadius = "50%";
      element.style.backgroundColor = LIVE_COLOR;
      element.style.border = "3px solid white";
      element.style.boxShadow =
        "0 0 0 5px rgba(48, 156, 68, 0.25)";

      liveMarkerRef.current = new Marker({
        element,
      })
        .setLngLat([lng, lat])
        .addTo(map);

      lastLiveCenterRef.current = [lat, lng];
      map.flyTo({ center: [lng, lat], duration: 800 });

      return;
    }

    liveMarkerRef.current.setLngLat([lng, lat]);

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