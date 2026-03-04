# Environmental Site (환경/세계 학습 사이트)

나라별 국기·음식·문화·랜드마크를 배우고 OX 퀴즈를 풀 수 있는 웹 학습 사이트입니다.

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
│   ├── data/
│   │   ├── countries.json    # 국가 목록 (id, name, city, coverColor, flagCode)
│   │   └── questions/        # 국가별 퀴즈 (국기·음식·문화·랜드마크·OX)
│   └── flags/               # 국기 이미지 (ISO 코드별)
├── src/
│   ├── context/              # 인증 등 전역 상태
│   ├── pages/
│   │   ├── Login.tsx         # 로그인
│   │   ├── CountryList.tsx   # 국가 목록
│   │   ├── CountryActivityList.tsx  # 국가별 활동 선택
│   │   └── ActivityPlay.tsx  # 활동 플레이 (퀴즈·OX)
│   ├── types/                # TypeScript 타입
│   ├── utils/                # 유틸 (국기 URL 등)
│   └── App.tsx
├── scripts/                  # download-flags 등
├── package.json
└── vite.config.ts
```

## 활동 종류

| 활동 | 설명 |
|------|------|
| 국기 찾기 | 해당 국가 국기 고르기 |
| 음식 찾기 | 10문제, 국가 대표 음식 고르기 |
| 대표 문화 | 해당 국가 문화 선택 |
| 랜드마크 찾기 | 10문제, 랜드마크·명소 고르기 |
| OX 퀴즈 | 10문제, O/X로 정답 고르기 (설명 포함) |

## 데이터 형식

- **countries.json**: `id`, `name`, `city`, `coverColor`, `flagCode`
- **questions/{countryId}.json**: `flagFind`, `foodFind`, `cultureFind`, `landmarkFind`, `oxQuiz`  
  - 각 항목은 `question`, `correctAnswer`, `options`(선택지), `explanation`(설명, 선택) 등

## 라이선스

Private project.
