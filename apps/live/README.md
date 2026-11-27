# apps/live: 운영 앱 + Path A 화면

PT쌤이 운영하는 `upvible/Rune-PT`의 파일을 그대로 가져와, 그 위에 Path A에서 다듬은 화면을 덧입힌 앱이에요. 원본 기능(로그인, 세트 기록, 동기화, 티어, 선물함, 트레이너 화면, 진단·분석 페이지, wlp)은 원본 코드가 그대로 실행해요. 덧입힘은 화면 배치와 말만 바꿔요.

## 폴더

| 경로 | 내용 | 직접 고치나요? |
|---|---|---|
| `upstream/` | `upvible/Rune-PT` main을 바이트 그대로 복사한 것 | 아니요. `npm run live:sync`로만 바꿔요 |
| `UPSTREAM.json` | 가져온 원본 커밋 | 아니요 |
| `overlay/ui/path-a.css` | Path A 색·글꼴·레이아웃 | 네 |
| `overlay/ui/path-a.js` | 원본 함수를 감싸서 화면을 바꾸는 스크립트 | 네 |
| `overlay/` 아이콘·`manifest.webmanifest` | 원본에 없던 앱 설치 파일. 원본에 생기면 원본 것을 써요 | 네 |
| `src/muscle-viewer.js` | 3D 근육 뷰어. 빌드 때 `ui/muscle-viewer.js`로 묶여요 | 네 |
| `dist/` | 빌드 결과. 배포하는 폴더 | 아니요 (git에 없음) |

3D 모형 `stayfit-muscle-skeleton.glb`(4.97MB)는 git에 없어요. [Google Drive](https://drive.google.com/drive/folders/1O4WmP18DQDbZ9YwZbwIVJnA9vrxvFOCd)에서 받아 `apps/web/public/models/`에 두세요. SHA-256은 `50c4b67f04929467ed4d839093252dd57dce1ee1db3179ef279ec788f4b6b399`예요. 없으면 3D 창에 "모형을 열지 못했어요"와 근육 이름만 보여요.

## 명령

```bash
npm run live:sync    # upvible/Rune-PT main을 upstream/으로 다시 가져와요
npm run live:build   # upstream + overlay -> dist
npm run live:dev     # 빌드하고 http://localhost:4174 에서 열어요
npm run live:smoke   # 빌드하고 Chrome으로 회원·트레이너 흐름을 눌러 봐요

# 트레이너 저장소의 브랜치를 Merge 전에 점검할 때 (원본 대신 그 폴더로 빌드)
LIVE_UPSTREAM=/절대/경로/Rune-PT npm run live:smoke

# 트레이너 저장소의 index.html을 css/app.css + js/ 4개로 나눌 때 (동작 변화 없음, 바이트 단위 검증)
node scripts/live-split.mjs /경로/Rune-PT
```

원본이 나뉜 뒤에도 빌드는 그대로 동작해요. 아바타 메시지 패치는 `js/app.js`가 있으면 그 파일에, 없으면 `index.html`에 들어가요.

로컬 주소는 `github.io`가 아니라서 원본이 서버에 연결하지 않아요. 로그인 화면의 "로그인 없이 미리보기"로 들어가면 회원·트레이너 화면을 모두 볼 수 있어요. 카카오·구글 로그인은 배포 주소에서만 동작해요.

## 원본에 적용하는 패치

`scripts/live-build.mjs`가 아래만 바꿔요. 원본이 바뀌어 기준 문장을 못 찾으면 빌드가 멈추고 어느 줄인지 알려 줘요. 이미 적용된 원본에는 다시 적용하지 않아요.

- `index.html`: `</head>` 앞에 `ui/path-a.css`, 서비스워커 등록 앞에 `ui/path-a.js`.
- `index.html`: 아바타 창에 보내는 메시지의 대상을 `'*'`에서 `location.origin`으로.
- `avatar/avatar.html`: 받는 메시지는 같은 출처·부모 창일 때만 처리하고, 보내는 메시지도 `location.origin`으로.
- `sw.js`: 캐시 버전에 `-pa1`을 붙이고 `ui/path-a.css`, `ui/path-a.js`를 오프라인 목록에 추가.

## 바뀌는 화면

- 디자인 기준은 `design-review/proposed/` 시안이에요(shadcn New York: 검은 바탕 `#09090b`, 카드 `#111113`, 테두리 `#27272a`, 흰색 주 버튼, Pretendard, 모서리 12/8px). 라이트 테마는 같은 역할을 밝은 값으로 써요. `DESIGN.md`의 Luminous Slate는 `apps/web` 시제품 기준이에요.
- 첫 화면이 홈 대신 **오늘**이에요. 하단 탭(900px 이상은 왼쪽 사이드)은 오늘·달력·통계·내 정보 텍스트 탭이고, 트레이너는 원래 6개 탭 그대로예요. 사이드 아래에 선물함과 저장 상태가 있어요.
- 홈에 있던 선물함과 회원 연결 요청은 오늘 위로, 티어 요약과 아바타는 내 정보로 옮겼어요. 아바타는 내 정보를 열 때만 받아요.
- 로그인은 데스크톱에서 왼쪽 설명과 오른쪽 로그인 카드로 나뉘어요. 버튼을 누르면 "이동 중…"으로 바뀌고 다시 눌리지 않아요. 테마는 오른쪽 위 아이콘 하나예요.
- 온보딩은 한 번에 한 질문(1 / 6)이고, 지금 단계가 맞아야 다음으로 넘어가요. 입력 범위(나이 8~90, 키 120~230, 체중 25~250, 체지방 3~60 또는 빈칸)는 원본 검사를 그대로 써요.
- 오늘 화면에 "지금 운동이 쓰는 근육" 카드(근육 포스터 `ui/muscle-poster.webp`, 주동·보조 칩)와 완료 볼륨 카드가 생겨요. 원본의 세부 근육 분류를 그대로 쓰고, "회전해서 보기"는 3D 창을 열어요. 세트 기록 창에도 같은 버튼이 있어요.
- 3D 창은 열 때만 three.js와 모형을 받아요. 앞·옆·뒤·처음 위치, 드래그 회전, 확대, Esc 닫기, 출처와 비의료 고지가 있어요. 모형에 없는 부위(광배근, 복직근)는 강조하지 않고 이름만 보여요.
- "오늘 기록 저장"은 테두리 버튼이 되고, 저장 상태는 데스크톱 사이드 아래에 계속 보여요.

## 알아 둘 것

- 아바타 창에는 원본처럼 성별을 보내요. 같은 출처의 아바타 파일이 체형을 고르는 데 쓰고, 외부로 나가지 않아요. 이번에 메시지 출처를 고정해 다른 사이트가 받을 수 없게 했어요.
- 원본 함수 이름이 바뀌어 덧입힘이 필요한 함수를 못 찾으면, 콘솔에 `[path-a] ... 없음`을 남기고 원본 화면을 그대로 보여 줘요.
