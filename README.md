# Environmental Site (환경과학 VR 학습 사이트)

기후변화, 에너지, 분리배출, 해양오염 등 환경 문제를 VR 체험형 활동처럼 학습하고  
클릭형 4지선다·OX 퀴즈·연결·드래그 등으로 개념과 실천 방법을 익히는 웹 학습 사이트입니다.

## 사용자 흐름

1. **비밀번호 입력** — 로그인 화면에서 비밀번호 입력 후 들어가기
2. **콘텐츠 목록** — 환경과학 VR 콘텐츠 목록에서 원하는 콘텐츠 클릭
3. **활동 선택** — 해당 콘텐츠의 활동(예: 재활용 물건 찾기, OX 퀴즈 등) 클릭
4. **활동 진행** — 문제를 풀거나 드래그·연결 등 인터랙션 수행
5. **결과·설명 표시** — 각 문제 종료 시 정답 여부와 설명 표시
6. **다시 활동 진행** — 다음 문제로 진행하거나, 활동 끝내기 후 다른 활동·콘텐츠 선택

(초등 1~3학년 / 교사 화면 진행 / 마우스 클릭·드래그 기반)

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


## 프로젝트 구조

```
├── public/
│   └── data/
│       ├── contents.json     # 환경과학 VR 콘텐츠 목록 (id, name, city, coverColor)
│       └── questions/        # VR 콘텐츠별 퀴즈 (활동1~4 4지선다, 활동5 OX)
├── src/
│   ├── context/              # 인증 등 전역 상태
│   ├── pages/
│   │   ├── Login.tsx                  # 로그인
│   │   ├── EnvContentList.tsx         # 환경과학 VR 콘텐츠 목록
│   │   ├── EnvContentActivityList.tsx # 콘텐츠별 활동 선택
│   │   └── ActivityPlay.tsx           # 활동 플레이 (4지선다·OX)
│   ├── types/                # TypeScript 타입
│   └── App.tsx
├── package.json
└── vite.config.ts
```

## 활동 종류 (환경과학 VR 기준)

일반 콘텐츠는 활동 1~5(4지선다·OX 등)를 가지며, **자원순환·분리배출 체험 VR**(똑똑한 재활용)은 아래 4가지 활동만 순서대로 노출됩니다.

### 자원순환·분리배출 체험 VR (recycle) 전용

| 순서 | 활동 | 설명 |
|------|------|------|
| 1 | OX 퀴즈 | 문제와 O·X 선택 후 정답 표시와 설명 표시 (10문제 이상) |
| 2 | 4지 선다 | 문제와 4개 항목, 정답 선택 시 정답 표시와 설명 표시 (10문제 이상) |
| 3 | 분리수거 통에 넣기 | 왼쪽 물품 4~5개를 오른쪽 항목(유리·종이·플라스틱·캔·일반쓰레기)에 드래그 → 정답 확인 시 정답/오답 색 구분, 하단 설명 (10라운드 이상) |
| 4 | 분리수거 가능/일반쓰레기 | 왼쪽 물품을 오른쪽(분리수거 가능·일반 쓰레기)에 드래그 → 정답 확인 시 색 구분, 하단 설명 (10라운드 이상) |

### 그 외 콘텐츠

| 활동 | 설명 |
|------|------|
| 활동 1~4 | 콘텐츠별 4지선다·순서맞추기·매칭·드래그 등 |
| 활동 5 (OX) | 환경 OX 퀴즈 (10문제 이상) |

## 데이터 형식

- **contents.json**: `id`, `name`, `city`, `coverColor` (환경과학 VR 콘텐츠 메타 정보)
- **questions/{contentId}.json**: `flagFind`, `foodFind`, `cultureFind`, `landmarkFind`, `oxQuiz`  
  - `flagFind`, `foodFind`, `cultureFind`, `landmarkFind`: 4지선다 문제 배열 (각 10문제 이상 권장)
    - 각 문제: `question`, `options`, `correctAnswer`, **`explanation`**(선택) — 정답 확인 후 표시할 설명
  - `oxQuiz`: OX 문제 배열 (10문제 이상 권장)
    - 각 문제: `question`, `correctAnswer`, **`explanation`**(선택) — 정답 확인 후 표시할 설명
  - **recycle 전용**: `dragByCategoryRounds`, `dragRecyclableRounds` (각 10라운드 이상 권장)
    - 각 라운드: `items` — `{ id, label, bucketId, explanation? }[]` (4~5개), 선택적으로 `explanation` (라운드 전체 설명)

(WorldTravelSite와 동일하게, **각 문제마다 설명(explanation)**을 두면 결과 화면에서 정답·오답과 함께 표시됩니다.)

## 라이선스

Private project.
