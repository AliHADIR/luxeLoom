import { createHmac, timingSafeEqual } from 'node:crypto';

const COOKIE_NAME = 'luxe_loom_admin';
const SESSION_SECONDS = 60 * 60 * 8;

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function sign(value: string, secret: string) {
  return createHmac('sha256', secret).update(value).digest('base64url');
}

function createSession(secret: string) {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  return `${expiresAt}.${sign(String(expiresAt), secret)}`;
}

function isValidSession(token: string | undefined, secret: string) {
  if (!token) return false;
  const [expiresAt, signature] = token.split('.');
  if (!expiresAt || !signature || Number(expiresAt) <= Date.now() / 1000) return false;
  return safeEqual(signature, sign(expiresAt, secret));
}

function readCookie(cookieHeader: string | undefined, name: string) {
  return cookieHeader
    ?.split(';')
    .map(cookie => cookie.trim().split('='))
    .find(([key]) => key === name)?.[1];
}

export default function handler(req: any, res: any) {
  const password = process.env.ADMIN_PASSWORD;
  const sessionSecret = process.env.ADMIN_SESSION_SECRET;

  if (!password || !sessionSecret) {
    return res.status(503).json({ authenticated: false, error: 'Admin access is not configured.' });
  }

  if (req.method === 'GET') {
    const token = readCookie(req.headers.cookie, COOKIE_NAME);
    return res.status(isValidSession(token, sessionSecret) ? 200 : 401).json({ authenticated: isValidSession(token, sessionSecret) });
  }

  if (req.method === 'POST') {
    if (typeof req.body?.password !== 'string' || !safeEqual(req.body.password, password)) {
      return res.status(401).json({ authenticated: false });
    }

    res.setHeader('Set-Cookie', `${COOKIE_NAME}=${createSession(sessionSecret)}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${SESSION_SECONDS}`);
    return res.status(200).json({ authenticated: true });
  }

  if (req.method === 'DELETE') {
    res.setHeader('Set-Cookie', `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`);
    return res.status(200).json({ authenticated: false });
  }

  res.setHeader('Allow', 'GET, POST, DELETE');
  return res.status(405).end();
}
