import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL, HEADERS, SLEEP_DURATION } from '../common/config.js';
import { authenticate } from '../common/utils.js';

export const options = {
  stages: [
    { duration: '2m', target: 200 }, // Below normal breaking point
    { duration: '5m', target: 200 },
    { duration: '2m', target: 400 }, // Likely breaking point
    { duration: '5m', target: 400 },
    { duration: '2m', target: 0 }, // Recovery
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'], // Relaxed threshold for stress
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

  sleep(Math.random() * (SLEEP_DURATION.MAX - SLEEP_DURATION.MIN) + SLEEP_DURATION.MIN);
}
