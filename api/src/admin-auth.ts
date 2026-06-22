/**
 * 관리자 2차 인증 (TOTP 기반)
 * 
 * Google Authenticator, Microsoft Authenticator 등과 호환.
 * admin 계정 로그인 시 TOTP 코드 입력을 요구하여 보안 강화.
 * 
 * 구현 방식:
 * - 관리자 최초 로그인 시 TOTP 시크릿 발급 (QR코드로 Authenticator에 등록)
 * - 이후 로그인 시 6자리 TOTP 코드 필수 입력
 * - URL 조작으로는 admin 페이지 접근 불가 (백엔드에서 토큰+플랜 검증)
 */

import { Env } from './index';

/**
 * TOTP 코드 검증
 * 시간 기반 일회용 비밀번호 (30초 간격)
 * 
 * @param secret - 사용자별 TOTP 시크릿 (DB에 저장)
 * @param code - 사용자가 입력한 6자리 코드
 * @returns 유효 여부
 */
export async function verifyTOTP(secret: string, code: string): Promise<boolean> {
  // 현재 시간 기준 30초 단위 카운터
  const counter = Math.floor(Date.now() / 1000 / 30);

  // 현재 + 이전/다음 시간 윈도우 허용 (시간 오차 대응)
  for (let i = -1; i <= 1; i++) {
    const expected = await generateTOTP(secret, counter + i);
    if (expected === code) return true;
  }
  return false;
}

/**
 * TOTP 코드 생성 (HMAC-SHA1 기반)
 * 시크릿을 Base32 디코딩 후 HMAC 키로 사용
 */
async function generateTOTP(secret: string, counter: number): Promise<string> {
  // Base32 디코딩
  const keyBytes = base32Decode(secret);
  
  const key = await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );

  // 카운터를 8바이트 빅엔디안으로 변환
  const buffer = new ArrayBuffer(8);
  const view = new DataView(buffer);
  view.setUint32(4, counter, false);

  const hmac = await crypto.subtle.sign('HMAC', key, buffer);
  const hmacArray = new Uint8Array(hmac);

  // Dynamic truncation
  const offset = hmacArray[hmacArray.length - 1] & 0x0f;
  const binary = (
    ((hmacArray[offset] & 0x7f) << 24) |
    ((hmacArray[offset + 1] & 0xff) << 16) |
    ((hmacArray[offset + 2] & 0xff) << 8) |
    (hmacArray[offset + 3] & 0xff)
  );

  // 6자리 코드
  return (binary % 1000000).toString().padStart(6, '0');
}

/**
 * Base32 디코딩 (RFC 4648)
 * Google Authenticator는 Base32로 인코딩된 시크릿을 사용
 */
function base32Decode(input: string): Uint8Array {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const cleaned = input.toUpperCase().replace(/[^A-Z2-7]/g, '');
  
  let bits = '';
  for (const c of cleaned) {
    const val = chars.indexOf(c);
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, '0');
  }
  
  const bytes = new Uint8Array(Math.floor(bits.length / 8));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(bits.slice(i * 8, (i + 1) * 8), 2);
  }
  return bytes;
}

/**
 * TOTP 시크릿 생성 (관리자 최초 등록 시)
 * Google Authenticator는 Base32 인코딩된 시크릿을 요구함
 */
export function generateTOTPSecret(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array).map(b => chars[b % 32]).join('');
}

/**
 * 관리자 접근 검증 미들웨어
 * - JWT 토큰 유효성 확인
 * - plan이 admin인지 확인
 * - TOTP 세션이 유효한지 확인
 */
export async function verifyAdminAccess(request: Request, env: Env): Promise<{ valid: boolean; userId?: string; error?: string }> {
  const { getUserIdFromRequest } = await import('./auth');

  // 1. JWT 토큰 검증
  const userId = await getUserIdFromRequest(request, env);
  if (!userId) return { valid: false, error: 'Unauthorized' };

  // 2. admin 플랜 확인
  const user = await env.DB.prepare('SELECT plan FROM users WHERE id = ?').bind(userId).first() as any;
  if (user?.plan !== 'admin') return { valid: false, error: 'Forbidden: admin only' };

  // 3. TOTP 세션 확인 (X-Admin-Session 헤더)
  const adminSession = request.headers.get('X-Admin-Session');
  if (!adminSession) return { valid: false, error: 'Admin 2FA required' };

  // 세션 유효성 검증 (1시간 유효)
  const session = await env.DB.prepare('SELECT * FROM admin_sessions WHERE token = ? AND expires_at > ?')
    .bind(adminSession, new Date().toISOString()).first();
  if (!session) return { valid: false, error: 'Admin session expired' };

  return { valid: true, userId };
}
