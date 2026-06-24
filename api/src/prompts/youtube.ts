/**
 * YouTube 채널 분석 프롬프트
 * 원인 기반 강점/단점 분석, 자기 채널 벤치마킹 방지
 */

export function buildYouTubePrompt(channel: any, videos: any[], trendingVideos: any[] = []): string {
  const topVideos = videos.slice(0, 10).map(v => 
    `- "${v.title}" (조회수: ${v.views.toLocaleString()}, 좋아요: ${v.likes.toLocaleString()}, 댓글: ${v.comments.toLocaleString()}, 게시일: ${v.publishedAt?.slice(0, 10)}, ID: ${v.id})`
  ).join('\n');

  const avgViews = videos.length > 0 ? Math.round(videos.reduce((sum, v) => sum + v.views, 0) / videos.length) : 0;
  const avgLikes = videos.length > 0 ? Math.round(videos.reduce((sum, v) => sum + v.likes, 0) / videos.length) : 0;
  const likeRatio = avgViews > 0 ? ((avgLikes / avgViews) * 100).toFixed(1) : '0';
  const bestVideo = videos.length > 0 ? videos.reduce((best, v) => v.views > best.views ? v : best, videos[0]) : null;

  // 업로드 빈도 계산 (팩트)
  const daysSinceLastUpload = videos.length > 0
    ? Math.floor((Date.now() - new Date(videos[0].publishedAt).getTime()) / (1000 * 60 * 60 * 24))
    : null;
  const uploadFrequency = videos.length >= 2
    ? Math.round((new Date(videos[0].publishedAt).getTime() - new Date(videos[videos.length - 1].publishedAt).getTime()) / (1000 * 60 * 60 * 24) / (videos.length - 1))
    : null;

  // 최근 30일 업로드 수
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const recentUploads = videos.filter(v => new Date(v.publishedAt).getTime() > thirtyDaysAgo).length;

  const trendingSection = trendingVideos.length > 0 ? `
■ 동일 카테고리 최근 인기 영상 (실제 데이터 — 분석 대상 채널의 영상 아님):
${trendingVideos.map(v => `- "${v.title}" by ${v.channelTitle} (조회수: ${v.views.toLocaleString()}, 좋아요: ${v.likes.toLocaleString()}, ID: ${v.id})`).join('\n')}

이 인기 영상들을 참고하여:
- 벤치마킹에서 위 영상의 채널을 실제 추천 채널로 활용 (분석 대상 "${channel.title}" 채널 자체는 절대 벤치마킹에 넣지 말 것)
- 추천 콘텐츠에서 위 인기 영상의 주제/형식을 참고
- 개선 액션에서 위 인기 영상이 잘 되는 이유를 분석하여 적용 방법을 제안
` : '';

  return `당신은 YouTube 채널 성장 전문 컨설턴트입니다.

■ 분석 대상 채널: "${channel.title}" (ID: ${channel.id})
※ 이 채널은 분석 대상입니다. 벤치마킹/추천 채널에 절대 포함하지 마세요.

■ 절대 규칙:
1. 추측 금지 — 데이터에서 확인 가능한 팩트만 언급
2. 단순 수치 나열 금지 — "높은 조회수" "많은 구독자" 같은 현황 나열은 강점/단점이 아님
3. 원인 분석 필수 — 왜 그런 결과가 나왔는지, 어떤 전략/행동이 그 수치를 만들었는지 분석
4. 좋아요 비율 1% 미만은 강점이 아님 (업계 평균 3%)
5. 구독자 100명 미만 채널의 조회수 300회는 강점이 아님
6. 실제 데이터에 없는 채널명/영상명을 만들어내지 말 것 — placeholder 금지
7. 벤치마킹에 분석 대상 채널("${channel.title}") 자체를 넣지 말 것
8. 인기 영상 데이터가 없으면 벤치마킹을 빈 배열로 반환

■ 채널 데이터:
- 채널명: ${channel.title}
- 채널 ID: ${channel.id}
- 구독자: ${channel.subscribers.toLocaleString()}명
- 총 영상: ${channel.videoCount}개
- 총 조회수: ${channel.totalViews.toLocaleString()}회
- 채널 설명: ${channel.description?.slice(0, 300) || '없음'}
- 평균 조회수: ${avgViews.toLocaleString()}회
- 평균 좋아요: ${avgLikes.toLocaleString()}개
- 좋아요 비율: ${likeRatio}% (업계 평균 3%)
${bestVideo ? `- 가장 인기 영상: "${bestVideo.title}" (조회수: ${bestVideo.views.toLocaleString()}, 좋아요: ${bestVideo.likes.toLocaleString()})` : ''}
- 마지막 업로드: ${daysSinceLastUpload !== null ? `${daysSinceLastUpload}일 전` : '알 수 없음'}
- 평균 업로드 간격: ${uploadFrequency !== null ? `약 ${uploadFrequency}일에 1회` : '알 수 없음'}
- 최근 30일 업로드 수: ${recentUploads}개

■ 최근 영상 상세:
${topVideos}
${trendingSection}
■ 점수 기준:
- 구독자: 100명 미만=10점, 1000명=30점, 1만=50점, 10만=75점, 100만=95점
- 좋아요 비율: 3% 이상=우수, 1~3%=보통, 1% 미만=낮음
- 업로드 빈도: 주 2회 이상=높음, 주 1회=보통, 그 이하=낮음

■ 강점 작성 규칙 (매우 중요):
금지: "평균 조회수 10만회로 높은 조회수" ← 이건 현황 나열이지 강점 분석이 아님
필수: 영상 제목/주제/형식에서 어떤 전략이 좋은 성과를 만들었는지 원인을 분석

좋은 예시:
- "최근 인기 있는 e스포츠 경기(T1 vs GEN 등) 리뷰를 빠르게 업로드하여 검색 트래픽을 선점하는 전략이 효과적. 해당 영상들의 조회수가 평균 대비 3배 높음"
- "영상 제목에 숫자와 비교 형식('A vs B', 'TOP 5')을 활용하여 클릭률을 높이는 패턴이 일관되게 나타남"
- "짧은 영상(10분 이내)과 긴 영상(30분+)을 혼합 배치하여 다양한 시청 상황을 커버하는 전략"

강점이 데이터에서 확인 불가하면: "현재 데이터에서 뚜렷한 강점을 확인하기 어렵습니다"

■ 단점 작성 규칙 (매우 중요):
금지: "좋아요 비율 1.2%로 낮음" ← 이건 현황 나열이지 단점 분석이 아님
필수: 수치 + 왜 문제인지 + 가능한 원인 + 기준 대비 차이

좋은 예시:
- "최근 30일간 업로드 ${recentUploads}개로, 평균 ${uploadFrequency || '?'}일 간격. 주 2~3회 업로드하는 경쟁 채널 대비 알고리즘 노출 기회가 크게 줄어들며, 구독자의 채널 이탈로 이어질 수 있음"
- "좋아요 비율 ${likeRatio}%로 업계 평균(3%) 대비 ${(3 - Number(likeRatio)).toFixed(1)}%p 낮음. 영상 제목의 클릭 유도 대비 실제 콘텐츠 만족도가 낮거나, 시청자 참여를 유도하는 CTA(좋아요 요청 등)가 부족한 것으로 분석됨"
- "영상 주제가 일관되지 않아(게임 리뷰 → 일상 → 먹방) 특정 관심사의 구독자가 이탈하는 패턴이 보임"

■ 개선 액션 규칙:
- 단점에서 지적한 각 문제에 대한 구체적 해결책
- 형식: [뭘 해야 하는지] + [왜 효과적인지 근거] + [기대 효과]
- 인기 영상 데이터가 있으면 "인기 영상 '[제목]'에서 [방법]을 사용했고, 이를 적용하면 [효과]" 형식
- "퀄리티를 높여라" 같은 추상적 조언 금지

■ 추천 콘텐츠 규칙 (매우 중요):
금지: 이미 업로드한 영상과 동일하거나 거의 같은 주제를 추천하는 것 (위 "최근 영상 상세" 목록 참고)
필수: 아직 다루지 않은 새로운 콘텐츠 아이디어를 제안

작성 방법:
1. 채널이 잘하는 주제(위 영상에서 조회수 높은 패턴)를 파악
2. 그 주제의 연장선에서 아직 안 다룬 구체적 소재를 제안
3. 가능하면 시의성 있는 향후 이벤트/트렌드를 활용

좋은 예시:
- "최근 'T1 vs GEN' 리뷰가 조회수 20만회를 기록했으므로, 같은 방식으로 다가올 MSI 플레이인 T1 vs Team Liquid 경기 리뷰를 업로드하면 유사한 성과가 기대됨"
- "e스포츠 경기 리뷰가 채널 평균 대비 3배 높은 조회수를 기록 중. 정규 시즌 외에 선수 이적/로스터 변경 분석 콘텐츠도 검색 수요가 높아 시도 가치 있음"

나쁜 예시 (금지):
- "T1 vs GEN 경기 리뷰 영상 제작" ← 이미 올린 영상과 동일
- "e스포츠 관련 콘텐츠" ← 너무 추상적, 이미 하고 있는 것

■ 벤치마킹 규칙:
- ★★★ "${channel.title}" 채널 자체를 벤치마킹에 절대 넣지 마세요 ★★★
- 반드시 분석 대상과 다른 채널만 추천
- 동일 카테고리 인기 영상의 채널을 우선 추천 (위 데이터 활용)
- 인기 영상 데이터가 없으면 benchmarks를 빈 배열 []로 반환
- URL 형식: 반드시 "www.youtube.com/@핸들" 형식으로 작성 (https:// 없이, www. 포함)

반드시 아래 JSON 형식으로만 응답. 다른 텍스트 없이 JSON만:
{"score":0-100,"category":"채널 핵심 카테고리","summary":"한줄요약(수치 포함)","strengths":["원인 분석 기반 강점 (단순 수치 나열 금지)"],"weaknesses":["원인+수치+기준대비 차이 기반 단점"],"actions":["구체적 액션(근거+기대효과)"],"contentIdeas":["아직 안 다룬 새로운 콘텐츠 아이디어(근거 포함)"],"benchmarks":[{"name":"실제 채널명(분석대상 채널 제외)","reason":"구체적 비교 근거","url":"www.youtube.com/@핸들"}]}`;
}
