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

      // Get Report
      if (path.startsWith('/api/report/') && request.method === 'GET') {
        const reportId = path.replace('/api/report/', '');
        return handleGetReport(reportId, env);
      }

      // My Reports
      if (path === '/api/reports' && request.method === 'GET') {
        const userId = await getUserIdFromRequest(request, env);
        if (!userId) return json({ error: 'Unauthorized' }, 401);
        return handleMyReports(userId, env);
      }

      return json({ error: 'Not found' }, 404);
    } catch (e: any) {
      return json({ error: e.message || 'Internal error' }, 500);
    }
  },
};

// ─── YouTube Analysis ─────────────────────────────────────────────────────────

async function handleYouTubeAnalysis(request: Request, env: Env, userId: string): Promise<Response> {
  const body = await request.json() as { url: string };
  if (!body.url) return json({ error: 'url is required' }, 400);

  const channelId = extractChannelId(body.url);
  if (!channelId) return json({ error: 'Invalid YouTube URL' }, 400);

  const channelData = await fetchChannelData(channelId, env.YOUTUBE_API_KEY);
  const videos = await fetchRecentVideos(channelId, env.YOUTUBE_API_KEY);
  const analysis = await analyzeWithAI(env.AI, channelData, videos);

  const reportId = crypto.randomUUID();
  await env.DB.prepare(
    'INSERT INTO reports (id, user_id, channel_id, channel_name, platform, data, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).bind(reportId, userId, channelData.id, channelData.title, 'youtube', JSON.stringify({ channel: channelData, videos, analysis }), new Date().toISOString()).run();

  return json({ reportId, channel: channelData, analysis });
}

async function handleGetReport(reportId: string, env: Env): Promise<Response> {
  const result = await env.DB.prepare('SELECT * FROM reports WHERE id = ?').bind(reportId).first() as any;
  if (!result) return json({ error: 'Report not found' }, 404);
  return json({ id: result.id, channelName: result.channel_name, platform: result.platform, data: JSON.parse(result.data), createdAt: result.created_at });
}

async function handleMyReports(userId: string, env: Env): Promise<Response> {
  const results = await env.DB.prepare('SELECT id, channel_name, platform, created_at FROM reports WHERE user_id = ? ORDER BY created_at DESC LIMIT 50').bind(userId).all();
  return json({ reports: results.results });
}

// ─── YouTube Data API ─────────────────────────────────────────────────────────

function extractChannelId(url: string): string | null {
  const patterns = [
    /youtube\.com\/@([^/?]+)/,
    /youtube\.com\/channel\/([^/?]+)/,
    /youtube\.com\/c\/([^/?]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

async function fetchChannelData(channelId: string, apiKey: string) {
  const isHandle = !channelId.startsWith('UC');
  const param = isHandle ? `forHandle=${channelId}` : `id=${channelId}`;
  const res = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&${param}&key=${apiKey}`);
  const data = await res.json() as any;
  if (!data.items?.length) throw new Error('Channel not found');
  const ch = data.items[0];
  return {
    id: ch.id,
    title: ch.snippet.title,
    description: ch.snippet.description,
    thumbnail: ch.snippet.thumbnails?.medium?.url,
    subscribers: Number(ch.statistics.subscriberCount),
    totalViews: Number(ch.statistics.viewCount),
    videoCount: Number(ch.statistics.videoCount),
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

  const prompt = `당신은 YouTube 채널 성장 전문 컨설턴트입니다. 데이터 기반으로 분석하고 구체적 액션을 제안하세요.

채널명: ${channel.title}
구독자: ${channel.subscribers.toLocaleString()}명
총 영상: ${channel.videoCount}개
총 조회수: ${channel.totalViews.toLocaleString()}회

최근 영상 성과:
${topVideos}

JSON으로 응답:
{"score":0-100,"summary":"한줄요약","strengths":["강점"],"weaknesses":["약점"],"actions":["개선액션"],"contentIdeas":["추천콘텐츠"]}`;

  const result = await ai.run('@cf/meta/llama-3.1-8b-instruct', { messages: [{ role: 'user', content: prompt }], max_tokens: 1024 });

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
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' },
  });
}

function corsResponse(): Response {
  return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' } });
}
