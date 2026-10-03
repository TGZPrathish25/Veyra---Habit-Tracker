/**
 * Session token generator, verifier, and cookie configuration.
 * Generates secure, HMAC-SHA256 signed 30-day persistent session tokens.
 */
import crypto from 'crypto';
import type { CookieOptions } from 'express';
import { env } from '../config/env.js';

export const SESSION_COOKIE_NAME = 'veyra_session';
export const SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export interface SessionPayload {
  userId: string;
  firebaseUid: string;
  email: string;
  exp: number; // timestamp in ms
}

function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf-8');
}

/**
 * Creates an HMAC-SHA256 signed 30-day persistent session token.
 */
export function generateSessionToken(
  data: { userId: string; firebaseUid: string; email: string },
  days = 30
): string {
  const secret = env.SESSION_SECRET;
  const exp = Date.now() + days * 24 * 60 * 60 * 1000;
  const payload: SessionPayload = {
    userId: data.userId,
    firebaseUid: data.firebaseUid,
    email: data.email,
    exp,
  };

  const header = { alg: 'HS256', typ: 'SESSION' };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  const signature = crypto
    .createHmac('sha256', secret)
    .update(dataToSign)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${dataToSign}.${signature}`;
}

/**
 * Verifies an HMAC-SHA256 session token and validates expiration.
 */
export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, signature] = parts;
    const dataToSign = `${encodedHeader}.${encodedPayload}`;

    const expectedSignature = crypto
      .createHmac('sha256', env.SESSION_SECRET)
      .update(dataToSign)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    // Constant-time comparison to prevent timing attacks
    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);
    if (sigBuffer.length !== expectedBuffer.length) return null;
    if (!crypto.timingSafeEqual(sigBuffer, expectedBuffer)) return null;

    const payload: SessionPayload = JSON.parse(base64UrlDecode(encodedPayload));
    if (!payload.exp || Date.now() > payload.exp) {
      return null; // Expired
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Best practice cookie options: HttpOnly, Secure (in production/HTTPS), SameSite=Lax, 30 days maxAge.
 */
export function getSessionCookieOptions(isProduction = env.NODE_ENV === 'production'): CookieOptions {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE_MS,
    path: '/',
  };
}
