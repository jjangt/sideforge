import { Env } from './index';

// ─── Auth Handlers ────────────────────────────────────────────────────────────

export async function handleSignup(request: Request, env: Env): Promise<Response> {
  const { email, password, name } = await request.json() as { email: string; password: string; name?: string };

  if (!email || !password) {
    return json({ error: 'email and password required' }, 400);
  }

  const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
  if (existing) {
    return json({ error: 'Email already exists' }, 409);
  }

  const id = crypto.randomUUID();
  const passwordHash = await hashPassword(password);
  const now = new Date().toISOString();

  await env.DB.prepare(
    'INSERT INTO users (id, email, password_hash, name, plan, analysis_count, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).bind(id, email, passwordHash, name || '', 'free', 0, now).run();

  const token = await createToken(id, env);

  return json({ token, user: { id, email, name: name || '', plan: 'free', analysisCount: 0 } });
}

export async function handleLogin(request: Request, env: Env): Promise<Response> {
  const { email, password } = await request.json() as { email: string; password: string };

  if (!email || !password) {
    return json({ error: 'email and password required' }, 400);
  }

  const user = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first() as any;
  if (!user) {
    return json({ error: 'Invalid credentials' }, 401);
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    return json({ error: 'Invalid credentials' }, 401);
  }

  const token = await createToken(user.id, env);

  return json({ token, user: { id: user.id, email: user.email, name: user.name, plan: user.plan, analysisCount: user.analysis_count } });
}

export async function handleMe(request: Request, env: Env): Promise<Response> {
  const userId = await getUserIdFromRequest(request, env);
  if (!userId) return json({ error: 'Unauthorized' }, 401);

  const user = await env.DB.prepare('SELECT id, email, name, plan, analysis_count, created_at FROM users WHERE id = ?').bind(userId).first() as any;
  if (!user) return json({ error: 'User not found' }, 404);

  return json({ id: user.id, email: user.email, name: user.name, plan: user.plan, analysisCount: user.analysis_count });
}

// ─── Auth Utilities ───────────────────────────────────────────────────────────

export async function getUserIdFromRequest(request: Request, env: Env): Promise<string | null> {
  const auth = request.headers.get('Authorization');
  if (!auth || !auth.startsWith('Bearer ')) return null;

  const token = auth.slice(7);
  return verifyToken(token, env);
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(hash)));
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const computed = await hashPassword(password);
  return computed === hash;
}

async function createToken(userId: string, env: Env): Promise<string> {
  const payload = { sub: userId, iat: Date.now(), exp: Date.now() + 7 * 24 * 60 * 60 * 1000 };
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', encoder.encode(env.JWT_SECRET || 'dev-secret'), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const data = encoder.encode(JSON.stringify(payload));
  const sig = await crypto.subtle.sign('HMAC', key, data);
  return btoa(JSON.stringify(payload)) + '.' + btoa(String.fromCharCode(...new Uint8Array(sig)));
}

async function verifyToken(token: string, env: Env): Promise<string | null> {
  try {
    const [payloadB64, sigB64] = token.split('.');
    if (!payloadB64 || !sigB64) return null;

    const payload = JSON.parse(atob(payloadB64));
    if (payload.exp < Date.now()) return null;

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey('raw', encoder.encode(env.JWT_SECRET || 'dev-secret'), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
    const data = encoder.encode(JSON.stringify(payload));
    const sig = Uint8Array.from(atob(sigB64), c => c.charCodeAt(0));
    const valid = await crypto.subtle.verify('HMAC', key, sig, data);

    return valid ? payload.sub : null;
  } catch {
    return null;
  }
}

// ─── Plan Limits ──────────────────────────────────────────────────────────────

const PLAN_LIMITS: Record<string, number> = {
  free: 3,
  plus: 30,
  pro: 999999,
};

export async function checkAnalysisLimit(userId: string, env: Env): Promise<{ allowed: boolean; remaining: number }> {
  const user = await env.DB.prepare('SELECT plan, analysis_count FROM users WHERE id = ?').bind(userId).first() as any;
  if (!user) return { allowed: false, remaining: 0 };

  const limit = PLAN_LIMITS[user.plan] || 3;
  const remaining = limit - user.analysis_count;

  return { allowed: remaining > 0, remaining: Math.max(0, remaining) };
}

export async function incrementAnalysisCount(userId: string, env: Env): Promise<void> {
  await env.DB.prepare('UPDATE users SET analysis_count = analysis_count + 1 WHERE id = ?').bind(userId).run();
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function json(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
