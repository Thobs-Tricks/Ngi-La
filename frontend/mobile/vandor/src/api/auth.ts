// Placeholder auth "API" — the backend doesn't exist yet (see /backend).
// Swap these for real network calls once endpoints are available; the
// shapes (LoginPayload/RegisterPayload -> AuthSession) are designed to match
// what a real API would return, so callers shouldn't need to change.

import type { AuthSession, LoginPayload, RegisterPayload } from '../types';
import { SESSION_TTL_MS } from '../lib/storage';

function fakeDelay(ms = 600) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function fakeToken() {
  return `mock.${Date.now()}.${Math.random().toString(36).slice(2)}`;
}

export async function login(payload: LoginPayload): Promise<AuthSession> {
  await fakeDelay();

  if (!payload.identifier || !payload.password) {
    throw new Error('Enter your phone/email and password.');
  }

  return {
    user: {
      id: 'mock-user-1',
      fullNames: 'Vendor Name',
      gender: 'other',
      phoneNumber: payload.identifier.includes('@') ? '' : payload.identifier,
      email: payload.identifier.includes('@') ? payload.identifier : '',
    },
    token: fakeToken(),
    expiresAt: Date.now() + SESSION_TTL_MS,
  };
}

export async function register(payload: RegisterPayload): Promise<AuthSession> {
  await fakeDelay();

  if (!payload.acceptedTerms) {
    throw new Error('You must accept the Terms & Conditions.');
  }

  return {
    user: {
      id: 'mock-user-1',
      fullNames: payload.fullNames,
      gender: payload.gender,
      phoneNumber: payload.phoneNumber,
      email: payload.email,
    },
    token: fakeToken(),
    expiresAt: Date.now() + SESSION_TTL_MS,
  };
}
