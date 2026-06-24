/**
 * YouTube 채널 분석 프롬프트 v2
 * 킬링 포인트: "다음 영상 전략" — 데이터 기반 바이럴 공식 추출
 * 코드가 패턴 분석 → AI는 전략 문장 작성
 */

function fmt(n: number): string {
  if (n >= 100000000) return `${(n / 100000000).toFixed(1).replace(/\.0$/, '')}억`;
  if (n >= 10000) return `${(n / 10000).toFixed(1).replace(/\.0$/, '')}만`;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}천`;
  return n.toLocaleString();
}

const DAYS = ['일', '월', '화', '수', '목', '금', '토'];

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

  // ─── 바이럴 패턴 분석 ───
  const sorted = [...videos].sort((a, b) => b.views - a.views);
  const topCount = Math.max(Math.ceil(videos.length * 0.3), 1);
  const topVideos = sorted.slice(0, topCount);
  const bottomVideos = sorted.slice(-topCount);

  // 영상 길이 vs 성과
  const durationBuckets: Record<string, { total: number; count: number }> = {
    '0~3분': { total: 0, count: 0 },
    '3~8분': { total: 0, count: 0 },
    '8~15분': { total: 0, count: 0 },
    '15분+': { total: 0, count: 0 },
  };
  videos.forEach(v => {
    if (!v.duration) return;
    const min = v.duration / 60;
    const bucket = min < 3 ? '0~3분' : min < 8 ? '3~8분' : min < 15 ? '8~15분' : '15분+';
    durationBuckets[bucket].total += v.views;
    durationBuckets[bucket].count += 1;
  });
  const durationAnalysis = Object.entries(durationBuckets)
    .filter(([, v]) => v.count > 0)
    .map(([range, v]) => ({ range, avgViews: Math.round(v.total / v.count), count: v.count }))
    .sort((a, b) => b.avgViews - a.avgViews);
  const optimalDuration = durationAnalysis[0] || null;

  // 업로드 요일 vs 성과
  const dayBuckets: Record<string, { total: number; count: number }> = {};
  DAYS.forEach(d => { dayBuckets[d] = { total: 0, count: 0 }; });
  videos.forEach(v => {
    const day = DAYS[new Date(v.publishedAt).getDay()];
    dayBuckets[day].total += v.views;
    dayBuckets[day].count += 1;
  });
  const dayAnalysis = Object.entries(dayBuckets)
    .filter(([, v]) => v.count > 0)
    .map(([day, v]) => ({ day, avgViews: Math.round(v.total / v.count), count: v.count }))
    .sort((a, b) => b.avgViews - a.avgViews);
  const bestDay = dayAnalysis[0] || null;
  const worstDay = dayAnalysis[dayAnalysis.length - 1] || null;

  // 제목 패턴: 상위 vs 하위
  const topAvgTitleLen = topVideos.length > 0 ? Math.round(topVideos.reduce((s, v) => s + v.title.length, 0) / topVideos.length) : 0;
  const bottomAvgTitleLen = bottomVideos.length > 0 ? Math.round(bottomVideos.reduce((s, v) => s + v.title.length, 0) / bottomVideos.length) : 0;
  const topAvgDuration = topVideos.filter(v => v.duration).length > 0
    ? Math.round(topVideos.filter(v => v.duration).reduce((s, v) => s + v.duration, 0) / topVideos.filter(v => v.duration).length) : 0;
  const bottomAvgDuration = bottomVideos.filter(v => v.duration).length > 0
    ? Math.round(bottomVideos.filter(v => v.duration).reduce((s, v) => s + v.duration, 0) / bottomVideos.filter(v => v.duration).length) : 0;

  // 제목 키워드 빈출 분석 (상위 영상)
  const topTitleWords = topVideos.flatMap(v => v.title.replace(/[^\w\uAC00-\uD7AF\s]/g, '').split(/\s+/).filter((w: string) => w.length > 1));
  const wordFreq: Record<string, number> = {};
  topTitleWords.forEach((w: string) => { wordFreq[w] = (wordFreq[w] || 0) + 1; });
  const topKeywords = Object.entries(wordFreq).filter(([, c]) => c >= 2).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([w]) => w);

  // ─── 기존 강점/단점 판단 ───
  const facts: string[] = [];
  const issues: string[] = [];

  if (daysSinceLastUpload !== null && daysSinceLastUpload > 180) {
    issues.push(`채널 활동 중단 상태: 마지막 업로드 ${daysSinceLastUpload}일 전(약 ${Math.round(daysSinceLastUpload / 30)}개월). 활동을 멈춘 채널`);
  } else if (daysSinceLastUpload !== null && daysSinceLastUpload > 30) {
    issues.push(`업로드 빈도 저하: 최근 30일간 업로드 0개, 마지막 업로드 ${daysSinceLastUpload}일 전`);
  } else if (recentUploads >= 8) {
    facts.push(`매우 활발한 업로드: 최근 30일간 ${recentUploads}개(평균 ${uploadFrequency}일 간격)`);
  } else if (recentUploads >= 4) {
    facts.push(`꾸준한 업로드: 최근 30일간 ${recentUploads}개(주 1회 이상)`);
  }

  if (likeRatio >= 5) facts.push(`매우 높은 시청자 만족도: 좋아요 비율 ${likeRatio}%(업계 평균 3% 대비 크게 상회)`);
  else if (likeRatio >= 3) facts.push(`양호한 시청자 참여: 좋아요 비율 ${likeRatio}%(업계 평균 이상)`);
  else if (likeRatio < 1 && avgViews > 100) issues.push(`매우 낮은 좋아요 비율(${likeRatio}%): 업계 평균 3% 대비 크게 부족`);
  else if (likeRatio < 3 && avgViews > 100) issues.push(`좋아요 비율(${likeRatio}%) 개선 필요: 업계 평균 3% 미달`);

  if (channel.subscribers >= 100 && avgViews > 0) {
    const ratio = avgViews / channel.subscribers;
    if (ratio > 1) facts.push(`폭발적 도달률: 평균 조회수(${fmt(avgViews)})가 구독자(${fmt(channel.subscribers)}) 초과`);
    else if (ratio > 0.3) facts.push(`높은 도달률: 평균 조회수가 구독자 대비 ${(ratio * 100).toFixed(0)}%`);
    else if (ratio < 0.03 && channel.subscribers > 1000) issues.push(`극히 낮은 도달률: 평균 조회수(${fmt(avgViews)})가 구독자(${fmt(channel.subscribers)}) 대비 ${(ratio * 100).toFixed(1)}%`);
  } else if (channel.subscribers < 100) {
    issues.push(`초기 성장 단계: 구독자 ${channel.subscribers}명. 채널 인지도 매우 낮음`);
  }

  if (bestVideo && avgViews > 0 && bestVideo.views > avgViews * 3) {
    facts.push(`바이럴 콘텐츠 보유: "${bestVideo.title}" 조회수 ${fmt(bestVideo.views)}(평균의 ${Math.round(bestVideo.views / avgViews)}배)`);
  }

  return {
    avgViews, avgLikes, likeRatio, bestVideo, daysSinceLastUpload, uploadFrequency, recentUploads,
    facts, issues,
    // 바이럴 패턴
    durationAnalysis, optimalDuration,
    dayAnalysis, bestDay, worstDay,
    topAvgTitleLen, bottomAvgTitleLen, topAvgDuration, bottomAvgDuration,
    topKeywords,
  };
}

export function buildYouTubePrompt(channel: any, videos: any[], trendingVideos: any[] = []): string {
  const pre = preAnalyze(channel, videos);

  const topVideos = videos.slice(0, 10).map(v =>
    `- "${v.title}" (조회수: ${fmt(v.views)}, 좋아요: ${fmt(v.likes)}, 길이: ${v.duration ? `${Math.floor(v.duration / 60)}분${v.duration % 60}초` : '?'}, 게시일: ${v.publishedAt?.slice(0, 10)})`
  ).join('\n');

  const hasComments = videos.slice(0, 3).some((v: any) => v.topComments?.length > 0);
  const commentSection = hasComments
    ? videos.slice(0, 3).filter((v: any) => v.topComments?.length > 0).map((v: any) =>
        `"${v.title}" 댓글:\n${v.topComments.map((c: string) => `  - "${c}"`).join('\n')}`
      ).join('\n')
    : '';

  // 바이럴 공식 섹션 (코드 계산 결과)
  const viralFormula: string[] = [];
  if (pre.optimalDuration) {
    viralFormula.push(`최적 영상 길이: ${pre.optimalDuration.range} (평균 조회수 ${fmt(pre.optimalDuration.avgViews)}, ${pre.optimalDuration.count}개 영상 기준)`);
    if (pre.durationAnalysis.length > 1) {
      const worst = pre.durationAnalysis[pre.durationAnalysis.length - 1];
      viralFormula.push(`비효율 영상 길이: ${worst.range} (평균 조회수 ${fmt(worst.avgViews)}, 최적 대비 ${Math.round((1 - worst.avgViews / pre.optimalDuration.avgViews) * 100)}% 낮음)`);
    }
  }
  if (pre.bestDay && pre.worstDay && pre.bestDay.day !== pre.worstDay.day) {
    viralFormula.push(`최적 업로드 요일: ${pre.bestDay.day}요일 (평균 조회수 ${fmt(pre.bestDay.avgViews)}) vs 최저: ${pre.worstDay.day}요일 (${fmt(pre.worstDay.avgViews)})`);
  }
  if (pre.topAvgDuration && pre.bottomAvgDuration && pre.topAvgDuration !== pre.bottomAvgDuration) {
    viralFormula.push(`상위 영상 평균 길이: ${Math.round(pre.topAvgDuration / 60)}분 vs 하위 영상: ${Math.round(pre.bottomAvgDuration / 60)}분`);
  }
  if (pre.topAvgTitleLen && pre.bottomAvgTitleLen) {
    viralFormula.push(`상위 영상 제목 평균 길이: ${pre.topAvgTitleLen}자 vs 하위: ${pre.bottomAvgTitleLen}자`);
  }
  if (pre.topKeywords.length > 0) {
    viralFormula.push(`상위 영상 제목 빈출 키워드: ${pre.topKeywords.join(', ')}`);
  }

  const trendingSection = trendingVideos.length > 0 ? `
■ 동일 장르 성공 채널 상세 분석 (이 채널들이 왜 성공했는지 분석하여 benchmarks에 활용):
${trendingVideos.map((ch: any) => `
채널: "${ch.channelTitle}" (구독자: ${fmt(ch.channelSubscribers)}, URL: www.youtube.com/${ch.channelHandle})
영상 목록:
${(ch.videos || []).map((v: any) => `  - "${v.title}" (조회수: ${fmt(v.views)}, 좋아요: ${fmt(v.likes)}, 길이: ${v.duration ? `${Math.floor(v.duration/60)}분` : '?'})
    설명: ${v.description || '없음'}`).join('\n')}`).join('\n')}

위 성공 채널을 분석하여 benchmarks에 작성 시:
- 이 채널들의 영상 제목/설명/길이에서 발견한 성공 요인을 구체적으로 작성
- 분석 대상 채널이 이 성공 요인을 어떻게 적용할 수 있는지 구체적 액션으로 제안
` : '';

  return `YouTube 채널 분석. 한국어 완전한 문장으로 JSON 응답. 영어 단어 금지(한국어 표기 사용).

■ 분석 대상: "${channel.title}" (벤치마킹에 넣지 말 것)

■ 채널: 구독자 ${fmt(channel.subscribers)}명 / 영상 ${channel.videoCount}개 / 총 조회수 ${fmt(channel.totalViews)}회
설명: ${channel.description?.slice(0, 150) || '없음'}
평균 조회수: ${fmt(pre.avgViews)} / 좋아요 비율: ${pre.likeRatio}%
마지막 업로드: ${pre.daysSinceLastUpload !== null ? `${pre.daysSinceLastUpload}일 전` : '?'} / 최근 30일: ${pre.recentUploads}개

■ 최근 영상:
${topVideos}
${commentSection ? `\n■ 시청자 댓글:\n${commentSection}\n` : ''}
■ 바이럴 공식 (코드 분석 결과 — 이 데이터를 viralFormula 필드에 활용):
${viralFormula.length > 0 ? viralFormula.map(f => `📊 ${f}`).join('\n') : '- 영상 수가 부족하여 패턴 분석 불가'}

■ 강점 팩트:
${pre.facts.length > 0 ? pre.facts.map(f => `✓ ${f}`).join('\n') : '- 없음'}

■ 문제점:
${pre.issues.length > 0 ? pre.issues.map(i => `✗ ${i}`).join('\n') : '- 없음'}
${trendingSection}
■ JSON 필드 작성법:
1. score: 0~100
2. category: 핵심 주제 (짧게)
3. summary: 수치 포함 한줄 요약
4. viralFormula: 위 "바이럴 공식" 데이터를 바탕으로, 이 채널에서 다음 영상을 만들 때 따라야 할 구체적 전략을 3~4개 작성. 각 항목은 "전략 내용. 근거: 데이터 수치" 형식.
5. strengths: 위 강점 팩트를 자연스러운 문장으로. 없으면 "현재 데이터에서 뚜렷한 강점을 확인하기 어렵습니다".
6. weaknesses: 위 문제점을 자연스러운 문장으로. 영상 길이 문제가 있으면 포함.
7. actions: 각 weakness의 구체적 해결책.
8. contentIdeas: 이 채널 주제 내 새 소재. 댓글 요청 우선 반영. "제안. 근거: 이유+기대효과" 형식.
9. commentSummary: ${hasComments ? '영상별 댓글 요약.' : '빈 배열.'}
10. benchmarks: 위 성공 채널 데이터 활용. 각 채널의 영상 제목/설명/길이/조회수를 분석하여 reason에: 1) 이 채널이 성공한 구체적 요인(영상 길이, 제목 스타일, 설명란 활용법, 콘텐츠 형식 등) 2) 분석 대상 채널이 이를 적용할 수 있는 구체적 액션 작성. URL은 위 데이터에서 그대로 복사. 없으면 빈 배열.

JSON:
{"score":0,"category":"","summary":"","viralFormula":[""],"strengths":[""],"weaknesses":[""],"actions":[""],"contentIdeas":[""],"commentSummary":[],"benchmarks":[]}`;
}
