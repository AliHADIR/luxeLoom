import { createHmac, timingSafeEqual } from 'node:crypto';

export const ADMIN_COOKIE_NAME = 'luxe_loom_admin';
export const ADMIN_SESSION_SECONDS = 60 * 60 * 8;

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function sign(value: string, secret: string) {
  return createHmac('sha256', secret).update(value).digest('base64url');
}

export function verifyAdminPassword(candidate: unknown) {
  const password = process.env.ADMIN_PASSWORD;
  return typeof candidate === 'string' && Boolean(password) && safeEqual(candidate, password!);
}

export function createAdminSession() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return null;
  const expiresAt = Math.floor(Date.now() / 1000) + ADMIN_SESSION_SECONDS;
  return `${expiresAt}.${sign(String(expiresAt), secret)}`;
}

export function isAdminSessionValid(token?: string) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || !token) return false;
  const [expiresAt, signature] = token.split('.');
  if (!expiresAt || !signature || Number(expiresAt) <= Date.now() / 1000) return false;
  return safeEqual(signature, sign(expiresAt, secret));
}

export function isAdminConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD && process.env.ADMIN_SESSION_SECRET);
}
