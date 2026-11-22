import crypto from 'crypto';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'pl_admin_session';

function getSessionSecret(): string {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    crypto
      .createHash('sha256')
      .update(`premiumleaf-fallback:${process.env.ADMIN_PASSWORD || 'unconfigured'}`)
      .digest('hex')
  );
}

export function verifyAdminPassword(candidate: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || !candidate) return false;
  const a = Buffer.from(candidate, 'utf8');
  const b = Buffer.from(expected, 'utf8');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function createAdminSessionToken(): string {
  const exp = Date.now() + 1000 * 60 * 60 * 24 * 7; // 7 days
  const payload = `${exp}.${crypto.randomBytes(12).toString('hex')}`;
  const sig = crypto
    .createHmac('sha256', getSessionSecret())
    .update(payload)
    .digest('hex');
  return `${payload}.${sig}`;
}

export function validateAdminSessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const [expStr, nonce, sig] = parts;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < Date.now()) return false;

  const payload = `${expStr}.${nonce}`;
  const expectedSig = crypto
    .createHmac('sha256', getSessionSecret())
    .update(payload)
    .digest('hex');

  const a = Buffer.from(sig, 'utf8');
  const b = Buffer.from(expectedSig, 'utf8');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  return validateAdminSessionToken(token);
}

export function getAdminCookieName(): string {
  return COOKIE_NAME;
}
