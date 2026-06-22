import { handleSignup, handleLogin, handleMe, handleGoogleAuth, getUserIdFromRequest, checkAnalysisLimit, incrementAnalysisCount } from './auth';

export interface Env {
  AI: any;
  DB: D1Database;
  YOUTUBE_API_KEY: string;
  JWT_SECRET: string;
  PASSWORD_SALT: string;
  GOOGLE_CLIENT_ID: string;
  ADMIN_EMAILS: string;
  ENVIRONMENT: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === 'OPTIONS') return corsResponse();

    try {
      // Health
      if (path === '/api/health') return json({ status: 'ok', env: env.ENVIRONMENT });

      // Auth
      if (path === '/api/auth/signup' && request.method === 'POST') return handleSignup(request, env);
      if (path === '/api/auth/login' && request.method === 'POST') return handleLogin(request, env);
      if (path === '/api/auth/google' && request.method === 'POST') return handleGoogleAuth(request, env);
      if (path === '/api/auth/me' && request.method === 'GET') return handleMe(request, env);

      // YouTube Analysis (인증 필요)
      if (path === '/api/analyze/youtube' && request.method === 'POST') {
        const userId = await getUserIdFromRequest(request, env);
        if (!userId) return json({ error: 'Unauthorized' }, 401);

        // 일일 전체 AI 사용량 제한 (무료 티어 보호)
        const dailyKey = `daily_${new Date().toISOString().slice(0, 10)}`;
        const dailyCount = Number((await env.DB.prepare('SELECT COUNT(*) as cnt FROM reports WHERE created_at LIKE ?').bind(`${new Date().toISOString().slice(0, 10)}%`).first() as any)?.cnt || 0);
        if (dailyCount >= 280) return json({ error: 'Daily server limit reached. Try again tomorrow.', code: 'DAILY_LIMIT' }, 429);

        const { allowed, remaining } = await checkAnalysisLimit(userId, env);
        if (!allowed) return json({ error: 'Analysis limit reached', remaining: 0 }, 403);

        const result = await handleYouTubeAnalysis(request, env, userId);
        await incrementAnalysisCount(userId, env);
        return result;
      }

      // Get Report (인증 필요 — 플랜별 데이터 분기)
      if (path.startsWith('/api/report/') && request.method === 'GET') {
        const reportId = path.replace('/api/report/', '');
        const userId = await getUserIdFromRequest(request, env);
        if (!userId) return json({ error: 'Unauthorized' }, 401);
        const user = await env.DB.prepare('SELECT plan FROM users WHERE id = ?').bind(userId).first() as any;
        // 관리자 시뮬레이션: X-Simulate-Plan 헤더가 있으면 해당 플랜으로 필터링
        const simulatePlan = request.headers.get('X-Simulate-Plan');
        const effectivePlan = (user?.plan === 'admin' && simulatePlan) ? simulatePlan : (user?.plan || 'free');
        return handleGetReport(reportId, effectivePlan, env);
      }

      // My Reports
      if (path === '/api/reports' && request.method === 'GET') {
        const userId = await getUserIdFromRequest(request, env);
        if (!userId) return json({ error: 'Unauthorized' }, 401);
        return handleMyReports(userId, env);
      }

      // Admin APIs
      if (path === '/api/admin/verify-totp' && request.method === 'POST') {
        const userId = await getUserIdFromRequest(request, env);
        if (!userId) return json({ error: 'Unauthorized' }, 401);
        const user = await env.DB.prepare('SELECT plan, totp_secret FROM users WHERE id = ?').bind(userId).first() as any;
        if (user?.plan !== 'admin') return json({ error: 'Forbidden' }, 403);
        return handleAdminTOTP(request, userId, user.totp_secret, env);
      }

      if (path === '/api/admin/stats' && request.method === 'GET') {
        const userId = await getUserIdFromRequest(request, env);
        if (!userId) return json({ error: 'Unauthorized' }, 401);
        const user = await env.DB.prepare('SELECT plan FROM users WHERE id = ?').bind(userId).first() as any;
        if (user?.plan !== 'admin') return json({ error: 'Forbidden' }, 403);
        return handleAdminStats(env);
      }

      if (path === '/api/admin/users' && request.method === 'GET') {
        const userId = await getUserIdFromRequest(request, env);
        if (!userId) return json({ error: 'Unauthorized' }, 401);
        const user = await env.DB.prepare('SELECT plan FROM users WHERE id = ?').bind(userId).first() as any;
        if (user?.plan !== 'admin') return json({ error: 'Forbidden' }, 403);
        return handleAdminUsers(env);
      }

      return json({ error: 'Not found' }, 404);
    } catch (e: any) {
      return json({ error: e.message || 'Internal error', stack: e.stack?.slice(0, 200) }, 500);
    }
  },
};

// ─── YouTube Analysis ─────────────────────────────────────────────────────────

async function handleYouTubeAnalysis(request: Request, env: Env, userId: string): Promise<Response> {
  const body = await request.json() as { url: string };
  if (!body.url) return json({ error: 'url is required' }, 400);

  const channelId = extractChannelId(body.url);
  if (!channelId) return json({ error: `URL을 인식할 수 없습니다: ${body.url}` }, 400);

  const channelData = await fetchChannelData(channelId, env.YOUTUBE_API_KEY);
  const videos = await fetchRecentVideos(channelData.id, env.YOUTUBE_API_KEY);
  const analysis = await analyzeWithAI(env.AI, channelData, videos);

  const reportId = crypto.randomUUID();
  const fullData = { channel: channelData, videos, analysis };
  await env.DB.prepare(
    'INSERT INTO reports (id, user_id, channel_id, channel_name, platform, data, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).bind(reportId, userId, channelData.id, channelData.title, 'youtube', JSON.stringify(fullData), new Date().toISOString()).run();

  // 플랜별 응답 필터링 (관리자 시뮬레이션 지원)
  const user = await env.DB.prepare('SELECT plan FROM users WHERE id = ?').bind(userId).first() as any;
  const simulatePlan = request.headers.get('X-Simulate-Plan');
  const effectivePlan = (user?.plan === 'admin' && simulatePlan) ? simulatePlan : (user?.plan || 'free');
  const filtered = filterByPlan(fullData, effectivePlan);

  return json({ reportId, ...filtered, plan: effectivePlan });
}

async function handleGetReport(reportId: string, plan: string, env: Env): Promise<Response> {
  const result = await env.DB.prepare('SELECT * FROM reports WHERE id = ?').bind(reportId).first() as any;
  if (!result) return json({ error: 'Report not found' }, 404);

  const fullData = JSON.parse(result.data);
  const filtered = filterByPlan(fullData, plan);

  return json({ id: result.id, channelName: result.channel_name, platform: result.platform, data: filtered, plan, createdAt: result.created_at });
}

// 플랜별 데이터 필터링 (백엔드에서 잘라냄)
function filterByPlan(data: any, plan: string): any {
  if (plan === 'admin' || plan === 'pro') return data;

  const { channel, videos, analysis } = data;

  if (plan === 'plus') {
    return {
      channel,
      videos: videos.slice(0, 10),
      analysis: {
        ...analysis,
        benchmarks: analysis.benchmarks ? [analysis.benchmarks[0]] : [],
      },
    };
  }

  // Free: 제한된 데이터만
  return {
    channel: { title: channel.title, thumbnail: channel.thumbnail, subscribers: channel.subscribers, videoCount: channel.videoCount },
    videos: [],
    analysis: {
      score: analysis.score,
      summary: analysis.summary,
      strengths: analysis.strengths?.slice(0, 1) || [],
      weaknesses: analysis.weaknesses?.slice(0, 1) || [],
      actions: 'LOCKED',
      contentIdeas: 'LOCKED',
      benchmarks: 'LOCKED',
    },
  };
}

async function handleMyReports(userId: string, env: Env): Promise<Response> {
  const results = await env.DB.prepare('SELECT id, channel_name, platform, created_at FROM reports WHERE user_id = ? ORDER BY created_at DESC LIMIT 50').bind(userId).all();
  return json({ reports: results.results });
}

// ─── Admin ─────────────────────────────────────────────────────────────────────

/**
 * 관리자 TOTP 2차 인증 처리
 * - 최초 접근 시 totp_secret이 없으면 생성하여 반환 (QR 등록용)
 * - 이후 접근 시 코드 검증 후 1시간 세션 발급
 */
async function handleAdminTOTP(request: Request, userId: string, totpSecret: string, env: Env): Promise<Response> {
  const { verifyTOTP, generateTOTPSecret } = await import('./admin-auth');
  const body = await request.json() as { code?: string };

  // 최초 설정: totp_secret이 없거나 빈 문자열이면 생성
  if (!totpSecret || totpSecret.trim() === '') {
    const secret = generateTOTPSecret();
    await env.DB.prepare('UPDATE users SET totp_secret = ? WHERE id = ?').bind(secret, userId).run();
    return json({ needSetup: true, secret, message: 'Google Authenticator에 이 시크릿을 등록하세요' });
  }

  // 코드 검증
  if (!body.code || body.code.trim() === '') return json({ error: 'TOTP code required' }, 400);

  const valid = await verifyTOTP(totpSecret, body.code.trim());
  if (!valid) return json({ error: 'Invalid TOTP code' }, 401);

  // 1시간 세션 발급
  const sessionToken = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  await env.DB.prepare('INSERT INTO admin_sessions (id, user_id, token, expires_at, created_at) VALUES (?, ?, ?, ?, ?)')
    .bind(crypto.randomUUID(), userId, sessionToken, expiresAt, new Date().toISOString()).run();

  return json({ success: true, adminSession: sessionToken, expiresAt });
}

async function handleAdminStats(env: Env): Promise<Response> {
  const today = new Date().toISOString().slice(0, 10);
  const todayReports = Number((await env.DB.prepare('SELECT COUNT(*) as cnt FROM reports WHERE created_at LIKE ?').bind(`${today}%`).first() as any)?.cnt || 0);
  const totalUsers = Number((await env.DB.prepare('SELECT COUNT(*) as cnt FROM users').first() as any)?.cnt || 0);
  const totalReports = Number((await env.DB.prepare('SELECT COUNT(*) as cnt FROM reports').first() as any)?.cnt || 0);
  return json({ todayReports, totalUsers, totalReports });
}

async function handleAdminUsers(env: Env): Promise<Response> {
  const results = await env.DB.prepare('SELECT id, email, name, plan, analysis_count, provider, created_at FROM users ORDER BY created_at DESC LIMIT 100').all();
  return json({ users: results.results });
}

// ─── YouTube Data API ─────────────────────────────────────────────────────────

function extractChannelId(url: string): string | null {
  // URL 정규화: 공백 제거, www. 포함 여부 무관하게 처리
  const cleaned = url.trim();
  const patterns = [
    /youtube\.com\/@([^/?]+)/,
    /youtube\.com\/channel\/([^/?]+)/,
    /youtube\.com\/c\/([^/?]+)/,
    /youtu\.be\/([^/?]+)/,
  ];
  for (const p of patterns) {
    const m = cleaned.match(p);
    if (m) return m[1];
  }
  return null;
}

async function fetchChannelData(channelId: string, apiKey: string) {
  const isHandle = !channelId.startsWith('UC');
  
  if (isHandle) {
    // forHandle로 먼저 시도
    const handleUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&forHandle=${channelId}&key=${apiKey}`;
    const handleRes = await fetch(handleUrl);
    const handleData = await handleRes.json() as any;
    
    if (handleData.items?.length) {
      return parseChannel(handleData.items[0]);
    }
    
    // forHandle 실패 시 search API로 펴백
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${channelId}&type=channel&maxResults=1&key=${apiKey}`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json() as any;
    
    if (searchData.items?.length) {
      const foundId = searchData.items[0].snippet.channelId;
      const chRes = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${foundId}&key=${apiKey}`);
      const chData = await chRes.json() as any;
      if (chData.items?.length) return parseChannel(chData.items[0]);
    }
    
    // 디버깅: 실패 원인 포함
    throw new Error(`채널을 찾을 수 없습니다. handle=${channelId}, apiResp=${JSON.stringify(handleData?.error || handleData?.pageInfo).slice(0, 100)}`);
  }
  
  // UC로 시작하는 채널 ID
  const res = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${apiKey}`);
  const data = await res.json() as any;
  if (!data.items?.length) throw new Error('채널을 찾을 수 없습니다. URL을 확인해주세요.');
  return parseChannel(data.items[0]);
}

function parseChannel(ch: any) {
  return {
    id: ch.id,
    title: ch.snippet.title,
    description: ch.snippet.description,
    thumbnail: ch.snippet.thumbnails?.medium?.url,
    subscribers: Number(ch.statistics.subscriberCount || 0),
    totalViews: Number(ch.statistics.viewCount || 0),
    videoCount: Number(ch.statistics.videoCount || 0),
    createdAt: ch.snippet.publishedAt,
  };
}

async function fetchRecentVideos(channelId: string, apiKey: string) {
  const realId = channelId.startsWith('UC') ? channelId : await resolveChannelId(channelId, apiKey);
  const uploadsId = 'UU' + realId.slice(2);
  const listRes = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&playlistId=${uploadsId}&maxResults=20&key=${apiKey}`);
  const listData = await listRes.json() as any;
  if (!listData.items) return [];

  const ids = listData.items.map((i: any) => i.contentDetails.videoId).join(',');
  const videoRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${ids}&key=${apiKey}`);
  const videoData = await videoRes.json() as any;

  return (videoData.items || []).map((v: any) => ({
    id: v.id,
    title: v.snippet.title,
    publishedAt: v.snippet.publishedAt,
    thumbnail: v.snippet.thumbnails?.medium?.url,
    views: Number(v.statistics.viewCount || 0),
    likes: Number(v.statistics.likeCount || 0),
    comments: Number(v.statistics.commentCount || 0),
  }));
}

async function resolveChannelId(handle: string, apiKey: string): Promise<string> {
  const res = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=${handle}&key=${apiKey}`);
  const data = await res.json() as any;
  if (!data.items?.length) throw new Error('Channel not found');
  return data.items[0].id;
}

// ─── AI Analysis ──────────────────────────────────────────────────────────────

async function analyzeWithAI(ai: any, channel: any, videos: any[]) {
  const topVideos = videos.slice(0, 10).map(v => `- "${v.title}" (조회수: ${v.views}, 좋아요: ${v.likes})`).join('\n');

  const prompt = `당신은 YouTube 채널 성장 전문 컨설턴트입니다. 데이터 기반으로 엄격하게 분석하고 구체적 액션을 제안하세요.

채널명: ${channel.title}
구독자: ${channel.subscribers.toLocaleString()}명
총 영상: ${channel.videoCount}개
총 조회수: ${channel.totalViews.toLocaleString()}회
채널 설명: ${channel.description?.slice(0, 200) || '없음'}

최근 영상 성과:
${topVideos}

■ 점수 기준 (엄격하게 적용):
- 구독자: 100명 미만=10점, 1000명=30점, 1만=50점, 10만=75점, 100만=95점
- 평균 조회수: 구독자 대비 10% 이상=양호, 50% 이상=우수
- 업로드 빈도: 주 1회 이상=높음, 월 1회=보통, 그 이하=낮음
- 영상 3개 + 구독자 1명 + 평균 300회 = 15~25점이 적절
- 영상 10개 + 구독자 100명 + 평균 500회 = 25~35점
- 영상 50개 + 구독자 1000명 + 평균 2000회 = 40~55점
- 70점 이상은 구독자 1만 이상 + 꾸준한 업로드 + 높은 참여율일 때만 부여

■ 벤치마크 채널 추천 규칙:
- 반드시 실제 존재하는 YouTube 채널만 추천
- 사용자 채널의 약점과 연결하여 추천 근거 작성
- 형식: "당신의 채널은 [약점]이 있습니다. [추천 채널]은 [약점 극복 방법]을 통해 성공했으므로 참고하세요."

반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트 없이 JSON만:
{"score":0-100,"summary":"한줄요약","strengths":["강점1","강점2","강점3"],"weaknesses":["약점1","약점2","약점3"],"actions":["구체적 개선액션1","개선액션2","개선액션3"],"contentIdeas":["추천콘텐츠1","추천콘텐츠2","추천콘텐츠3"],"benchmarks":[{"name":"실제 채널명","reason":"당신의 채널은 [X]가 부족합니다. 이 채널은 [X를 극복한 방법]을 통해 성공했으므로 참고하세요.","url":"youtube.com/@핸들"},{"name":"두번째","reason":"근거","url":"youtube.com/@핸들"},{"name":"세번째","reason":"근거","url":"youtube.com/@핸들"}]}

중요: benchmarks는 반드시 실제로 존재하는 YouTube 채널이어야 합니다. 가상의 채널을 만들지 마세요.`;

  const result = await ai.run('@cf/meta/llama-4-scout-17b-16e-instruct', { messages: [{ role: 'user', content: prompt }], max_tokens: 1024 });

  try {
    const text = result.response || '';
    const match = text.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : fallbackAnalysis();
  } catch {
    return fallbackAnalysis();
  }
}

function fallbackAnalysis() {
  return { score: 0, summary: '분석을 완료하지 못했습니다', strengths: [], weaknesses: [], actions: [], contentIdeas: [] };
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function json(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Simulate-Plan, X-Admin-Session' },
  });
}

function corsResponse(): Response {
  return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Simulate-Plan, X-Admin-Session' } });
}
