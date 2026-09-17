declare global {
  interface Window {
    ymaps?: YMapsNamespace;
  }
}

export interface YMapsNamespace {
  ready: (callback: () => void) => void;
  Map: new (element: HTMLElement, state: Record<string, unknown>, options?: Record<string, unknown>) => YMapInstance;
  Placemark: new (
    coordinates: [number, number],
    properties?: Record<string, unknown>,
    options?: Record<string, unknown>,
  ) => YPlacemark;
  Polyline: new (
    coordinates: [number, number][],
    properties?: Record<string, unknown>,
    options?: Record<string, unknown>,
  ) => YPolyline;
  geoQuery: (objects: unknown[]) => { getBounds: () => [[number, number], [number, number]] | null };
}

export interface YMapInstance {
  setBounds: (
    bounds: [[number, number], [number, number]],
    options?: Record<string, unknown>,
  ) => void;
  setCenter: (center: [number, number], zoom?: number) => void;
  geoObjects: {
    add: (object: unknown) => void;
    remove: (object: unknown) => void;
    removeAll: () => void;
  };
  destroy: () => void;
  getBounds: () => [[number, number], [number, number]];
}

export interface YPlacemark {
  geometry: { setCoordinates: (coordinates: [number, number]) => void };
  events: { add: (event: string, handler: () => void) => void };
}

export interface YPolyline {
  geometry: { setCoordinates: (coordinates: [number, number][]) => void };
}

let loaderPromise: Promise<YMapsNamespace> | null = null;

export function loadYandexMaps(apiKey: string): Promise<YMapsNamespace> {
  if (window.ymaps) {
    return Promise.resolve(window.ymaps);
  }

  if (loaderPromise) {
    return loaderPromise;
  }

  loaderPromise = new Promise<YMapsNamespace>((resolve, reject) => {
    const script = document.createElement("script");
    const keyParam = apiKey ? `&apikey=${encodeURIComponent(apiKey)}` : "";
    script.src = `https://api-maps.yandex.ru/2.1/?lang=ru_RU${keyParam}`;
    script.async = true;
    script.onload = () => {
      if (!window.ymaps) {
        reject(new Error("Yandex Maps script loaded but ymaps namespace is missing"));
        return;
      }
      window.ymaps.ready(() => {
        resolve(window.ymaps as YMapsNamespace);
      });
    };
    script.onerror = () => {
      loaderPromise = null;
      reject(new Error("Failed to load Yandex Maps script"));
    };
    document.head.appendChild(script);
  });

  return loaderPromise;
}
