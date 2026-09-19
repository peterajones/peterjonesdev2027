import { memo, useEffect, useRef } from 'react';

declare global {
  interface Window {
    google?: any;
  }
}

interface Props {
  lat: string;
  lng: string;
  name: string;
  location: string;
}

function Maps({ lat, lng, name }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    const center = { lat: parseFloat(lat), lng: parseFloat(lng) };

    const render = () => {
      if (!containerRef.current || !window.google?.maps || mapRef.current) return;
      const map = new window.google.maps.Map(containerRef.current, { center, zoom: 2 });
      new window.google.maps.Marker({ position: center, map, title: name });
      mapRef.current = map;
    };

    // The Maps script may already be loaded, or may still be loading —
    // either way, render as soon as it's actually available.
    render();
    window.addEventListener('google-maps-loaded', render);
    return () => window.removeEventListener('google-maps-loaded', render);
  }, [lat, lng, name]);

  // The parent <div className={styles.map}> (in Users.tsx) already sizes this
  // via CSS; fill it rather than duplicating the sizing on a second nested node.
  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}

export default memo(Maps);
