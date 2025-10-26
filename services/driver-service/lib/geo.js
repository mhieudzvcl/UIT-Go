const R = 6371;
export function haversineKm(lat1, lon1, lat2, lon2) {
  const toRad = (v) => v * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export function bbox(lat, lng, radiusKm) {
  const d = radiusKm / R;
  const latR = d * (180/Math.PI);
  const lngR = d * (180/Math.PI) / Math.cos(lat * Math.PI/180);
  return { minLat: lat - latR, maxLat: lat + latR, minLng: lng - lngR, maxLng: lng + lngR };
}
