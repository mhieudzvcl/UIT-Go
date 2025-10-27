import axios from 'axios';
const base = process.env.DRIVER_SERVICE_URL;

export async function findNearbyDriver(lat, lng) {
  const res = await axios.get(`${base}/drivers/search`, { params: { lat, lng } });
  return res.data; // ví dụ: { id, name, distance }
}
