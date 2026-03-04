# Environmental Site (환경과학 VR 학습 사이트)

기후변화, 에너지, 분리배출, 해양오염 등 환경 문제를 VR 체험형 활동처럼 학습하고  
클릭형 4지선다·OX 퀴즈로 개념과 실천 방법을 익히는 웹 학습 사이트입니다.

## 기술 스택

- **React 18** + **TypeScript**
- **Vite 6** (빌드·개발 서버)
- **React Router 6** (라우팅)
- CSS Modules (스타일)

## 실행 방법

### 요구 사항

- Node.js 18+ (권장: 20+)
- npm 또는 yarn

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (기본: http://localhost:5173)
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과물 미리보기
npm run preview
```

### 기타 스크립트

```bash
# 국기 이미지 다운로드 (public/flags)
npm run download-flags
```

## 프로젝트 구조

```
├── public/
│   └── data/
│       ├── countries.json    # 환경과학 VR 콘텐츠 목록 (id, name, city, coverColor)
│       └── questions/        # VR 콘텐츠별 퀴즈 (활동1~4 4지선다, 활동5 OX)
├── src/
│   ├── context/              # 인증 등 전역 상태
│   ├── pages/
│   │   ├── Login.tsx         # 로그인
│   │   ├── CountryList.tsx   # 환경과학 VR 콘텐츠 목록
│   │   ├── CountryActivityList.tsx  # 콘텐츠별 활동 선택
│   │   └── ActivityPlay.tsx  # 활동 플레이 (4지선다·OX)
│   ├── types/                # TypeScript 타입
│   ├── utils/                # 유틸 (국기 URL 등)
│   └── App.tsx
├── package.json
└── vite.config.ts
```

## 활동 종류 (환경과학 VR 기준)

| 활동 | 설명 |
|------|------|
| 활동 1 | 환경 개념·상황 이해 4지선다 (10문제 이상) |
| 활동 2 | 생활 속 실천·비실천 구분 4지선다 (10문제 이상) |
| 활동 3 | 잘못된 사례 찾기·좋은 습관 찾기 4지선다 (10문제 이상) |
| 활동 4 | 미션·분류·설계형 문제 4지선다 (10문제 이상) |
| 활동 5 (OX) | 환경 OX 퀴즈 (10문제 이상) |

## 데이터 형식

- **countries.json**: `id`, `name`, `city`, `coverColor` (환경과학 VR 콘텐츠 메타 정보)
- **questions/{contentId}.json**: `flagFind`, `foodFind`, `cultureFind`, `landmarkFind`, `oxQuiz`  
  - `flagFind`, `foodFind`, `cultureFind`, `landmarkFind`: 4지선다 문제 배열 (각 10문제 이상 권장)
  - `oxQuiz`: OX 문제 배열 (10문제 이상 권장)

## 라이선스

Private project.
