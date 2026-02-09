import { check } from 'k6';
import http from 'k6/http';
import { BASE_URL, HEADERS } from './config.js';

// Generate a random string
export function randomString(length) {
  const charset = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let res = '';
  for (let i = 0; i < length; i++) {
    res += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return res;
}

// Generate random user data
export function generateUser() {
  const uniqueId = randomString(8);
  return {
    name: `Load Test User ${uniqueId}`,
    email: `loadtest_${uniqueId}@example.com`,
    password: 'password123',
  };
}

// Helper to register and login a user
export function authenticate() {
  const userData = generateUser();

  // Register
  // 1. Register
  const regRes = http.post(`${BASE_URL}/auth/register`, JSON.stringify(userData), {
    headers: HEADERS,
  });

  const isRegSuccess = check(regRes, {
    'register status is 200': (r) => r.status === 200,
  });

  if (!isRegSuccess) {
    console.error(`Register failed for ${userData.email}: ${regRes.status} ${regRes.body}`);
    return null;
  }

  const verificationToken = regRes.json('verificationToken');

  // 2. Verify Email
  if (verificationToken) {
    const verifyRes = http.get(`${BASE_URL}/auth/verifyemail/${verificationToken}`, {
      headers: HEADERS,
    });
    check(verifyRes, {
      'verify email status is 200': (r) => r.status === 200,
    });
  } else {
    console.error(`No verification token returned for ${userData.email}`);
  }

  // 3. Login
  const loginPayload = JSON.stringify({
    email: userData.email,
    password: userData.password,
  });

  const loginRes = http.post(`${BASE_URL}/auth/login`, loginPayload, { headers: HEADERS });

  const isLoginSuccessful = check(loginRes, {
    'login status is 200': (r) => r.status === 200,
    'has access token': (r) => r.json('accessToken') !== undefined, // Changed from data.tokens.access.token based on likely structure, will verify
  });

  if (!isLoginSuccessful) {
    console.error(`Login failed for ${userData.email}: ${loginRes.status}`);
    return null;
  }

  return loginRes.json('accessToken');
}
