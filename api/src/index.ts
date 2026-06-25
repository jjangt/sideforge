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
  GEMINI_API_KEY: string;
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
  // 동일 카테고리 인기 영상 검색 (벤치마킹용)
  const trendingVideos = await fetchTrendingInCategory(channelData, videos, env.YOUTUBE_API_KEY);
  const analysis = await analyzeWithAI(env.AI, channelData, videos, trendingVideos, env);

  const reportId = crypto.randomUUID();
  const fullData = { channel: channelData, videos, trendingVideos, analysis };
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
        benchmarks: 'LOCKED',
      },
    };
  }

  // Free: 제한된 데이터만 (각 항목 1개는 미리보기 제공)
  return {
    channel: { title: channel.title, thumbnail: channel.thumbnail, subscribers: channel.subscribers, videoCount: channel.videoCount },
    videos: [],
    analysis: {
      score: analysis.score,
      summary: analysis.summary,
      strengths: analysis.strengths?.slice(0, 1) || [],
      weaknesses: analysis.weaknesses?.slice(0, 1) || [],
      actions: analysis.actions?.slice(0, 1) || [],
      actionsLocked: true,
      contentIdeas: analysis.contentIdeas?.slice(0, 1) || [],
      contentIdeasLocked: true,
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
  const cleaned = url.trim();
  
  // @handle 직접 입력 (예: @MrBeast, @limahni)
  if (cleaned.startsWith('@')) {
    return cleaned.slice(1);
  }
  
  // URL 형식
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
  const videoRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${ids}&key=${apiKey}`);
  const videoData = await videoRes.json() as any;

  const videos = (videoData.items || []).map((v: any) => ({
    id: v.id,
    title: v.snippet.title,
    publishedAt: v.snippet.publishedAt,
    thumbnail: v.snippet.thumbnails?.medium?.url,
    views: Number(v.statistics.viewCount || 0),
    likes: Number(v.statistics.likeCount || 0),
    comments: Number(v.statistics.commentCount || 0),
    duration: parseDuration(v.contentDetails?.duration || ''),
    categoryId: v.snippet.categoryId || '',
    tags: v.snippet.tags || [],
    description: (v.snippet.description || '').slice(0, 200),
    topComments: [] as string[],
  }));

  // 상위 3개 영상의 인기 댓글 수집 (채널 주인 댓글 제외)
  const top3 = videos.slice(0, 3);
  await Promise.all(top3.map(async (v: any) => {
    try {
      const cRes = await fetch(`https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${v.id}&order=relevance&maxResults=12&key=${apiKey}`);
      const cData = await cRes.json() as any;
      v.topComments = (cData.items || [])
        .filter((c: any) => c.snippet.topLevelComment.snippet.authorChannelId?.value !== realId)
        .slice(0, 7)
        .map((c: any) => c.snippet.topLevelComment.snippet.textDisplay.replace(/<[^>]*>/g, '').slice(0, 100));
    } catch {
      v.topComments = [];
    }
  }));

  return videos;
}

async function resolveChannelId(handle: string, apiKey: string): Promise<string> {
  const res = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=${handle}&key=${apiKey}`);
  const data = await res.json() as any;
  if (!data.items?.length) throw new Error('Channel not found');
  return data.items[0].id;
}

/**
 * 동일 주제에서 성공한 채널 검색 (벤치마킹용)
 * 1) 영상 categoryId로 장르 파악
 * 2) 영상 태그 + 카테고리명으로 검색
 * 3) 구독자 1만+ 채널만 롤모델로
 */
async function fetchTrendingInCategory(channel: any, videos: any[], apiKey: string): Promise<any[]> {
  try {
    const categoryMap: Record<string, string> = {
      '1': '애니메이션', '2': '자동차', '10': '음악', '15': '반려동물',
      '17': '스포츠', '20': '게임', '22': '브이로그', '23': '코미디',
      '24': '엔터테인먼트', '25': '뉴스', '26': '노하우', '27': '교육',
      '28': '과학기술', '29': '사회활동',
    };
    const catCounts: Record<string, number> = {};
    videos.forEach(v => { if (v.categoryId) catCounts[v.categoryId] = (catCounts[v.categoryId] || 0) + 1; });
    const topCategoryId = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '';
    const categoryName = categoryMap[topCategoryId] || '';

    const allTags = videos.flatMap(v => v.tags || []);
    const genreTags = allTags.filter((t: string) => t.length >= 2 && t.length <= 20).slice(0, 5);
    const channelNameWords = channel.title.toLowerCase().replace(/[^\w\uAC00-\uD7AF\s]/g, '').split(/\s+/).filter((w: string) => w.length > 1);

    const searchQuery = genreTags.length > 0
      ? `${categoryName} ${genreTags.slice(0, 3).join(' ')}`.trim()
      : categoryName || channel.description?.slice(0, 30) || '';
    if (!searchQuery) return [];

    const searchRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=channel&maxResults=10&key=${apiKey}`
    );
    const searchData = await searchRes.json() as any;
    const candidates = (searchData.items || []).filter((i: any) => {
      if (i.snippet.channelId === channel.id) return false;
      const name = i.snippet.title.toLowerCase();
      return !channelNameWords.some((w: string) => w.length > 1 && name.includes(w));
    });
    if (!candidates.length) return [];

    const chIds = candidates.slice(0, 6).map((i: any) => i.snippet.channelId).join(',');
    const chRes = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${chIds}&key=${apiKey}`);
    const chData = await chRes.json() as any;
    const minSubs = Math.max(10000, channel.subscribers * 50);
    const goodChannels = (chData.items || [])
      .filter((ch: any) => Number(ch.statistics.subscriberCount || 0) >= minSubs)
      .sort((a: any, b: any) => Number(b.statistics.subscriberCount || 0) - Number(a.statistics.subscriberCount || 0))
      .slice(0, 2);
    if (!goodChannels.length) return [];

    const results = await Promise.all(goodChannels.map(async (ch: any) => {
      try {
        const uploadsId = 'UU' + ch.id.slice(2);
        const listRes = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&playlistId=${uploadsId}&maxResults=5&key=${apiKey}`);
        const listData = await listRes.json() as any;
        if (!listData.items?.length) return null;
        const vidIds = listData.items.map((i: any) => i.contentDetails.videoId).join(',');
        const vidRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${vidIds}&key=${apiKey}`);
        const vidData = await vidRes.json() as any;
        if (!vidData.items?.length) return null;
        const channelVideos = vidData.items.map((v: any) => ({
          title: v.snippet.title,
          description: (v.snippet.description || '').slice(0, 150),
          duration: parseDuration(v.contentDetails?.duration || ''),
          views: Number(v.statistics.viewCount || 0),
          likes: Number(v.statistics.likeCount || 0),
        }));
        return {
          channelTitle: ch.snippet.title,
          channelHandle: ch.snippet.customUrl || '',
          channelSubscribers: Number(ch.statistics.subscriberCount || 0),
          videos: channelVideos,
        };
      } catch { return null; }
    }));
    return results.filter(Boolean) as any[];
  } catch {
    return [];
  }
}

/** 채널 ID 목록으로부터 실제 handle(@xxx) 조회 */
async function fetchChannelHandles(channelIds: string[], apiKey: string): Promise<Record<string, string>> {
  if (!channelIds.length) return {};
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelIds.join(',')}&key=${apiKey}`
  );
  const data = await res.json() as any;
  const map: Record<string, string> = {};
  for (const ch of (data.items || [])) {
    map[ch.id] = ch.snippet.customUrl || '';
  }
  return map;
}

/** 채널명/설명에서 핵심 키워드 추출 */
function extractKeywords(title: string, description: string): string {
  const text = `${title} ${description || ''}`.slice(0, 200);
  // 한국어/영어 단어 추출 (불용어 제외)
  const stopWords = ['나', '는', '를', '을', '의', '에', '다', '이', '그', 'the', 'a', 'is', 'to', 'and', 'of'];
  const words = text.replace(/[^\w\uAC00-\uD7AF\s]/g, '').split(/\s+/).filter(w => w.length > 1 && !stopWords.includes(w.toLowerCase()));
  // 가장 많이 나온 키워드 2개 선택
  return words.slice(0, 3).join(' ');
}

/** 3개월 전 날짜 (ISO 형식) */
function getThreeMonthsAgo(): string {
  const d = new Date();
  d.setMonth(d.getMonth() - 3);
  return d.toISOString();
}

/** ISO 8601 duration → 초 변환 (PT5M30S → 330) */
function parseDuration(iso: string): number {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  return (Number(m[1] || 0) * 3600) + (Number(m[2] || 0) * 60) + Number(m[3] || 0);
}

// ─── AI Analysis ──────────────────────────────────────────────────────────────

async function analyzeWithAI(ai: any, channel: any, videos: any[], trendingVideos: any[], env?: any) {
  const { buildYouTubePrompt } = await import('./prompts/youtube');
  const prompt = buildYouTubePrompt(channel, videos, trendingVideos);

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { maxOutputTokens: 8000 } }),
      }
    );
    const geminiData = await geminiRes.json() as any;
    if (!geminiRes.ok) {
      return { score: 0, summary: `Gemini API 오류: ${geminiRes.status} | ${geminiData.error?.message || JSON.stringify(geminiData).slice(0, 200)}`, strengths: [], weaknesses: [], actions: [], contentIdeas: [] };
    }
    let text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (!text) {
      return { score: 0, summary: `Gemini 응답 비어있음 | finishReason: ${geminiData.candidates?.[0]?.finishReason || 'none'} | blockReason: ${geminiData.promptFeedback?.blockReason || 'none'}`, strengths: [], weaknesses: [], actions: [], contentIdeas: [] };
    }
    text = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
    // 마크다운 코드블록 제거 (```json ... ``` 또는 ``` ... ```)
    text = text.replace(/^```(?:json)?\s*\n?/m, '').replace(/\n?```\s*$/m, '');
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      return { score: 0, summary: `JSON 파싱 실패 | 응답 앞부분: ${text.slice(0, 300)}`, strengths: [], weaknesses: [], actions: [], contentIdeas: [] };
    }
    const analysis = JSON.parse(match[0]);
    ['strengths','weaknesses','actions','contentIdeas','viralFormula','commentSummary','benchmarks'].forEach(k => {
      if (analysis[k] && !Array.isArray(analysis[k])) analysis[k] = [analysis[k]];
    });
    // 벤치마킹 검증: trending 데이터에 실제 존재하는 채널만 유지
    if (analysis.benchmarks?.length && trendingVideos.length) {
      const validNames = trendingVideos.map(v => v.channelTitle.toLowerCase());
      const validHandles = trendingVideos.map(v => v.channelHandle).filter(Boolean);
      analysis.benchmarks = analysis.benchmarks.filter((b: any) => {
        if (!b.name) return false;
        const nameLower = b.name.toLowerCase();
        return validNames.some(n => n.includes(nameLower) || nameLower.includes(n))
          || validHandles.some(h => b.url?.includes(h));
      });
    } else if (analysis.benchmarks?.length && !trendingVideos.length) {
      analysis.benchmarks = [];
    }
    // 댓글 요약 검증: 실제 댓글이 없는 영상의 commentSummary 제거
    if (analysis.commentSummary?.length && videos.length) {
      const videosWithComments = new Set(
        videos.slice(0, 3).filter((v: any) => v.topComments?.length > 0).map((v: any) => v.title)
      );
      analysis.commentSummary = analysis.commentSummary.filter((c: any) =>
        c.videoTitle && [...videosWithComments].some(t => t.includes(c.videoTitle.slice(0, 10)) || c.videoTitle.includes(t.slice(0, 10)))
      );
    }
    return analysis;
  } catch (e: any) {
    return { score: 0, summary: `AI 분석 실패: ${e?.message || 'unknown'} | key=${env?.GEMINI_API_KEY ? 'SET(' + env.GEMINI_API_KEY.slice(0, 6) + '...)' : 'MISSING'}`, strengths: [], weaknesses: [], actions: [], contentIdeas: [] };
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
