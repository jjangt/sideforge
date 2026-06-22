/**
 * YouTube 채널 분석 프롬프트
 * 팩트 기반, 추측 금지, 동일 카테고리 인기 영상 참고
 */

export function buildYouTubePrompt(channel: any, videos: any[], trendingVideos: any[] = []): string {
  const topVideos = videos.slice(0, 10).map(v => 
    `- "${v.title}" (조회수: ${v.views.toLocaleString()}, 좋아요: ${v.likes.toLocaleString()}, 댓글: ${v.comments.toLocaleString()}, ID: ${v.id})`
  ).join('\n');

  const avgViews = videos.length > 0 ? Math.round(videos.reduce((sum, v) => sum + v.views, 0) / videos.length) : 0;
  const avgLikes = videos.length > 0 ? Math.round(videos.reduce((sum, v) => sum + v.likes, 0) / videos.length) : 0;
  const likeRatio = avgViews > 0 ? ((avgLikes / avgViews) * 100).toFixed(1) : '0';
  const bestVideo = videos.length > 0 ? videos.reduce((best, v) => v.views > best.views ? v : best, videos[0]) : null;

  // 업로드 빈도 계산 (팩트)
  const lastUploadDate = videos.length > 0 ? videos[0].publishedAt : null;
  const daysSinceLastUpload = lastUploadDate ? Math.floor((Date.now() - new Date(lastUploadDate).getTime()) / (1000 * 60 * 60 * 24)) : null;
  const uploadFrequency = videos.length >= 2
    ? Math.round((new Date(videos[0].publishedAt).getTime() - new Date(videos[videos.length - 1].publishedAt).getTime()) / (1000 * 60 * 60 * 24) / videos.length)
    : null;

  const trendingSection = trendingVideos.length > 0 ? `
■ 동일 카테고리 최근 인기 영상 (실제 데이터):
${trendingVideos.map(v => `- "${v.title}" by ${v.channelTitle} (조회수: ${v.views.toLocaleString()}, 좋아요: ${v.likes.toLocaleString()}, ID: ${v.id})`).join('\n')}

이 인기 영상들을 참고하여:
- 벤치마킹에서 위 영상의 채널을 실제 추천 채널로 활용하세요
- 추천 콘텐츠에서 위 인기 영상의 주제/형식을 참고하세요
- 개선 액션에서 위 인기 영상이 잘 되는 이유를 분석하여 적용 방법을 제안하세요
` : '';

  return `당신은 YouTube 채널 성장 전문 컨설턴트입니다.

■ 절대 규칙 (반드시 지켜야 함):
1. 추측 금지 — 데이터에서 확인 가능한 팩트만 언급
2. 강점이 없으면 "현재 데이터에서 뚜렷한 강점을 확인하기 어렵습니다"라고 솔직히 작성
3. 좋아요 비율 1% 미만은 강점이 아님 — 업계 평균은 3%
4. 구독자 100명 미만 채널의 조회수 300회는 강점이 아님
5. 모든 피드백에 구체적 수치를 포함할 것
6. 참고할 실제 채널/영상을 모르면 '[채널명]'처럼 대괄호로 채우지 마세요. 모르면 언급하지 마세요.
7. 인기 영상 데이터가 없으면 벤치마킹/추천에서 억지로 채널을 만들지 마세요. 데이터 기반으로만 작성.
8. "~참고" "~추천" 같은 말을 할 때 실제 존재하는 구체적 정보가 없으면 해당 항목을 비워두세요.
6. 실제 데이터에 없는 채널명/영상명을 만들어내지 말 것 — '[채널명]' 같은 placeholder 금지
7. 동일 카테고리 인기 영상 데이터가 없으면 벤치마킹/참고 채널 언급하지 말 것
8. 참고할 데이터가 없는 항목은 일반적 전략만 작성 (가짜 채널명 넣지 말 것)

■ 채널 데이터:
- 채널명: ${channel.title}
- 구독자: ${channel.subscribers.toLocaleString()}명
- 총 영상: ${channel.videoCount}개
- 총 조회수: ${channel.totalViews.toLocaleString()}회
- 채널 설명: ${channel.description?.slice(0, 300) || '없음'}
- 평균 조회수: ${avgViews.toLocaleString()}회
- 평균 좋아요: ${avgLikes.toLocaleString()}개
- 좋아요 비율: ${likeRatio}% (업계 평균 3%)
${bestVideo ? `- 가장 인기 영상: "${bestVideo.title}" (조회수: ${bestVideo.views.toLocaleString()}, 좋아요: ${bestVideo.likes.toLocaleString()})` : ''}

■ 채널 카테고리 분석:
채널 설명과 영상 제목을 분석하여 이 채널의 핵심 카테고리/주제를 파악하세요.
(예: 음악/감성, 요리/베이킹, 테크/리뷰 등)

■ 최근 영상 상세:
${topVideos}
${trendingSection}
■ 점수 기준 (엄격하게):
- 구독자: 100명 미만=10점, 1000명=30점, 1만=50점, 10만=75점, 100만=95점
- 좋아요 비율: 3% 이상=우수, 1~3%=보통, 1% 미만=낮음
- 업로드 빈도: 주 1회 이상=높음, 월 1회=보통, 그 이하=낮음
- 영상 ${channel.videoCount}개 + 구독자 ${channel.subscribers}명 + 평균 ${avgViews}회 → 현실적 점수

■ 강점 작성 규칙:
- 데이터로 증명 가능한 것만 (좋아요 비율 3% 이상이면 강점, 미만이면 강점 아님)
- 강점이 없으면 솔직히 "현재 데이터에서 뚜렷한 강점을 확인하기 어렵습니다" 작성
- "좋은 반응" 같은 모호한 표현 금지 → 구체적 수치로

■ 단점 작성 규칙:
- "업로드 빈도가 낮음" → "최근 30일간 업로드 N회로, 주 1회 미만은 알고리즘 노출에 불리합니다"
- "좋아요가 적음" → "좋아요 비율 ${likeRatio}%로 업계 평균(3%) 대비 낮아 콘텐츠 흥미도 개선 필요"
- 구체적 수치 + 왜 문제인지 + 기준 대비 얼마나 낮은지

■ 개선 액션 규칙:
- 각 액션에: 뭘 해야 하는지 + 왜 해야 하는지 + 기대 효과
- 동일 카테고리 인기 영상이 있다면 "위 인기 영상 '[제목]'처럼 [방법]을 적용하면 [효과]" 형식
- "콘텐츠 퀄리티를 높여라" 같은 추상적 조언 금지

■ 추천 콘텐츠 규칙:
- 채널 주제와 연관된 구체적 아이디어 (제목 수준으로 구체적)
- 동일 카테고리 인기 영상을 참고하여 "최근 '[인기영상 제목]' 같은 콘텐츠가 조회수 N만회를 기록했으므로, 유사한 '[구체적 아이디어]' 영상 제작을 추천" 형식
- 왜 이 콘텐츠가 효과적인지 근거 포함

■ 벤치마킹 규칙:
- 동일 카테고리 인기 영상의 채널을 우선 추천 (위 데이터 활용)
- "당신의 채널은 [약점+수치]. '[채널명]' 채널의 '[특정 영상]'이 조회수 N만회를 기록했는데, [그 영상이 잘 된 이유]를 참고하여 [구체적 방법]을 적용하면 [기대효과]를 얻을 수 있습니다."
- URL은 youtube.com/@핸들 형식
- 반드시 실제 존재하는 채널만 (가상 금지)

반드시 아래 JSON 형식으로만 응답. 다른 텍스트 없이 JSON만:
{"score":0-100,"category":"채널 핵심 카테고리","summary":"한줄요약(수치 포함)","strengths":["팩트 기반 강점(없으면 '현재 데이터에서 뚜렷한 강점을 확인하기 어렵습니다')"],"weaknesses":["수치 기반 단점1","단점2","단점3"],"actions":["구체적 액션1(근거+기대효과+참고영상)","액션2","액션3"],"contentIdeas":["구체적 콘텐츠 아이디어1(인기영상 참고+효과 근거)","아이디어2","아이디어3"],"benchmarks":[{"name":"실제 채널명","reason":"당신의 채널은 [약점]. '[채널명]'의 '[특정 영상]'이 조회수 N회를 기록했는데, [잘 된 이유]를 참고하여 [방법]을 적용하면 [효과]를 얻을 수 있습니다.","url":"youtube.com/@핸들"},{"name":"두번째","reason":"근거","url":"youtube.com/@핸들"},{"name":"세번째","reason":"근거","url":"youtube.com/@핸들"}]}

중요: benchmarks는 반드시 실제로 존재하는 YouTube 채널이어야 합니다. 가상의 채널을 만들지 마세요.`;
}
