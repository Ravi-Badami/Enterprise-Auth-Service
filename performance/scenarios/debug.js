import http from 'k6/http';
import { check } from 'k6';
import { BASE_URL, HEADERS } from '../common/config.js';

export default function () {
  console.log(`Attempting to connect to: ${BASE_URL}`);

  // Try a simple health check or root endpoint first if it exists, or just register
  const payload = JSON.stringify({
    name: 'Debug User',
    email: `debug_${Date.now()}@example.com`,
    password: 'password123',
  });

  const res = http.post(`${BASE_URL}/auth/register`, payload, { headers: HEADERS });

  console.log(`Response Status: ${res.status}`);
  console.log(`Response Body: ${res.body}`);

  if (res.error) {
    console.log(`Response Error: ${res.error}`);
    console.log(`Response Error Code: ${res.error_code}`);
  }

  check(res, {
    'status is 200': (r) => r.status === 200,
  });
}
