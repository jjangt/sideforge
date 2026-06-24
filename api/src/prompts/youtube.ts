/**
 * YouTube 채널 분석 프롬프트
 * 예시 제거 (AI가 예시를 그대로 복사하는 문제 방지)
 * 규칙 기반으로만 작성
 */

/** 한국어 단위로 숫자 포맷 */
function formatKoreanNumber(n: number): string {
  if (n >= 100000000) return `${(n / 100000000).toFixed(1).replace(/\.0$/, '')}억`;
  if (n >= 10000) return `${(n / 10000).toFixed(1).replace(/\.0$/, '')}만`;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}천`;
  return n.toLocaleString();
}

export function buildYouTubePrompt(channel: any, videos: any[], trendingVideos: any[] = []): string {
  const topVideos = videos.slice(0, 10).map(v =>
    `- "${v.title}" (조회수: ${formatKoreanNumber(v.views)}, 좋아요: ${formatKoreanNumber(v.likes)}, 댓글: ${formatKoreanNumber(v.comments)}, 게시일: ${v.publishedAt?.slice(0, 10)})`
  ).join('\n');

  const avgViews = videos.length > 0 ? Math.round(videos.reduce((sum, v) => sum + v.views, 0) / videos.length) : 0;
  const avgLikes = videos.length > 0 ? Math.round(videos.reduce((sum, v) => sum + v.likes, 0) / videos.length) : 0;
  const likeRatio = avgViews > 0 ? ((avgLikes / avgViews) * 100).toFixed(1) : '0';
  const bestVideo = videos.length > 0 ? videos.reduce((best, v) => v.views > best.views ? v : best, videos[0]) : null;

  const daysSinceLastUpload = videos.length > 0
    ? Math.floor((Date.now() - new Date(videos[0].publishedAt).getTime()) / (1000 * 60 * 60 * 24))
    : null;
  const uploadFrequency = videos.length >= 2
    ? Math.round((new Date(videos[0].publishedAt).getTime() - new Date(videos[videos.length - 1].publishedAt).getTime()) / (1000 * 60 * 60 * 24) / (videos.length - 1))
    : null;

  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const recentUploads = videos.filter(v => new Date(v.publishedAt).getTime() > thirtyDaysAgo).length;

  const trendingSection = trendingVideos.length > 0 ? `
■ 동일 카테고리 최근 인기 영상 (분석 대상 채널의 영상 아님):
${trendingVideos.map(v => `- "${v.title}" by ${v.channelTitle} (URL: www.youtube.com/${v.channelHandle || ''}, 조회수: ${formatKoreanNumber(v.views)}, 좋아요: ${formatKoreanNumber(v.likes)})`).join('\n')}

벤치마킹 작성 시:
- 위 채널들만 벤치마킹 대상으로 사용
- url 필드는 위에 적힌 "URL: www.youtube.com/@xxx" 값을 그대로 복사 (채널명을 URL로 변환 금지)
- reason에는 해당 채널의 위 영상이 잘 된 구체적 이유 + 분석 대상 채널이 배울 점을 작성
` : '';

  return `당신은 YouTube 채널 분석가입니다. 아래 데이터를 분석하여 JSON으로 응답하세요.

■ 분석 대상: "${channel.title}" (ID: ${channel.id})
- 이 채널을 벤치마킹에 넣지 마세요.

■ 핵심 규칙:
1. 아래 "채널 데이터"와 "최근 영상"만 근거로 사용. 추측/가정 금지.
2. 이 채널의 실제 콘텐츠 주제를 영상 제목에서 파악하여 분석에 반영.
3. 강점/단점은 "왜?"까지 분석. 단순 수치 나열 금지.
4. 추천 콘텐츠는 이 채널의 기존 주제 범위 내에서, 아직 다루지 않은 새 소재만 제안.
5. 모든 항목에서 이 채널의 실제 콘텐츠 주제와 무관한 내용 금지.

■ 채널 데이터:
- 채널명: ${channel.title}
- 구독자: ${formatKoreanNumber(channel.subscribers)}명
- 총 영상: ${channel.videoCount}개
- 총 조회수: ${formatKoreanNumber(channel.totalViews)}회
- 채널 설명: ${channel.description?.slice(0, 300) || '없음'}
- 평균 조회수: ${formatKoreanNumber(avgViews)}회
- 평균 좋아요: ${formatKoreanNumber(avgLikes)}개
- 좋아요 비율: ${likeRatio}% (업계 평균 3%)
${bestVideo ? `- 최고 인기 영상: "${bestVideo.title}" (조회수: ${formatKoreanNumber(bestVideo.views)})` : ''}
- 마지막 업로드: ${daysSinceLastUpload !== null ? `${daysSinceLastUpload}일 전` : '알 수 없음'}
- 평균 업로드 간격: ${uploadFrequency !== null ? `약 ${uploadFrequency}일에 1회` : '알 수 없음'}
- 최근 30일 업로드: ${recentUploads}개

■ 최근 영상 (이 채널의 실제 콘텐츠):
${topVideos}
${trendingSection}
■ 점수 기준:
- 구독자: 100명 미만=10, 1000명=30, 1만=50, 10만=75, 100만=90, 1000만+=95
- 좋아요 비율: 3%+=우수, 1~3%=보통, 1% 미만=낮음
- 업로드 빈도: 주2+회=높음, 주1회=보통, 그 이하=낮음

■ 각 필드 작성법:

score: 위 기준으로 종합 점수 (0~100)

category: 영상 제목들을 분석하여 이 채널의 핵심 주제를 한 단어~짧은 구로 표현

summary: 채널 현황을 수치와 함께 한 문장으로 요약

strengths: 이 채널이 잘하고 있는 점의 "원인"을 분석.
- "조회수가 높다"가 아니라 "어떤 전략/형식/주제 선택이 높은 조회수를 만들었는지" 작성
- 영상 제목 패턴, 주제 선정 전략, 업로드 타이밍 등에서 근거를 찾을 것
- 데이터로 증명 불가하면 "현재 데이터에서 뚜렷한 강점을 확인하기 어렵습니다"

weaknesses: 이 채널의 문제점 + 원인 분석.
- 수치 + 왜 문제인지 + 기준 대비 차이를 포함
- 좋아요 비율이 업계 평균 이상이면 좋아요를 단점으로 쓰지 말 것

actions: weaknesses에서 지적한 문제 각각에 대한 구체적 해결책.
- [할 일] + [왜 효과적인지] + [기대 효과]

contentIdeas: 이 채널의 기존 주제 범위 내에서 아직 다루지 않은 새로운 콘텐츠 아이디어.
- 반드시 위 "최근 영상" 목록을 확인하고, 거기에 없는 새 소재만 제안
- 이 채널의 주제와 무관한 콘텐츠를 추천하지 말 것
- 각 아이디어는 반드시 다음 형식으로 작성: "콘텐츠 제안. 근거: 왜 이 콘텐츠가 성과를 낼 수 있는지 구체적 이유"
- 근거에는: 채널의 기존 영상 중 유사 주제의 성과 데이터, 시장 트렌드, 또는 인기 영상 데이터의 수치를 활용
- 기대 효과(조회수/참여도 상승 근거)를 반드시 포함
- 대괄호 [] 사용 금지 — 자연스러운 문장으로 작성

benchmarks: 벤치마킹할 다른 채널 추천.
- 분석 대상 채널("${channel.title}") 자체는 절대 포함 금지
- 인기 영상 데이터가 없으면 빈 배열 []
- reason: 해당 채널의 구체적 영상 제목 + 수치 + 분석 대상이 배울 점을 명확히 설명
- url: 위 인기 영상 데이터의 "URL:" 값을 그대로 복사 (채널명→URL 변환 절대 금지)

JSON만 응답 (다른 텍스트 없이):
{"score":0,"category":"","summary":"","strengths":[""],"weaknesses":[""],"actions":[""],"contentIdeas":[""],"benchmarks":[{"name":"","reason":"","url":""}]}`;
}
