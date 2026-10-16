# 항저우 여행 지도 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** 원본 이미지의 항저우 장소 27곳을 지도에서 탐색하고 날짜별 여행 계획을 편집·보관하는 한국어 웹사이트를 만든다.

**Architecture:** Vite로 실행·빌드하는 정적 웹사이트다. 고정 장소 데이터, 순수 함수로 처리하는 일정, 저장소 어댑터, Leaflet 지도, DOM 기반 UI를 분리한다. 지도와 목록은 같은 검색 결과와 선택 상태를 사용한다.

**Tech Stack:** JavaScript ES modules, CSS, Vite, Leaflet, Node.js 내장 테스트 러너. 설치 시 Vite의 지원 안정 버전과 Leaflet 1.9.4를 사용하고 package-lock.json을 보관한다. Leaflet 2의 변경된 인터페이스를 섞지 않는다. 현재 환경은 Node v25.6.1, npm 11.9.0이다.

**Spec:** [승인된 설계서](../specs/2026-10-16-hangzhou-travel-design.md)

## Global Constraints

- 한국어 화면을 기본으로 하되 중국 현지에서 장소를 찾을 수 있도록 중국어 원문을 함께 표시한다.
- 스크린샷에 표시된 27개 장소를 서로 다른 항목으로 제공한다.
- 원본 스크린샷의 장소별 사진 영역을 CSS로 잘라 보여주고 원본 이미지 파일은 보존한다.
- 표의 평점과 가격은 원본 스크린샷의 값으로만 표시한다.
- 배경 지도는 인터넷 연결이 필요하다.
- 같은 브랜드의 서로 다른 지점은 합치지 않는다.
- 근거 없는 정밀 좌표를 확정 위치로 표시하지 않는다.
- 첫 실행에서는 권역별로 구성한 3일 예시 계획을 제공하고, 사용자가 확정한 일정으로 오해하지 않도록 `예시 일정`이라고 표시한다.
- 마지막 일차는 삭제할 수 없다.
- 같은 장소를 같은 날에 중복 추가하지 않고 기존 항목으로 안내한다.
- 점선은 방문 순서를 설명하는 직선 연결이며 실제 도로 경로 또는 대중교통 안내로 표현하지 않는다.
- 사용자 메모는 HTML로 해석하지 않고 텍스트로 출력한다.
- 별도 서버, 계정, API 키, 데이터베이스는 요구하지 않는다.
- 현재 폴더에는 Git 저장소가 없으므로 브랜치 생성·커밋은 수행하지 않는다. 원본 JPG는 이동·덮어쓰기하지 않는다.

## Review Focus

1. 비정상 저장 데이터: 알 수 없는 장소 ID, 중복 ID, 실제로 존재하지 않는 날짜를 복원하지 않는다. Task 2 테스트로 고정한다.
2. 저장소 접근 거부: localStorage를 얻거나 읽고 쓰는 단계에서 예외가 나도 화면과 현재 세션의 편집이 유지된다. Task 2 테스트로 고정한다.
3. 탭 전환 후 지도 크기: 모바일에서 숨겨진 지도를 다시 표시할 때 빈 지도나 잘못된 중심이 나타나지 않는다. Task 3과 Task 5 브라우저 확인으로 고정한다.
4. 지리적으로 겹치는 장소: 실크시티·실크거리와 같은 인근 장소를 각각 선택할 수 있다. Task 3과 Task 5 브라우저 확인으로 고정한다.
5. 메모·삭제·초기화: HTML처럼 생긴 메모는 텍스트로 남고, 삭제 확인을 취소하면 저장 상태가 바뀌지 않는다. Task 4와 Task 5에서 확인한다.

## 파일별 책임과 공통 인터페이스

| 파일 | 책임 |
| --- | --- |
| `package.json`, `package-lock.json`, `.gitignore` | dev/build/preview/test 실행과 의존성 고정 |
| `index.html`, `src/main.js` | 앱 진입점, 화면 상태, 이벤트 연결 |
| `src/styles.css` | 반응형 레이아웃과 시각 스타일 |
| `src/data/places.js` | 장소 27개, 분류, 원본 사진 영역, 위치 근거 |
| `src/search.js` | 한국어·중국어 이름 검색과 분류 필터 |
| `src/itinerary.js` | 예시 일정, 검증, 일정 변경의 순수 함수 |
| `src/storage.js` | 저장·복원과 오류 결과 |
| `src/map.js` | Leaflet 지도, 마커, 툴팁, 선택, 방문 순서 |
| `src/ui/photos.js` | 원본 사진 영역과 원본 보기 |
| `src/ui/places.js` | 목록, 상세 패널, 검색·분류 UI |
| `src/ui/plan.js` | 일차 탭, 일정 편집, 확인 대화상자 |
| `tests/places.test.js`, `tests/itinerary.test.js`, `tests/storage.test.js` | 핵심 데이터·일정·복원의 동작 검증 |
| `README.md` | 실행·빌드·사용법과 데이터의 한계 |

`Place`는 `{id, nameKo, nameZh, category, rating, price, description, coordinates, locationAccuracy, locationSource, photo}`다. `coordinates`는 WGS84의 `[latitude, longitude]`, `locationAccuracy`는 `place` 또는 `area`, `locationSource`는 `{label, url}`이다. `photo`는 `{src, x, y, width, height, sourceWidth, sourceHeight}`이며 좌표는 원본 이미지 픽셀 기준이다. 평점과 가격이 없으면 `null`이다. 범주 ID는 `nature`, `sight`, `temple`, `food`, `shopping`, `stay`, `transport`를 사용한다.

`Plan`은 `{version: 1, isExample: boolean, days: Day[]}`, `Day`는 `{id, date: string, note: string, placeIds: string[]}`다. `date`는 빈 문자열 또는 실제 존재하는 `YYYY-MM-DD` 날짜다. 화면의 선택 일차 ID는 별도 UI 상태로 유지하고, 삭제 후에는 인접한 남은 일차를 선택한다. 일정 변경 시 `isExample`을 `false`로 설정하고, 예시로 초기화할 때만 `true`로 되돌린다.

## Task 1: 원본 장소 데이터와 실행 가능한 기본 화면

**Files:** Create `package.json`, `package-lock.json`, `.gitignore`, `index.html`, `src/main.js`, `src/styles.css`, `src/data/places.js`, `src/search.js`, `src/ui/photos.js`, `tests/places.test.js`.

**Interfaces:**
- Produces: `places: Place[]`, `categories: {id, label}[]`, `filterPlaces(places, query, categoryId): Place[]`, `createPhoto(place, {large = false} = {}): HTMLElement`.
- `categoryId`가 `all`이면 분류 제한 없이 검색한다. 검색은 양끝 공백 제거와 대소문자 무시를 적용하고 `nameKo`, `nameZh`를 비교한다.

- [x] **Step 1:** 승인된 설계서의 27개 ID, 중국어 원문, 평점, 아이스크림 두 지점의 가격을 기준으로 `tests/places.test.js`를 작성한다. `filterPlaces(places, '  灵隐寺  ', 'temple')`가 `lingyin` 한 곳을 반환하고, 같은 검색을 `food`로 하면 빈 배열을 반환하는 사례를 포함한다. 모든 사진 영역이 원본 크기 안에 있고 모든 좌표에 출처·정밀도가 있는지도 검증한다.

  핵심 단언은 `assert.equal(places.length, 27)`, `assert.equal(new Set(places.map(p => p.id)).size, 27)`, `assert.deepEqual(filterPlaces(places, '  灵隐寺  ', 'temple').map(p => p.id), ['lingyin'])`, `assert.deepEqual(filterPlaces(places, '灵隐寺', 'food'), [])`다. 테스트 이름은 `source inventory preserves 27 distinct places`, `search intersects the selected category`, `photos and coordinates retain source metadata`로 한다.
- [x] **Step 2:** `node --test tests/places.test.js`를 실행해 아직 모듈이 없어 실패하는지 확인한다.
- [x] **Step 3:** 실행 설정을 작성하고 Vite와 Leaflet 1.9.4를 설치한다. `dev: vite --host 127.0.0.1`, `build: vite build`, `preview: vite preview --host 127.0.0.1`, `test: node --test` 스크립트를 제공한다. 설치가 네트워크 제한으로 실패하면 필요한 명령에 대한 실행 권한을 요청한다.
- [x] **Step 4:** 원본 이미지를 다시 확인해 사진 영역을 측정하고 27개 장소를 작성한다. 실제 지점 좌표는 출처를 확인하고 WGS84로 통일한다. 중국 지도에서 얻은 GCJ-02 좌표를 그대로 Leaflet에 넣지 않는다. 출처가 지역까지만 확인되면 그 지역의 대표 좌표와 `area`를 사용한다. 단일 브랜드의 다른 지점 좌표를 복사하지 않는다.
- [x] **Step 5:** `filterPlaces`와 `createPhoto`를 구현하고 아이보리 배경, 녹색 상단 바, 소개 문구, 장소 목록과 지도 자리의 기본 화면을 만든다. 사진은 Vite가 번들에 포함하는 원본 자산 URL과 CSS 영역으로 표시하고, 로드 실패 시 대체 설명을 보여준다.
- [x] **Step 6:** `npm test`와 `npm run build`를 실행한다. 데이터·검색 테스트 통과와 `dist` 생성, JPG 자산 포함을 확인한다.

## Task 2: 일정 모델과 복원·저장

**Files:** Create `src/itinerary.js`, `src/storage.js`, `tests/itinerary.test.js`, `tests/storage.test.js`.

**Interfaces:**
- Consumes: Task 1의 `places`와 고유 장소 ID.
- Produces: `createExamplePlan(): Plan`, `validatePlan(value, validPlaceIds): Plan | null`, `updatePlan(plan, action): {plan, changed, reason}`.
- `action.type`은 `add-place`, `remove-place`, `move-place`, `add-day`, `remove-day`, `set-date`, `set-note`다. 장소 동작은 `dayId`, `placeId`를 받고 `move-place`는 `direction: -1 | 1`을 받는다. `add-day`는 `newDayId`를 받아 결정적으로 처리한다. 날짜·메모 변경은 `dayId`, `value`를 받는다. 정상 결과의 `reason`은 `null`, 거절 사유는 `duplicate`, `last-day`, `boundary`, `invalid` 중 하나다.
- Produces: `loadPlan(getStorage, validPlaceIds): {plan, status}`, `savePlan(getStorage, plan): {ok, error}`. `getStorage`는 호출 시 저장소 객체를 반환하는 함수다. 키는 `hju-hangzhou-plan-v1`, 로드 상태는 `empty`, `restored`, `invalid`, `unavailable`다. 예외 메시지 원문을 UI에 노출하지 않는다.

- [x] **Step 1:** 초기 세 일차의 방문 순서가 설계서와 일치하는지, 같은 날 중복 추가를 거절하고 다른 날 추가는 허용하는지, 마지막 일차 삭제와 경계 밖 순서 변경을 거절하는지 테스트한다. 원본 plan을 변경하지 않는지도 확인한다.

  `example route follows the approved days`는 `assert.deepEqual(createExamplePlan().days.map(d => d.placeIds), [['atour','hubin','west-lake','guyongjin','qinghefang','wulin-night'], ['lingyin','yongfu','taoguang','faxi'], ['wulin-pier','xiaohe','gongchen','wulin-square']])`를 검증한다. `duplicate addition preserves the plan`은 첫 일차에 `atour`를 추가한 결과의 `reason === 'duplicate'`, `changed === false`와 원본·결과 계획의 동등함을 검증한다. `last day cannot be removed`와 `moving beyond a boundary changes nothing`도 각각 반환 사유와 계획 보존을 확인한다.
- [x] **Step 2:** 알 수 없는 장소, 중복 장소·일차 ID, 빈 days, 잘못된 version, `2026-02-30`, 날짜 문자열의 다른 형식, 비문자열 메모를 거절하고, `2028-02-29`와 날짜 미지정은 허용하는 검증 테스트를 작성한다. 저장소 getter·getItem·setItem 각각의 예외와 잘못된 JSON 복원 테스트를 작성한다.

  `invalid calendar dates are not restored`는 날짜를 `2026-02-30`으로 바꾼 계획에 대해 `assert.equal(validatePlan(value, validPlaceIds), null)`을 단언한다. `valid leap days survive restoration`은 `2028-02-29` 복원 결과가 입력과 같음을 단언한다. `storage getter failure returns a usable example`은 예외를 던지는 getter를 전달한 `loadPlan`의 `status === 'unavailable'`과 세 일차 반환을 확인한다. `write failure is reported without mutating the plan`은 `savePlan`의 `ok === false`와 입력 계획 보존을 확인한다. 나머지 잘못된 데이터 사례도 같은 validator의 `null` 반환으로 고정한다.
- [x] **Step 3:** `node --test tests/itinerary.test.js tests/storage.test.js`를 실행해 구현 전 실패를 확인한다.
- [x] **Step 4:** 모델과 저장소 함수를 구현한다. 잘못된 저장 데이터는 전체를 거절하고 새 예시 계획을 반환한다. 초기화는 기존 계획을 덮어쓰기 전에 UI에서 확인하고 `createExamplePlan()`을 사용한다. 저장소 실패에도 현재 메모리의 plan을 유지한다.
- [x] **Step 5:** `npm test`를 실행해 데이터·일정·저장소 테스트를 모두 통과시킨다.

## Task 3: 지도·목록·상세 정보 연결

**Files:** Create `src/map.js`, `src/ui/places.js`. Modify `src/main.js`, `src/styles.css`.

**Interfaces:**
- Consumes: `Place`, `filterPlaces`, `createPhoto`.
- Produces: `createTravelMap(container, {onSelect, onTileError}): {setPlaces(places), selectPlace(placeId), setRoute(places), fitPlaces(), resize()}`.
- Produces: `renderPlaceList(container, places, {selectedId, onSelect})`, `openPlaceDetails(place, {days, selectedDayId, onAdd, onClose})`, `closePlaceDetails()`.
- 상세 패널에서 선택하는 일차는 UI의 선택 일차를 기본값으로 사용하고, 추가 버튼은 `{placeId, dayId}`를 앱에 전달한다.

- [x] **Step 1:** Leaflet 지도와 OSM 타일, 유지되는 저작자 표시, 분류별 마커, `createPhoto`를 쓰는 이름·사진 툴팁을 구현한다. 호버와 focus에서 열리고 클릭·Enter에서 상세 패널을 연다. `tileerror`는 배경 지도 안내만 표시하고 다른 기능은 유지한다.
- [x] **Step 2:** 마커가 겹치면 확인 가능한 그룹 수를 표시하고 클릭 시 확대한다. 충분히 확대해도 겹치는 마커는 선택 가능한 작은 목록을 열어 좌표를 왜곡하지 않고 모든 장소를 선택할 수 있게 한다. 원래 좌표와 화면상의 선택 위치를 혼동하지 않게 한다.
- [x] **Step 3:** 목록과 지도에 동일한 검색·필터 결과를 적용하고 선택 상태를 연결한다. 결과 없음과 전체 초기화를 구현한다. 전체 장소 보기는 현재 필터 결과의 범위를 맞추며, 결과가 비었을 때 잘못된 bounds를 생성하지 않는다.
- [x] **Step 4:** 상세 패널에 중국어 원문, 이미지 기준 평점·가격, 설명, 위치 정밀도와 근거 링크, 중국어 이름으로 찾는 외부 지도 링크, 원본 이미지 보기를 넣는다. 원본 보기는 닫을 수 있는 대화상자에서 제공한다. 현재 영업정보를 만들어 넣지 않는다.
- [x] **Step 5:** Escape와 닫기 버튼, 적절한 대화상자 초점 관리, 실행 요소로의 초점 복귀를 구현한다. 모바일에서 지도·장소·일정 탭을 전환하고 지도가 다시 보일 때 `resize()`로 Leaflet 크기를 갱신한다.
- [x] **Step 6:** 개발 서버를 시작해 실제 브라우저에서 한국어·중국어 검색, 호버·클릭·키보드 선택, 겹친 장소 개별 선택, 좁은 화면 탭 전환을 확인한다. 도구 접근 제한이 있으면 확인하지 못한 항목을 기록한다.

## Task 4: 여행 계획 편집과 지도 동선

**Files:** Create `src/ui/plan.js`. Modify `src/main.js`, `src/styles.css`.

**Interfaces:**
- Consumes: Task 2의 `Plan`, `updatePlan`, `loadPlan`, `savePlan`; Task 3의 `setRoute`와 상세 패널.
- Produces: `renderPlan(container, {plan, selectedDayId, places, onAction, onSelectDay, onSelectPlace, onReset})`.
- `onAction`은 Task 2의 action을 받는다. `onReset`은 사용자가 초기화를 확인한 뒤 호출한다. 저장 결과를 알리는 공용 `announce(message, {error = false} = {})`를 `src/main.js`에서 제공한다.

- [x] **Step 1:** 일차 선택, 날짜 입력, 메모, 번호가 있는 방문 목록, 위·아래 이동, 장소 삭제를 구현한다. 메모 출력은 `textContent` 또는 입력 요소의 `value`를 사용한다. 타이핑 중 전체 입력 DOM을 다시 만들어 초점·커서가 이동하지 않게 한다.
- [x] **Step 2:** 상세 패널의 일정 추가, 일차 추가·삭제, 예시 초기화를 연결한다. 비어 있지 않은 일차 삭제와 전체 초기화는 확인 대화상자를 먼저 열고, 취소 시 plan과 저장소를 수정하지 않는다. 중복 추가 시 해당 일차와 기존 항목을 안내한다.
- [x] **Step 3:** 유효한 변경을 즉시 저장하고 복원·저장 실패를 `aria-live` 영역과 시각 안내에 표시한다. 저장 실패 후에도 현재 편집 내용을 유지한다. 모든 action 후 삭제된 선택 일차·장소를 참조하지 않도록 UI 상태를 갱신한다.
- [x] **Step 4:** 현재 일차의 장소를 번호 마커와 점선으로 연결하고 `방문 순서 · 실제 이동 경로가 아닙니다`를 표시한다. 0개·1개 일정도 표시하고 임의의 이동시간은 넣지 않는다. 다른 탭으로 이동할 때 목록 마커와 일정 마커가 혼동되지 않도록 모드를 동기화한다.
- [x] **Step 5:** 실제 브라우저에서 장소 추가·중복·순서 변경·날짜·메모·삭제 취소·초기화 취소·새로고침 복원을 검증한다. `<img src=x onerror=alert(1)>` 형태의 메모가 실행되지 않고 텍스트로 유지되는지 확인한다.

## Task 5: 시각 검토·전체 검증·실행 안내

**Files:** Create `README.md`. Modify `src/styles.css`와 검증에서 실제 결함이 발견된 파일만 수정한다.

**Interfaces:** 기존 공통 인터페이스를 유지한다.

- [x] **Step 1:** 데스크톱 1440×900과 모바일 390×844 수준에서 화면을 확인한다. 목록·지도·상세·일정 각각의 오버플로, 읽기 크기, 고정 요소 가림, 대화상자 스크롤, 초점 표시와 대비를 수정한다. `prefers-reduced-motion`을 존중한다.
- [x] **Step 2:** 소스 이미지 7장과 화면 사진을 대조해 각 사진 영역을 최종 확인한다. 없는 평점이 표시되지 않고, 원본·대략 위치·예시 일정·직선 동선 안내가 적절한 곳에 있는지 확인한다.
- [x] **Step 3:** 빈 검색 결과, 마지막 일차, 빈 일정, 지도 타일 실패, 잘못된 저장 JSON, 저장소 접근 실패에서도 UI가 열리고 주요 기능이 유지되는지 확인한다. 원본 보기와 상세 패널의 키보드 초점 복귀를 확인한다.
- [x] **Step 4:** `npm test`, `npm run build`를 실행한 뒤 `npm run preview`에서 빌드 결과의 장소 이미지·지도·일정 복원을 확인한다. 콘솔의 오류를 확인하고 필요한 수정 후 관련 검사만 다시 실행한다.
- [x] **Step 5:** README에 `npm install`, `npm run dev`, `npm test`, `npm run build`, `npm run preview`와 사용법을 작성한다. 인터넷 지도 타일, 이미지 기준 평점, 대략 위치, 브라우저별 저장과 예시 일정의 의미를 설명한다.
- [x] **Step 6:** 전체 구현을 검토해 설계서 완료 기준 8개와 대조한다. 실제 수행한 검사와 수행하지 못한 브라우저 검증을 구분해 최종 보고한다. 배포나 외부 계정 작업은 수행하지 않는다.

## 구현 참고 자료

- [Vite 시작하기](https://vite.dev/guide/), [프로덕션 빌드](https://vite.dev/guide/build)
- [Leaflet 1.9.4 레퍼런스](https://leafletjs.com/reference-1.9.4.html), [빠른 시작](https://leafletjs.com/examples/quick-start/)
- 좌표·장소 출처는 실제 확인한 자료를 각 `locationSource`에 기록한다. 런타임에 지오코딩 API를 호출하지 않는다.

## 실행 방식 제안

이 작업은 데이터·일정·지도 UI가 같은 인터페이스를 순서대로 사용하므로, 현재 세션에서 직접 구현하는 방식을 추천한다. 승인 후 `superpowers:executing-plans`를 사용한다. 태스크마다 구현자를 새로 배정하는 방식도 가능하지만 이 규모에서는 문맥 전달 비용이 커진다.

계획 자체의 검토와 실행 방식 선택을 받은 뒤 제품 코드를 작성한다.
