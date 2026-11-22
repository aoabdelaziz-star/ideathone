/**
 * DEMO ONLY — intentionally small in-memory auth backend.
 *
 * It verifies the demo password against a bcrypt hash supplied from the
 * environment (never shipped to the browser), issues a signed httpOnly
 * session cookie and applies a basic per-IP rate limit. Replace with a real
 * backend before any production deployment.
 */
import { createHmac, timingSafeEqual } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import bcrypt from 'bcryptjs';
import type { Plugin } from 'vite';

const COOKIE_NAME = 'vms_session';
const SESSION_TTL = 12 * 60 * 60 * 1000;
const REMEMBER_TTL = 30 * 24 * 60 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const ATTEMPT_WINDOW = 15 * 60 * 1000;

interface RateRecord {
  count: number;
  resetAt: number;
}

interface AuthOptions {
  username: string;
  passwordHash: string;
  sessionSecret: string;
}

function base64url(value: string) {
  return Buffer.from(value).toString('base64url');
}

function sign(payload: string, secret: string) {
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

function createToken(username: string, secret: string, remember: boolean) {
  const payload = base64url(JSON.stringify({ u: username, exp: Date.now() + (remember ? REMEMBER_TTL : SESSION_TTL) }));
  return `${payload}.${sign(payload, secret)}`;
}

function readToken(token: string | undefined, secret: string): { username: string } | null {
  if (!token) return null;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;
  const expected = sign(payload, secret);
  if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { u: string; exp: number };
    if (!parsed.u || parsed.exp < Date.now()) return null;
    return { username: parsed.u };
  } catch {
    return null;
  }
}

function cookieValue(req: IncomingMessage, name: string) {
  const header = req.headers.cookie ?? '';
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return decodeURIComponent(rest.join('='));
  }
  return undefined;
}

async function readJson(req: IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as string);
    size += buffer.length;
    if (size > 10_000) throw new Error('Payload too large');
    chunks.push(buffer);
  }
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString('utf8')) as Record<string, unknown>;
}

function json(res: ServerResponse, status: number, body: unknown, cookieHeader?: string) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  if (cookieHeader) res.setHeader('Set-Cookie', cookieHeader);
  res.end(JSON.stringify(body));
}

function secureFlag(req: IncomingMessage) {
  return req.headers['x-forwarded-proto'] === 'https' || process.env.VMS_COOKIE_SECURE === 'true';
}

export function demoAuthPlugin(options: AuthOptions): Plugin {
  const attempts = new Map<string, RateRecord>();
  const user = options.username.trim().toLocaleLowerCase();
  const displayName = 'Omar Nad';

  const middleware = async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const path = (req.url ?? '/').split('?')[0];
    if (!path.startsWith('/api/auth/')) {
      next();
      return;
    }

    if (path === '/api/auth/login' && req.method === 'POST') {
      let body: Record<string, unknown>;
      try {
        body = await readJson(req);
      } catch {
        json(res, 400, { message: 'Invalid request' });
        return;
      }

      const username = typeof body.username === 'string' ? body.username.trim().toLocaleLowerCase() : '';
      const password = typeof body.password === 'string' ? body.password : '';
      const remember = body.remember === true;
      const ip = req.socket.remoteAddress ?? 'unknown';
      const key = `${ip}:${username}`;
      const now = Date.now();
      const record = attempts.get(key);
      if (record && record.resetAt > now && record.count >= MAX_ATTEMPTS) {
        json(res, 429, { message: 'rate_limited' });
        return;
      }
      if (!record || record.resetAt <= now) attempts.set(key, { count: 0, resetAt: now + ATTEMPT_WINDOW });

      const matchesUser = username === user;
      const matchesPassword = await bcrypt.compare(password, options.passwordHash);
      if (!matchesUser || !matchesPassword) {
        const current = attempts.get(key)!;
        current.count += 1;
        json(res, 401, { message: 'invalid_credentials' });
        return;
      }

      attempts.delete(key);
      const maxAge = Math.round((remember ? REMEMBER_TTL : SESSION_TTL) / 1000);
      const cookie = [
        `${COOKIE_NAME}=${encodeURIComponent(createToken(user, options.sessionSecret, remember))}`,
        'HttpOnly',
        'SameSite=Lax',
        'Path=/',
        `Max-Age=${maxAge}`,
        ...(secureFlag(req) ? ['Secure'] : []),
      ].join('; ');
      json(res, 200, { user: { username: user, displayName, role: 'Operations Manager' } }, cookie);
      return;
    }

    if (path === '/api/auth/session' && req.method === 'GET') {
      const session = readToken(cookieValue(req, COOKIE_NAME), options.sessionSecret);
      if (!session) {
        json(res, 401, { message: 'unauthenticated' });
        return;
      }
      json(res, 200, { user: { username: session.username, displayName, role: 'Operations Manager' } });
      return;
    }

    if (path === '/api/auth/logout' && req.method === 'POST') {
      json(res, 200, { ok: true }, `${COOKIE_NAME}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`);
      return;
    }

    json(res, 404, { message: 'Not found' });
  };

  return {
    name: 'vms-demo-auth',
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
}
