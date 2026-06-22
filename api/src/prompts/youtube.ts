/**
 * YouTube 채널 분석 프롬프트
 * 
 * 원칙:
 * - 팩트 기반 (실제 데이터에서 확인 가능한 내용만)
 * - 구체적 수치 포함
 * - 실행 가능한 액션
 * - 근거 연결 (왜 이런 피드백인지 설명)
 */

export function buildYouTubePrompt(channel: any, videos: any[]): string {
  const topVideos = videos.slice(0, 10).map(v => 
    `- "${v.title}" (조회수: ${v.views.toLocaleString()}, 좋아요: ${v.likes.toLocaleString()}, 댓글: ${v.comments.toLocaleString()}, ID: ${v.id})`
  ).join('\n');

  const avgViews = videos.length > 0 ? Math.round(videos.reduce((sum, v) => sum + v.views, 0) / videos.length) : 0;
  const avgLikes = videos.length > 0 ? Math.round(videos.reduce((sum, v) => sum + v.likes, 0) / videos.length) : 0;
  const likeRatio = avgViews > 0 ? ((avgLikes / avgViews) * 100).toFixed(1) : '0';
  const bestVideo = videos.length > 0 ? videos.reduce((best, v) => v.views > best.views ? v : best, videos[0]) : null;

  return `당신은 YouTube 채널 성장 전문 컨설턴트입니다. 
반드시 아래 데이터에서 확인 가능한 팩트만을 기반으로 분석하세요. 추측하지 마세요.

■ 채널 데이터:
- 채널명: ${channel.title}
- 구독자: ${channel.subscribers.toLocaleString()}명
- 총 영상: ${channel.videoCount}개
- 총 조회수: ${channel.totalViews.toLocaleString()}회
- 채널 설명: ${channel.description?.slice(0, 300) || '없음'}
- 평균 조회수: ${avgViews.toLocaleString()}회
- 평균 좋아요: ${avgLikes.toLocaleString()}개
- 좋아요 비율: ${likeRatio}% (조회수 대비)
${bestVideo ? `- 가장 인기 영상: "${bestVideo.title}" (조회수: ${bestVideo.views.toLocaleString()}, 좋아요: ${bestVideo.likes.toLocaleString()})` : ''}

■ 최근 영상 상세:
${topVideos}

■ 점수 기준 (엄격하게):
- 구독자: 100명 미만=10점, 1000명=30점, 1만=50점, 10만=75점, 100만=95점
- 평균 조회수: 구독자 대비 10% 이상=양호, 50% 이상=우수
- 업로드 빈도: 주 1회 이상=높음, 월 1회=보통, 그 이하=낮음
- 좋아요 비율: 3% 이상=우수, 1~3%=보통, 1% 미만=낮음
- 영상 ${channel.videoCount}개 + 구독자 ${channel.subscribers}명 + 평균 ${avgViews}회일 때 현실적으로 점수 부여

■ 강점 작성 규칙 (팩트 기반으로만):
- 실제 데이터에서 확인 가능한 긍정적 지표를 근거로
- "조회수가 높다"가 아니라 "평균 조회수 ${avgViews}회로 구독자 대비 ${likeRatio}%의 참여율" 처럼 구체적으로
- 영상 제목/설명에서 확인 가능한 좋은 전략 언급
- 좋아요 비율이 높으면 그 수치를 근거로

■ 단점 작성 규칙 (팩트 기반으로만):
- "업로드 빈도가 낮음"이 아니라 "최근 30일간 업로드 N회로, 알고리즘 노출 감소 가능성 높음"
- "좋아요가 적음"이 아니라 "좋아요 비율 ${likeRatio}%로 업계 평균(3%) 대비 낮아 콘텐츠 흥미도 개선 필요"
- 구독자 대비 조회수가 낮으면 그 비율을 구체적으로 명시
- 영상 수가 적으면 구체적 숫자 언급

■ 개선 액션 작성 규칙:
- "더 자주 올려라"가 아니라 "주 2~3회 정기 업로드를 유지하면 알고리즘 추천 빈도가 증가합니다. 현재 월 N회는 성장에 불리합니다"
- "자막을 추가하라"가 아니라 "영문 자막 추가 시 해외 조회 20~30% 증가를 기대할 수 있습니다"
- 각 액션에 왜 해야 하는지 근거 + 기대 효과 포함

■ 추천 콘텐츠 작성 규칙:
- 채널 주제와 연관된 구체적인 콘텐츠 아이디어
- "레시피 영상"이 아니라 "직접 만든 휘낭시에 vs 가게 휘낭시에 블라인드 테스트 - 참여형 콘텐츠로 공유율 증가 기대"
- 현재 트렌드나 시의성 있는 주제 연결
- 왜 이 콘텐츠가 효과적인지 근거 포함

■ 벤치마킹 작성 규칙:
- 반드시 실제 존재하는 YouTube 채널만 추천 (가상 금지)
- 형식: "당신의 채널은 [구체적 약점+수치]. '[채널명]' 채널과 같이 [구체적 빈도/방법]을 지켜야 [기대효과]를 얻을 수 있으며, [추가 조언]을 참고하세요."
- URL은 youtube.com/@핸들 형식

반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트 없이 JSON만:
{"score":0-100,"summary":"한줄요약(구체적 수치 포함)","strengths":["팩트 기반 강점1","강점2","강점3"],"weaknesses":["팩트 기반 단점1","단점2","단점3"],"actions":["구체적 개선액션1(근거+기대효과)","액션2","액션3"],"contentIdeas":["구체적 콘텐츠 아이디어1(효과 근거)","아이디어2","아이디어3"],"benchmarks":[{"name":"실제 채널명","reason":"당신의 채널은 [약점+수치]. '[채널명]' 채널과 같이 [구체적 방법]을 지키면 [기대효과]를 얻을 수 있으며, [추가 조언]을 참고하세요.","url":"youtube.com/@핸들"},{"name":"두번째","reason":"근거","url":"youtube.com/@핸들"},{"name":"세번째","reason":"근거","url":"youtube.com/@핸들"}]}

중요: benchmarks는 반드시 실제로 존재하는 YouTube 채널이어야 합니다. 가상의 채널을 만들지 마세요.`;
}
