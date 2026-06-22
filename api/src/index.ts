export interface Env {
  AI: any;
  DB: D1Database;
  YOUTUBE_API_KEY: string;
  ENVIRONMENT: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS
    if (request.method === 'OPTIONS') {
      return corsResponse();
    }

    try {
      // Routes
      if (path === '/api/health') {
        return json({ status: 'ok', env: env.ENVIRONMENT });
      }

      if (path === '/api/analyze/youtube' && request.method === 'POST') {
        return handleYouTubeAnalysis(request, env);
      }

      if (path.startsWith('/api/report/') && request.method === 'GET') {
        const reportId = path.replace('/api/report/', '');
        return handleGetReport(reportId, env);
      }

      return json({ error: 'Not found' }, 404);
    } catch (e: any) {
      return json({ error: e.message || 'Internal error' }, 500);
    }
  },
};

// ─── YouTube Analysis ─────────────────────────────────────────────────────────

async function handleYouTubeAnalysis(request: Request, env: Env): Promise<Response> {
  const body = await request.json() as { url: string };
  if (!body.url) {
    return json({ error: 'url is required' }, 400);
  }

  const channelId = extractChannelId(body.url);
  if (!channelId) {
    return json({ error: 'Invalid YouTube URL' }, 400);
  }

  // 1. YouTube Data API로 채널 데이터 수집
  const channelData = await fetchChannelData(channelId, env.YOUTUBE_API_KEY);
  const videos = await fetchRecentVideos(channelId, env.YOUTUBE_API_KEY);

  // 2. AI 분석
  const analysis = await analyzeWithAI(env.AI, channelData, videos);

  // 3. DB 저장
  const reportId = crypto.randomUUID();
  await env.DB.prepare(
    'INSERT INTO reports (id, channel_id, channel_name, data, created_at) VALUES (?, ?, ?, ?, ?)'
  ).bind(reportId, channelId, channelData.title, JSON.stringify(analysis), new Date().toISOString()).run();

  return json({ reportId, ...analysis });
}

async function handleGetReport(reportId: string, env: Env): Promise<Response> {
  const result = await env.DB.prepare('SELECT * FROM reports WHERE id = ?').bind(reportId).first();
  if (!result) {
    return json({ error: 'Report not found' }, 404);
  }
  return json({ ...result, data: JSON.parse(result.data as string) });
}

// ─── YouTube Data API ─────────────────────────────────────────────────────────

function extractChannelId(url: string): string | null {
  // youtube.com/@handle, youtube.com/channel/ID, youtube.com/c/name
  const patterns = [
    /youtube\.com\/@([^/?]+)/,
    /youtube\.com\/channel\/([^/?]+)/,
    /youtube\.com\/c\/([^/?]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

async function fetchChannelData(channelId: string, apiKey: string) {
  // @handle인 경우 forHandle로, channel ID인 경우 id로 검색
  const isHandle = !channelId.startsWith('UC');
  const param = isHandle ? `forHandle=${channelId}` : `id=${channelId}`;
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&${param}&key=${apiKey}`
  );
  const data = await res.json() as any;
  if (!data.items || data.items.length === 0) {
    throw new Error('Channel not found');
  }
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
  // 채널의 업로드 플레이리스트에서 최근 20개 영상
  const realChannelId = channelId.startsWith('UC') ? channelId : await resolveChannelId(channelId, apiKey);
  const uploadsId = 'UU' + realChannelId.slice(2);

  const listRes = await fetch(
    `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&playlistId=${uploadsId}&maxResults=20&key=${apiKey}`
  );
  const listData = await listRes.json() as any;
  if (!listData.items) return [];

  const videoIds = listData.items.map((item: any) => item.contentDetails.videoId).join(',');

  const videoRes = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoIds}&key=${apiKey}`
  );
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
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=${handle}&key=${apiKey}`
  );
  const data = await res.json() as any;
  if (!data.items || data.items.length === 0) throw new Error('Channel not found');
  return data.items[0].id;
}

// ─── AI Analysis ──────────────────────────────────────────────────────────────

async function analyzeWithAI(ai: any, channel: any, videos: any[]) {
  const topVideos = videos.slice(0, 10).map(v => `- "${v.title}" (조회수: ${v.views}, 좋아요: ${v.likes})`).join('\n');

  const prompt = `당신은 YouTube 채널 성장 전문 컨설턴트입니다.
다음 채널 데이터를 분석하고 JSON으로 응답하세요.

채널명: ${channel.title}
구독자: ${channel.subscribers}
총 영상: ${channel.videoCount}
총 조회수: ${channel.totalViews}

최근 영상:
${topVideos}

다음 JSON 형식으로 응답:
{
  "score": 0-100 종합 점수,
  "summary": "한줄 요약",
  "strengths": ["강점1", "강점2"],
  "weaknesses": ["약점1", "약점2"],
  "actions": ["지금 바로 할 수 있는 개선 액션1", "액션2", "액션3"],
  "contentIdeas": ["추천 콘텐츠1", "추천 콘텐츠2", "추천 콘텐츠3"]
}`;

  const result = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1024,
  });

  try {
    const text = result.response || result.result?.response || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : { score: 0, summary: 'AI 분석 실패', strengths: [], weaknesses: [], actions: [], contentIdeas: [] };
  } catch {
    return { score: 0, summary: 'AI 응답 파싱 실패', strengths: [], weaknesses: [], actions: [], contentIdeas: [] };
  }
}

// ─── Utilities ────────────────────────────────────────────────────────────────

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

function corsResponse(): Response {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
