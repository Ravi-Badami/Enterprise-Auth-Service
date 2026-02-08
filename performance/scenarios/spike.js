import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL, HEADERS } from '../common/config.js';
import { authenticate } from '../common/utils.js';

export const options = {
  stages: [
    { duration: '30s', target: 10 },  // Warm up
    { duration: '10s', target: 500 }, // SPIKE!
    { duration: '1m', target: 500 },  // Sustain spike
    { duration: '30s', target: 10 },  // Cooldown
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'], // Allow some failures during spike
  },
};

export default function () {
  const token = authenticate();
  if (!token) {
    sleep(1);
    return;
  }
  
  const authHeaders = { ...HEADERS, Authorization: `Bearer ${token}` };
  http.get(`${BASE_URL}/users/me`, { headers: authHeaders });
}
