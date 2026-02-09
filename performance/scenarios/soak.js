import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL, HEADERS, SLEEP_DURATION } from '../common/config.js';
import { authenticate } from '../common/utils.js';

export const options = {
  stages: [
    { duration: '1m', target: 50 },
    { duration: '4h', target: 50 }, // Long duration
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const token = authenticate();
  if (!token) {
    sleep(1);
    return;
  }

  const authHeaders = { ...HEADERS, Authorization: `Bearer ${token}` };

  const meRes = http.get(`${BASE_URL}/users/me`, { headers: authHeaders });

  // Explicitly check for memory usage or degradation signals if possible,
  // but mostly relying on standard metrics stability over time.

  sleep(Math.random() * (SLEEP_DURATION.MAX - SLEEP_DURATION.MIN) + SLEEP_DURATION.MIN);
}
