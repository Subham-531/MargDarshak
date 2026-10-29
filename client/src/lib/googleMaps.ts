import { importLibrary, setOptions } from '@googlemaps/js-api-loader';

let mapsLibraryPromise: Promise<{
  maps: google.maps.MapsLibrary;
  routes: google.maps.RoutesLibrary;
}> | null = null;

export function loadGoogleMaps(): Promise<{
  maps: google.maps.MapsLibrary;
  routes: google.maps.RoutesLibrary;
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
    mapsLibraryPromise = Promise.resolve().then(() => {
      setOptions({ key, v: 'weekly' });
      return Promise.all([
        importLibrary('maps'),
        importLibrary('routes'),
      ]).then(([maps, routes]) => ({ maps, routes }));
    });
  }

  return mapsLibraryPromise;
}
