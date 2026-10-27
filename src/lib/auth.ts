import { SignJWT, jwtVerify } from 'jose';

export const AUTH_COOKIE_NAME = 'auth_token';

// Secret key for JWT signing & verification (from .env or secure fallback)
const JWT_SECRET =
  process.env.JWT_SECRET ||
  'portifoliohub_jwt_secure_key_2026_super_secret_!#$@9651luke';

// Expiration time: 7 days
export const JWT_EXPIRATION_TIME = '7d';
export const JWT_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 days in seconds

export interface AuthTokenPayload {
  userId: string;
  email: string;
  name: string;
  portfolioId: string;
  [key: string]: unknown;
}

/**
 * Signs a cryptographic JWT token with HS256 algorithm and automatic 7-day expiration.
 */
export async function signJwtToken(payload: AuthTokenPayload): Promise<string> {
  const secretKey = new TextEncoder().encode(JWT_SECRET);
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer('portifoliohub')
    .setAudience('portifoliohub_users')
    .setExpirationTime(JWT_EXPIRATION_TIME)
    .sign(secretKey);
}

/**
 * Verifies a JWT token: validates cryptographic signature and ensures it has not expired.
 * Returns decoded payload if valid, or null if expired/tampered with.
 */
export async function verifyJwtToken(
  token: string
): Promise<AuthTokenPayload | null> {
  try {
    const secretKey = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secretKey, {
      issuer: 'portifoliohub',
      audience: 'portifoliohub_users',
    });
    return payload as unknown as AuthTokenPayload;
  } catch {
    return null;
  }
}

/**
 * Extracts and verifies the authenticated user from Request cookies or Authorization Bearer header.
 */
export async function getAuthUserFromRequest(
  request: Request
): Promise<AuthTokenPayload | null> {
  // 1. Try Authorization header: Bearer <token>
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    if (token) {
      const verified = await verifyJwtToken(token);
      if (verified) return verified;
    }
  }

  // 2. Try HttpOnly Cookie: auth_token=<token>
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${AUTH_COOKIE_NAME}=([^;]+)`));
  if (match && match[1]) {
    const cookieToken = decodeURIComponent(match[1]);
    const verified = await verifyJwtToken(cookieToken);
    if (verified) return verified;
  }

  return null;
}

/**
 * Returns security-hardened cookie configuration options.
 */
export function getAuthCookieOptions(maxAgeSeconds = JWT_MAX_AGE_SECONDS) {
  return {
    name: AUTH_COOKIE_NAME,
    httpOnly: true, // Prevents client-side script access (mitigates XSS)
    secure: process.env.NODE_ENV === 'production', // Transmitted only over HTTPS in production
    sameSite: 'lax' as const, // Mitigates CSRF attacks
    path: '/',
    maxAge: maxAgeSeconds,
  };
}
