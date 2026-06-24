/**
 * YouTube 채널 분석 프롬프트
 * 하이브리드: 코드가 팩트 판단 → AI는 문장 작성 + 댓글 분위기 요약
 */

function fmt(n: number): string {
  if (n >= 100000000) return `${(n / 100000000).toFixed(1).replace(/\.0$/, '')}억`;
  if (n >= 10000) return `${(n / 10000).toFixed(1).replace(/\.0$/, '')}만`;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}천`;
  return n.toLocaleString();
}

function preAnalyze(channel: any, videos: any[]) {
  const avgViews = videos.length > 0 ? Math.round(videos.reduce((s, v) => s + v.views, 0) / videos.length) : 0;
  const avgLikes = videos.length > 0 ? Math.round(videos.reduce((s, v) => s + v.likes, 0) / videos.length) : 0;
  const likeRatio = avgViews > 0 ? Number(((avgLikes / avgViews) * 100).toFixed(1)) : 0;
  const bestVideo = videos.length > 0 ? videos.reduce((b, v) => v.views > b.views ? v : b, videos[0]) : null;
  const daysSinceLastUpload = videos.length > 0
    ? Math.floor((Date.now() - new Date(videos[0].publishedAt).getTime()) / (1000 * 60 * 60 * 24)) : null;
  const uploadFrequency = videos.length >= 2
    ? Math.round((new Date(videos[0].publishedAt).getTime() - new Date(videos[videos.length - 1].publishedAt).getTime()) / (1000 * 60 * 60 * 24) / (videos.length - 1)) : null;
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const recentUploads = videos.filter(v => new Date(v.publishedAt).getTime() > thirtyDaysAgo).length;

  const facts: string[] = [];
  const issues: string[] = [];

  // 업로드 상태
  if (daysSinceLastUpload !== null && daysSinceLastUpload > 180) {
    issues.push(`채널 활동 중단 상태: 마지막 업로드가 ${daysSinceLastUpload}일 전(약 ${Math.round(daysSinceLastUpload / 30)}개월 전). 사실상 활동을 멈춘 채널`);
  } else if (daysSinceLastUpload !== null && daysSinceLastUpload > 30) {
    issues.push(`업로드 빈도 저하: 최근 30일간 업로드 0개, 마지막 업로드 ${daysSinceLastUpload}일 전. 알고리즘 노출 감소 우려`);
  } else if (recentUploads >= 8) {
    facts.push(`매우 활발한 업로드: 최근 30일간 ${recentUploads}개 업로드(평균 ${uploadFrequency}일 간격). 알고리즘 노출에 유리한 빈도`);
  } else if (recentUploads >= 4) {
    facts.push(`꾸준한 업로드: 최근 30일간 ${recentUploads}개 업로드(주 1회 이상)`);
  }

  // 좋아요 비율
  if (likeRatio >= 5) {
    facts.push(`매우 높은 시청자 만족도: 좋아요 비율 ${likeRatio}%로 업계 평균(3%)을 크게 상회`);
  } else if (likeRatio >= 3) {
    facts.push(`양호한 시청자 참여: 좋아요 비율 ${likeRatio}%로 업계 평균(3%) 이상`);
  } else if (likeRatio < 1 && avgViews > 100) {
    issues.push(`매우 낮은 좋아요 비율(${likeRatio}%): 업계 평균(3%) 대비 크게 부족. 시청자가 영상을 끝까지 보지 않거나 만족도가 낮을 가능성`);
  } else if (likeRatio < 3 && avgViews > 100) {
    issues.push(`좋아요 비율(${likeRatio}%) 개선 필요: 업계 평균(3%) 미달. 시청자 참여 유도(CTA) 강화 또는 콘텐츠 만족도 점검 필요`);
  }

  // 구독자 대비 조회수
  if (channel.subscribers > 0 && avgViews > 0) {
    const ratio = avgViews / channel.subscribers;
    if (ratio > 1) {
      facts.push(`폭발적 도달률: 평균 조회수(${fmt(avgViews)})가 구독자 수(${fmt(channel.subscribers)})를 초과. 비구독자 유입이 매우 활발`);
    } else if (ratio > 0.3) {
      facts.push(`높은 도달률: 평균 조회수가 구독자 대비 ${(ratio * 100).toFixed(0)}%로, 외부 유입이 활발`);
    } else if (ratio < 0.03 && channel.subscribers > 1000) {
      issues.push(`극히 낮은 도달률: 평균 조회수(${fmt(avgViews)})가 구독자(${fmt(channel.subscribers)}) 대비 ${(ratio * 100).toFixed(1)}%. 구독자에게조차 영상이 노출되지 않고 있음`);
    }
  }

  // 베스트 vs 평균
  if (bestVideo && avgViews > 0 && bestVideo.views > avgViews * 3) {
    facts.push(`바이럴 콘텐츠: "${bestVideo.title}"이 조회수 ${fmt(bestVideo.views)}으로 채널 평균의 ${Math.round(bestVideo.views / avgViews)}배`);
  }

  return { avgViews, avgLikes, likeRatio, bestVideo, daysSinceLastUpload, uploadFrequency, recentUploads, facts, issues };
}

export function buildYouTubePrompt(channel: any, videos: any[], trendingVideos: any[] = []): string {
  const pre = preAnalyze(channel, videos);

  const topVideos = videos.slice(0, 10).map(v =>
    `- "${v.title}" (조회수: ${fmt(v.views)}, 좋아요: ${fmt(v.likes)}, 댓글: ${fmt(v.comments)}, 게시일: ${v.publishedAt?.slice(0, 10)})`
  ).join('\n');

  // 댓글 데이터 (상위 3개 영상)
  const commentSection = videos.slice(0, 3).filter((v: any) => v.topComments?.length > 0).map((v: any) =>
    `영상 "${v.title}"의 인기 댓글:\n${v.topComments.map((c: string) => `  - "${c}"`).join('\n')}`
  ).join('\n\n');

  const trendingSection = trendingVideos.length > 0 ? `
■ 동일 카테고리 인기 영상 (다른 채널):
${trendingVideos.map(v => `- "${v.title}" by ${v.channelTitle} (URL: www.youtube.com/${v.channelHandle || ''}, 조회수: ${fmt(v.views)}, 좋아요: ${fmt(v.likes)})`).join('\n')}
` : '';

  return `YouTube 채널 분석 후 JSON 응답. 모든 텍스트는 한국어 완전한 문장으로 작성. 영어 단어 사용 금지(썸네일, 알고리즘 등 한국어 표기 사용).

■ 분석 대상: "${channel.title}" (이 채널을 벤치마킹에 넣지 말 것)

■ 채널 데이터:
- 구독자: ${fmt(channel.subscribers)}명 / 총 영상: ${channel.videoCount}개 / 총 조회수: ${fmt(channel.totalViews)}회
- 채널 설명: ${channel.description?.slice(0, 200) || '없음'}
- 평균 조회수: ${fmt(pre.avgViews)} / 좋아요 비율: ${pre.likeRatio}%
- 마지막 업로드: ${pre.daysSinceLastUpload !== null ? `${pre.daysSinceLastUpload}일 전` : '알 수 없음'}
- 최근 30일 업로드: ${pre.recentUploads}개

■ 최근 영상:
${topVideos}
${commentSection ? `\n■ 시청자 댓글 (실제 데이터):\n${commentSection}\n` : ''}
■ 코드 분석으로 확인된 강점:
${pre.facts.length > 0 ? pre.facts.map(f => `✓ ${f}`).join('\n') : '- 뚜렷한 강점 팩트 없음'}

■ 코드 분석으로 확인된 문제점:
${pre.issues.length > 0 ? pre.issues.map(i => `✗ ${i}`).join('\n') : '- 뚜렷한 문제점 없음'}
${trendingSection}
■ 작성 규칙:
1. score: 구독자(100미만=10, 1천=30, 1만=50, 10만=75, 100만=90, 1000만+=95) + 좋아요/업로드 빈도 반영
2. category: 영상 제목에서 파악한 핵심 주제 (짧게)
3. summary: 수치 포함 한줄 요약
4. strengths: 위 "확인된 강점"을 바탕으로 자연스러운 문장 작성. 영상 제목 패턴에서 발견한 콘텐츠 전략도 추가 가능. 위 "문제점"에 있는 내용을 강점에 절대 쓰지 말 것. 강점이 없으면 "현재 데이터에서 뚜렷한 강점을 확인하기 어렵습니다" 작성.
5. weaknesses: 위 "확인된 문제점"을 바탕으로 자연스러운 문장 작성 + 댓글에서 발견된 부정적 피드백이 있으면 추가.
6. actions: 각 weakness에 대한 구체적 해결책. 할 일 + 이유 + 기대 효과.
7. contentIdeas: 이 채널 주제 범위 내에서 아직 안 다룬 새 소재. 댓글에서 시청자가 요청하는 내용이 있으면 우선 반영. 각각 "제안. 근거: 이유와 기대효과" 형식.
8. commentSummary: 위 댓글 데이터를 분석하여 영상별 시청자 반응 요약. 각 영상에 대해 "영상제목: 댓글 분위기 한줄 요약 + 시청자가 주로 언급하는 키워드/요청" 형식. 댓글이 없으면 빈 배열.
9. benchmarks: 위 인기 영상의 채널만 사용. URL은 위 데이터 그대로 복사. 인기 영상 없으면 빈 배열. reason은 구체적 영상+수치+배울 점.

JSON만 응답:
{"score":0,"category":"","summary":"","strengths":[""],"weaknesses":[""],"actions":[""],"contentIdeas":[""],"commentSummary":[{"videoTitle":"","summary":""}],"benchmarks":[{"name":"","reason":"","url":""}]}`;
}
