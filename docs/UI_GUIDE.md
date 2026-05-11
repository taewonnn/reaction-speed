# UI 디자인 가이드

## 디자인 원칙
게임보다 측정 도구처럼 보여야 한다.
장난감 UI보다 “기록 측정기” 느낌.
불필요한 장식 제거.
긴장감이 먼저 보여야 한다.
화면 대부분을 색상 상태 변화에 사용.
UI 요소는 최소화.
한 손 조작 + 즉시 이해 가능해야 한다.
설명 읽지 않아도 시작 가능.
터치 영역은 화면 전체.

## AI 슬롭 안티패턴 — 하지 마라
| 금지 사항 | 이유 |
금지 사항	이유
backdrop-filter: blur()	토스 스타일과 안 맞음
gradient-text	AI SaaS 랜딩 느낌 남
neon glow	싸보임
보라/인디고 메인컬러	AI 템플릿 느낌 강함
과한 rounded-2xl 남발	모바일 게임 광고 느낌
floating orb 배경	의미 없는 장식
3D 카드	측정 앱 신뢰감 깨짐
excessive animation	

## 색상
배경
용도	값
페이지 기본	#0F1115
카드	#171A20
결과 카드	#1B1F27
상태 색상
상태	값
대기 (빨강)	#B93838
시작 가능 (초록)	#1F8F55
실패	#D97706
완료	#2563EB
텍스트
용도	값
메인	#F3F4F6
본문	#D1D5DB
보조	#9CA3AF
비활성	#6B7280
데이터/시맨틱
용도	값
빠름	#22C55E
평균	#EAB308
느림	#EF4444
중립	#525252

컴포넌트
카드
rounded-xl bg-[#171A20] border border-[#262A33] p-5

특징:

살짝만 둥글게
그림자 거의 없음
border로 구분
버튼
Primary
rounded-xl bg-white text-black active:bg-neutral-200 h-14 px-5 font-medium
Secondary
rounded-xl bg-[#22262F] text-white active:bg-[#2A2F3A]
Text
text-[#9CA3AF] active:text-white
입력 필드
rounded-xl bg-[#111318] border border-[#2A2F3A] px-4 py-3 text-white
레이아웃
항목	값
최대 너비	max-w-md
기본 패딩	px-5
카드 간격	gap-4
섹션 간격	space-y-6
정렬	중앙 정렬 최소화 / 정보는 좌측 기준
Safe Area	반드시 대응
타이포그래피
용도	스타일
메인 숫자(ms)	text-6xl font-semibold tracking-tight
페이지 제목	text-2xl font-semibold
설명	text-sm text-[#9CA3AF]
결과 멘트	text-base leading-relaxed
버튼	text-base font-medium

UX 규칙
가장 중요한 것
터치 → 결과

사이 딜레이 최소화.

절대 금지
로딩 스피너
과한 모션
복잡한 온보딩
결과 화면 디자인 원칙
숫자가 주인공
243ms

이 숫자가 화면 50% 먹어야 함.

결과 문구는 짧게

좋음:

평균보다 빠릅니다.

나쁨:

당신은 굉장히 뛰어난 반응 능력을 가진 사용자입니다.
앱인토스 톤앤매너
목표 느낌
토스 실험실 기능
+
닌텐도 미니게임
+
운동 측정 앱

사이 어딘가.

최종 디자인 키워드
절제된
빠른
긴장감 있는
도구 같은
즉각적인