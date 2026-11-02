import { importLibrary, setOptions } from '@googlemaps/js-api-loader';

let mapsLibraryPromise: Promise<{
  maps: google.maps.MapsLibrary;
  routes: google.maps.RoutesLibrary | null;
}> | null = null;

export function loadGoogleMaps(): Promise<{
  maps: google.maps.MapsLibrary;
  routes: google.maps.RoutesLibrary | null;
}> {
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim();
  if (!key) {
    return Promise.reject(
      new Error(
        'Google Maps API key is missing. Set VITE_GOOGLE_MAPS_API_KEY in client/.env.local and restart the frontend.'
      )
    );
  }

  if (!mapsLibraryPromise) {
    mapsLibraryPromise = Promise.resolve().then(async () => {
      setOptions({ key, v: 'weekly' });
      const maps = (await importLibrary('maps')) as google.maps.MapsLibrary;
      let routes: google.maps.RoutesLibrary | null = null;
      try {
        routes = (await importLibrary('routes')) as google.maps.RoutesLibrary;
      } catch (err) {
        console.warn('[MargDarshak] Routes library optional load skipped, will use DirectionsService:', err);
      }
      return { maps, routes };
    });
  }

  return mapsLibraryPromise;
}
