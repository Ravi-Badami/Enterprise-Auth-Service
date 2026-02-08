import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL, HEADERS, SLEEP_DURATION } from '../common/config.js';
import { authenticate, randomString } from '../common/utils.js';

export const options = {
  stages: [
    { duration: '30s', target: 50 }, // Ramp up to 50 users
    { duration: '1m', target: 50 },  // Stay at 50 users for 1 minute (Shortened for demo)
    { duration: '30s', target: 0 },  // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.01'],   // Less than 1% failure rate
  },
};

export default function () {
  // 1. Authenticate (Register & Login)
  // Note: specific to this test, each iteration behaves like a new user session
  // For lighter DB load, we could move auth to `setup()` but that doesn't simulate real traffic as well
  const token = authenticate();

  if (!token) {
    sleep(1);
    return;
  }

  const authHeaders = {
    ...HEADERS,
    Authorization: `Bearer ${token}`,
  };

  // 2. Get User Profile (Me)
  const meRes = http.get(`${BASE_URL}/users/me`, { headers: authHeaders });
  check(meRes, {
    'get me status is 200': (r) => r.status === 200,
  });

  // 3. Get All Users (with pagination)
  const usersRes = http.get(`${BASE_URL}/users?page=1&limit=10`, { headers: authHeaders });
  check(usersRes, {
    'get users status is 200': (r) => r.status === 200,
    'users list returned': (r) => r.json('data.users') !== undefined,
  });

  // Random sleep between actions
  sleep(Math.random() * (SLEEP_DURATION.MAX - SLEEP_DURATION.MIN) + SLEEP_DURATION.MIN);
}
