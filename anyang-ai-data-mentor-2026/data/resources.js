/*
 * 추천 학습 자료 · 출처 · 채용공고 관찰 기록
 * verified = 2026-10-21에 해당 페이지가 존재하고 설명과 일치함을 직접 조회해 확인했는지 여부
 */
window.MD = window.MD || {};

window.MD.verifiedDate = "2026-10-21";

window.MD.resources = [
  { group: "공식 · 공공", items: [
    { name: "고용24 (국민내일배움카드 · K-디지털 훈련)", url: "https://www.work24.go.kr", desc: "훈련과정 통합검색, 국민내일배움카드 발급 신청, K-디지털 훈련 과정 검색 메뉴 확인", jobs: ["all"], verified: true },
    { name: "공공데이터포털", url: "https://www.data.go.kr", desc: "행정안전부 운영. 파일 데이터·오픈 API 형태로 공공데이터 제공 — 분석 포트폴리오 데이터 출처", jobs: ["analyst", "llmdev"], verified: true },
    { name: "한국데이터산업진흥원 데이터자격검정 안내", url: "https://www.kdata.or.kr/kr/contents/manpower_03_01/view.do", desc: "SQL(SQLD)·데이터분석(ADsP)·데이터아키텍처·빅데이터분석기사 종목, 과목, 공인 번호", jobs: ["analyst", "llmdev", "planner"], verified: true },
    { name: "데이터자격검정 시험 사이트", url: "https://www.dataq.or.kr", desc: "SQLD·ADsP 시험 일정·접수·응시료 확인처 (자동 조회 차단으로 세부 수치는 직접 확인 필요)", jobs: ["analyst"], verified: false },
    { name: "Q-Net", url: "https://www.q-net.or.kr", desc: "정보처리기사·빅데이터분석기사 등 국가기술자격 응시자격·일정 확인처 (본문 자동 조회 불가 — 직접 확인)", jobs: ["llmdev", "analyst"], verified: false },
    { name: "민간자격정보서비스", url: "https://www.pqi.or.kr", desc: "한국직업능력연구원 운영. 민간자격 등록·공인 여부 검색 — 'AI·프롬프트 자격증' 등록 여부 확인용", jobs: ["prompt"], verified: true }
  ]},
  { group: "프로그래밍 · 데이터 학습", items: [
    { name: "Python 공식 자습서 (한국어)", url: "https://docs.python.org/ko/3/tutorial/index.html", desc: "Python Software Foundation 공식 문서 한국어 번역. 다른 언어 경험자 대상이라 완전 입문자는 입문 강의와 병행", jobs: ["llmdev", "analyst"], verified: true },
    { name: "pandas Getting started 튜토리얼", url: "https://pandas.pydata.org/docs/getting_started/index.html", desc: "표 데이터 읽기·선택·시각화·집계·결합 등 10개 입문 튜토리얼 (영문)", jobs: ["analyst"], verified: true },
    { name: "프로그래머스 SQL 고득점 Kit", url: "https://school.programmers.co.kr/learn/challenges?tab=sql_practice_kit", desc: "SELECT·SUM/MAX/MIN·GROUP BY·IS NULL·JOIN·String/Date 카테고리별 SQL 연습 문제", jobs: ["analyst", "llmdev", "planner"], verified: true },
    { name: "Kaggle Learn", url: "https://www.kaggle.com/learn", desc: "Python·Pandas·Data Visualization 등 무료 강의 (영문)", jobs: ["analyst"], verified: true }
  ]},
  { group: "LLM · 프롬프트", items: [
    { name: "Anthropic 프롬프트 엔지니어링 개요", url: "https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview", desc: "성공 기준 정의 → 평가 방법 → 초안 프롬프트 → 기법 적용 순서 안내 (영문)", jobs: ["prompt", "llmdev", "planner"], verified: true },
    { name: "Anthropic 테스트·평가 설계 가이드", url: "https://platform.claude.com/docs/en/test-and-evaluate/develop-tests", desc: "측정 가능한 성공 기준, 어려운 사례 포함 테스트셋, 코드·LLM·사람 채점 방식 비교 (영문)", jobs: ["prompt", "llmdev"], verified: true },
    { name: "OpenAI Evals 가이드", url: "https://developers.openai.com/api/docs/guides/evals", desc: "LLM 출력 평가 개념 (영문). 공지: Evals 플랫폼 2026-10-31 읽기 전용, 2026-11-30 종료 예정", jobs: ["prompt", "llmdev"], verified: true }
  ]},
  { group: "채용 정보", items: [
    { name: "사람인", url: "https://www.saramin.co.kr", desc: "종합 채용 플랫폼. 이 사이트의 '채용공고 관찰' 출처", jobs: ["all"], verified: true },
    { name: "점핏", url: "https://jumpit.saramin.co.kr", desc: "개발자 대상 채용 플랫폼 (기술스택 기반 공고)", jobs: ["llmdev"], verified: true },
    { name: "기타 채용 플랫폼·기업 공식 채용페이지", url: "", desc: "잡코리아, 원티드 등과 관심 기업 공식 채용페이지를 함께 확인 (이번 조사에서 개별 조회하지 않음)", jobs: ["all"], verified: false },
    { name: "Figma 도움말", url: "https://help.figma.com", desc: "Figma 공식 도움말 센터 (영문). 프로토타입 기능 학습", jobs: ["planner"], verified: true }
  ]}
];

/* 채용공고 관찰 기록: 사람인 검색 결과 '카드 태그' 기준. 상세 요강은 확인하지 않음 */
window.MD.postings = {
  note: "2026-10-21 사람인 키워드 검색 결과 목록의 공고 카드에 표시된 태그를 옮긴 것입니다. 공고 상세 요강은 열람하지 않았으며, 태그는 직무 분류에 가까워 실제 요구 역량과 다를 수 있습니다. 공고는 수시로 마감·변경됩니다.",
  searches: [
    {
      keyword: "데이터분석가 신입", job: "analyst",
      summary: "상위 10건 중 신입 단독 1건, 나머지는 신입·경력 동시 모집",
      tags: ["데이터분석", "데이터시각화", "Python", "빅데이터", "AI(인공지능)", "데이터 사이언티스트", "데이터엔지니어"]
    },
    {
      keyword: "AI 서비스 기획", job: "planner",
      summary: "상위 15건 중 '신입' 1건(AI서비스 기획자 PM/PO — 서비스기획·PM·AI·SaaS·SQL), 경력 1~5년↑ 다수",
      tags: ["서비스기획", "PM", "PO", "AI", "SQL", "SaaS", "UI/UX", "PoC"]
    },
    {
      keyword: "프롬프트 엔지니어", job: "prompt",
      summary: "검색 결과 135건. 상위 15건 중 직무명이 '프롬프트 엔지니어'인 공고 2건, 나머지는 AI Agent 엔지니어·AI 서비스 기획·업무자동화 등",
      tags: ["AI(인공지능)", "챗봇", "Python", "Docker", "Git", "데이터엔지니어"]
    },
    {
      keyword: "LLM 개발 신입", job: "llmdev",
      summary: "상위 15건 중 '신입' 또는 '신입·경력' 9건. 백엔드/서버개발 태그 빈번",
      tags: ["Python", "Java", "백엔드/서버개발", "Docker", "JPA", "Kubernetes", "머신러닝", "ETL", "웹개발"]
    }
  ]
};

/* 정보 구분 범례 */
window.MD.tagLegend = {
  O: { label: "공식 확인", desc: "공식 기관·공식 문서에서 확인한 사실" },
  P: { label: "채용공고 관찰", desc: "2026-10-21 사람인 검색 결과에서 관찰한 내용 (카드 태그 기준)" },
  G: { label: "일반 권장", desc: "일반적인 학습·취업 준비 권장 사항 (출처 단일 아님)" },
  M: { label: "멘토 조언", desc: "멘토 실무 관점의 조언 — 행사 전 본인 경험에 맞게 다듬어 사용" }
};

/* 조사 한계 */
window.MD.researchLimits = [
  "웹 검색 도구가 비활성화되어 있어, 알고 있는 공식 URL을 직접 조회하는 방식으로만 확인했습니다.",
  "데이터자격검정(dataq.or.kr)·NCS(ncs.go.kr)는 자동 조회가 차단되어 시험 일정·응시료·합격 기준·NCS 능력단위는 사이트에 넣지 않았습니다.",
  "Q-Net은 본문이 조회되지 않아 정보처리기사·빅데이터분석기사 응시자격 세부 내용은 '직접 확인'으로 표기했습니다.",
  "채용공고는 사람인 검색 목록의 카드 태그만 확인했습니다. 상세 자격요건·연봉·채용 규모는 확인하지 않았습니다.",
  "고용24 개별 교육과정의 모집 여부·비용·취업률은 확인하지 않았으므로 특정 과정을 추천하지 않습니다."
];
