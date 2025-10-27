import axios from 'axios';
const base = process.env.USER_SERVICE_URL;

export async function verifyUser(userId, token) {
  const res = await axios.get(`${base}/users/${userId}`, {
    headers: { Authorization: token }
  });
  return res.data;
}
