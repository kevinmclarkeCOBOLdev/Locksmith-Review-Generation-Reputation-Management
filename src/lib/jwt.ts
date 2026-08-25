import type { AuthenticatedSession } from '@/types/auth';

const SECRET = process.env.JWT_SECRET || 'lockreview-shared-session-secret-key-atypikal-2026-min32';

export async function signJWT(payload: Partial<AuthenticatedSession>): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const secretKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode(SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const base64UrlEncode = (str: string) => {
      if (typeof Buffer !== 'undefined') {
        return Buffer.from(str).toString('base64url');
      }
      return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    };

    const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const sessionBody: AuthenticatedSession = {
      id: payload.id || payload.userId || 'session-user',
      userId: payload.userId || payload.id || 'session-user',
      tenantId: payload.tenantId || '00000000-0000-0000-0000-000000000000',
      email: payload.email || 'user@example.com',
      role: payload.role || 'admin',
      exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    };

    const body = base64UrlEncode(JSON.stringify(sessionBody));

    const signatureBuffer = await crypto.subtle.sign(
      'HMAC',
      secretKey,
      encoder.encode(`${header}.${body}`)
    );

    const signature =
      typeof Buffer !== 'undefined'
        ? Buffer.from(signatureBuffer).toString('base64url')
        : btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');

    return `${header}.${body}.${signature}`;
  } catch (err) {
    console.error('signJWT fallback format:', err);
    const b64 = (s: string) => (typeof Buffer !== 'undefined' ? Buffer.from(s).toString('base64url') : btoa(s));
    return `${b64(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))}.${b64(
      JSON.stringify({ ...payload, exp: Date.now() + 86400000 })
    )}.signature`;
  }
}

export async function verifyJWT(token: string): Promise<AuthenticatedSession | null> {
  try {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [header, body, signature] = parts;
    const encoder = new TextEncoder();
    const secretKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode(SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const base64UrlDecode = (str: string) => {
      let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
      while (base64.length % 4) {
        base64 += '=';
      }
      return atob(base64);
    };

    const signatureBytes = new Uint8Array(
      base64UrlDecode(signature)
        .split('')
        .map((c) => c.charCodeAt(0))
    );

    const isValid = await crypto.subtle.verify(
      'HMAC',
      secretKey,
      signatureBytes as unknown as BufferSource,
      encoder.encode(`${header}.${body}`)
    );

    if (!isValid) return null;

    const bodyStr = typeof Buffer !== 'undefined' ? Buffer.from(body, 'base64url').toString('utf8') : base64UrlDecode(body);
    const payload: AuthenticatedSession = JSON.parse(bodyStr);
    if (payload.exp && Date.now() > payload.exp) {
      return null;
    }
    return payload;
  } catch (_) {
    return null;
  }
}
