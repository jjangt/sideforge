import { Env } from './index';

// ─── Constants ────────────────────────────────────────────────────────────────

const PLAN_LIMITS: Record<string, number> = {
  free: 3,
  plus: 30,
  pro: 999999,
  admin: 999999,
};

// 관리자 이메일 (환경변수에서 로드)
const getAdminEmails = (env: any): string[] => 
  (env.ADMIN_EMAILS || '').split(',').map((e: string) => e.trim()).filter(Boolean);

// ─── Handlers ─────────────────────────────────────────────────────────────────

export async function handleSignup(request: Request, env: Env): Promise<Response> {
  const { email, password, name } = await request.json() as { email: string; password: string; name?: string };

  if (!email || !password) return json({ error: '이메일과 비밀번호를 입력해주세요' }, 400);
  if (password.length < 8) return json({ error: '비밀번호는 8자 이상이어야 합니다' }, 400);
  if (!isValidEmail(email)) return json({ error: '올바른 이메일 형식을 입력해주세요' }, 400);

  const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
  if (existing) return json({ error: '이미 가입된 이메일입니다' }, 409);

  const id = crypto.randomUUID();
  const passwordHash = await hashPassword(password, env.PASSWORD_SALT || 'sideforge-salt');
  const now = new Date().toISOString();
  const plan = getAdminEmails(env).includes(email) ? 'admin' : 'free';

  await env.DB.prepare(
    'INSERT INTO users (id, email, password_hash, name, plan, analysis_count, provider, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(id, email, passwordHash, name || '', plan, 0, 'email', now).run();

  const token = await createToken(id, email, plan, env);
  return json({ token, user: { id, email, name: name || '', plan, analysisCount: 0 } });
}

export async function handleLogin(request: Request, env: Env): Promise<Response> {
  const { email, password } = await request.json() as { email: string; password: string };

  if (!email || !password) return json({ error: '이메일과 비밀번호를 입력해주세요' }, 400);

  const user = await env.DB.prepare('SELECT * FROM users WHERE email = ? AND provider = ?').bind(email, 'email').first() as any;
  if (!user) return json({ error: '이메일 또는 비밀번호를 확인해주세요' }, 401);

  const valid = await verifyPassword(password, user.password_hash, env.PASSWORD_SALT || 'sideforge-salt');
  if (!valid) return json({ error: '이메일 또는 비밀번호를 확인해주세요' }, 401);

  const token = await createToken(user.id, user.email, user.plan, env);
  return json({ token, user: { id: user.id, email: user.email, name: user.name, plan: user.plan, analysisCount: user.analysis_count } });
}

// ─── Google OAuth ─────────────────────────────────────────────────────────────

export async function handleGoogleAuth(request: Request, env: Env): Promise<Response> {
  const { idToken } = await request.json() as { idToken: string };
  if (!idToken) return json({ error: 'idToken required' }, 400);

  // Google ID Token 검증
  const googleUser = await verifyGoogleToken(idToken);
  if (!googleUser) return json({ error: 'Invalid Google token' }, 401);

  const { email, name, picture } = googleUser;

  // 기존 유저 확인
  let user = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first() as any;

  if (!user) {
    // 신규 가입
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const plan = getAdminEmails(env).includes(email) ? 'admin' : 'free';

    await env.DB.prepare(
      'INSERT INTO users (id, email, password_hash, name, plan, analysis_count, provider, avatar, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(id, email, '', name || '', plan, 0, 'google', picture || '', now).run();

    user = { id, email, name, plan, analysis_count: 0, avatar: picture };
  }

  const token = await createToken(user.id, user.email, user.plan, env);
  return json({ token, user: { id: user.id, email: user.email, name: user.name, plan: user.plan, analysisCount: user.analysis_count, avatar: user.avatar } });
}

async function verifyGoogleToken(idToken: string): Promise<{ email: string; name: string; picture: string } | null> {
  try {
    const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
    if (!res.ok) return null;
    const data = await res.json() as any;
    if (!data.email || !data.email_verified) return null;
    return { email: data.email, name: data.name || '', picture: data.picture || '' };
  } catch {
    return null;
  }
}

// ─── User Info ────────────────────────────────────────────────────────────────

export async function handleMe(request: Request, env: Env): Promise<Response> {
  const userId = await getUserIdFromRequest(request, env);
  if (!userId) return json({ error: 'Unauthorized' }, 401);

  const user = await env.DB.prepare('SELECT id, email, name, plan, analysis_count, provider, avatar, created_at FROM users WHERE id = ?').bind(userId).first() as any;
  if (!user) return json({ error: 'User not found' }, 404);

  return json({ id: user.id, email: user.email, name: user.name, plan: user.plan, analysisCount: user.analysis_count, provider: user.provider, avatar: user.avatar });
}

// ─── Token Utilities ──────────────────────────────────────────────────────────

export async function getUserIdFromRequest(request: Request, env: Env): Promise<string | null> {
  const auth = request.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  return verifyToken(auth.slice(7), env);
}

async function createToken(userId: string, email: string, plan: string, env: Env): Promise<string> {
  const payload = {
    sub: userId,
    email,
    plan,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7일
  };
  const encoder = new TextEncoder();
  const secret = env.JWT_SECRET || 'dev-secret-change-in-production';
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(`${header}.${body}`));
  const signature = btoa(String.fromCharCode(...new Uint8Array(sig)));
  return `${header}.${body}.${signature}`;
}

async function verifyToken(token: string, env: Env): Promise<string | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [header, body, signature] = parts;
    const encoder = new TextEncoder();
    const secret = env.JWT_SECRET || 'dev-secret-change-in-production';
    const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
    const sig = Uint8Array.from(atob(signature), c => c.charCodeAt(0));
    const valid = await crypto.subtle.verify('HMAC', key, sig, encoder.encode(`${header}.${body}`));
    if (!valid) return null;

    const payload = JSON.parse(atob(body));
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;

    return payload.sub;
  } catch {
    return null;
  }
}

// ─── Password Utilities ───────────────────────────────────────────────────────

async function hashPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyPassword(password: string, hash: string, salt: string): Promise<boolean> {
  const computed = await hashPassword(password, salt);
  // Timing-safe comparison
  if (computed.length !== hash.length) return false;
  let result = 0;
  for (let i = 0; i < computed.length; i++) {
    result |= computed.charCodeAt(i) ^ hash.charCodeAt(i);
  }
  return result === 0;
}

// ─── Plan Limits ──────────────────────────────────────────────────────────────

export async function checkAnalysisLimit(userId: string, env: Env): Promise<{ allowed: boolean; remaining: number }> {
  const user = await env.DB.prepare('SELECT plan, analysis_count FROM users WHERE id = ?').bind(userId).first() as any;
  if (!user) return { allowed: false, remaining: 0 };

  const limit = PLAN_LIMITS[user.plan] || 3;
  if (user.plan === 'admin') return { allowed: true, remaining: 999999 };

  const remaining = limit - user.analysis_count;
  return { allowed: remaining > 0, remaining: Math.max(0, remaining) };
}

export async function incrementAnalysisCount(userId: string, env: Env): Promise<void> {
  const user = await env.DB.prepare('SELECT plan FROM users WHERE id = ?').bind(userId).first() as any;
  if (user?.plan === 'admin') return; // 관리자는 카운트 안 함
  await env.DB.prepare('UPDATE users SET analysis_count = analysis_count + 1 WHERE id = ?').bind(userId).run();
}

// ─── Validation ───────────────────────────────────────────────────────────────

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function json(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Simulate-Plan, X-Admin-Session' },
  });
}
