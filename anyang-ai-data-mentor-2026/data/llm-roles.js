/* 대시보드와 대졸자 결과 화면에서 함께 사용하는 LLM 직무 구분 */
window.MD = window.MD || {};
window.MD.llmRoles = {
  intro: 'LLM 응용 개발자는 GPT·Claude·Llama 같은 언어 모델을 활용해 실제 사용자가 이용할 서비스를 만드는 개발자입니다. 외부 API를 연결하거나 직접 실행하는 모델을 사용할 수 있으며, 모델 파인튜닝은 필수가 아닙니다.',
  roles: [
    {name:'LLM 응용 개발자',work:'LLM API 연동, RAG, AI Agent, 서비스 백엔드 개발과 운영',tuning:'필수 아님',skills:'Java·Spring Boot 또는 Python 등 서비스 개발, API·DB·테스트·평가·비용·장애 관리',want:'AI를 활용해 사람들이 쓰는 서비스를 만들고 싶다'},
    {name:'LLM 파인튜닝 엔지니어',work:'기존 모델을 특정 업무·도메인에 맞게 데이터로 추가 학습하고 성능 평가',tuning:'주요 업무',skills:'PyTorch·Hugging Face, 학습 데이터·모델 평가, LoRA·QLoRA, GPU 메모리 관리 등. 제공업체의 학습 API를 활용하는 경우도 있음',want:'기존 AI 모델을 특정 분야에 맞게 학습시키고 싶다'},
    {name:'ML 엔지니어 / LLM 인프라 엔지니어',work:'모델 서빙, 추론 최적화, 학습·배포 파이프라인 구축과 운영',tuning:'업무에 따라',skills:'모델 실행·배포, GPU·메모리·성능 최적화, 모니터링과 운영 자동화',want:'AI 모델을 빠르고 안정적으로 운영하고 싶다'},
    {name:'AI 연구원',work:'모델 구조·학습 알고리즘을 연구하고 가설을 실험으로 검증',tuning:'연구 방향에 따라',skills:'수학·통계·머신러닝, 논문 이해·재현, 실험 설계·분석',want:'새로운 AI 모델이나 학습 방법을 연구하고 싶다'}
  ],
  distinction: '로컬 LLM 사용 = 파인튜닝은 아닙니다. Llama·Qwen 같은 오픈 웨이트 모델을 그대로 실행해 서비스에 연결하는 것도 응용 개발입니다. 데이터로 모델 가중치나 학습용 어댑터를 추가 학습시키는 작업이 파인튜닝입니다.',
  practice: '멘토 실무 예시: Life-Mento처럼 Java·Spring Boot에서 Claude 등의 LLM API를 연결하고, 사용자 데이터·RAG·AI Agent 기능, 프롬프트 평가, API 비용과 안정성을 다루는 일은 LLM 응용 개발의 영역입니다. 모델을 직접 학습시키지 않아도 해당합니다.',
  note: '회사마다 직무명과 업무 범위가 겹칠 수 있습니다. 관심 공고에서 서비스 구현·모델 학습·추론 운영·연구 중 무엇을 주로 맡는지 확인하세요.',
  sources: [
    {label:'Hugging Face 공식: 텍스트 생성과 모델 실행',url:'https://huggingface.co/docs/transformers/llm_tutorial'},
    {label:'Hugging Face 공식: 파인튜닝',url:'https://huggingface.co/docs/transformers/training'}
  ]
};
