/* 룬PT 화면 덧입힘 — design-review/proposed 시안 기준
 * 트레이너의 index.html이 모든 함수를 정의한 뒤에 로드돼요. 원본 함수는 변수에 보관하고,
 * 같은 이름의 래퍼가 원본 결과(data-act, 숫자, 저장 경로)를 그대로 둔 채 화면만 바꿔요.
 * 원본 구조가 바뀌어 필요한 이름이 없으면 아무것도 하지 않고 원본 화면을 그대로 둬요. */
(function () {
  'use strict';
  // 원본의 const 이름(esc, muTxt 등)은 window 속성이 아니라서 전역 범위에서 typeof로 확인해요.
  var NEED = ['render', 'renderGate', 'viewToday', 'viewMe', 'viewAuth', 'recHTML', 'loadGifts', 'exMus', 'muTxt', 'draft', 'esc',
    'ageOk', 'hwOk', 'obBfOk', 'vol', 'pvol', 'fmt'];
  for (var i = 0; i < NEED.length; i++) {
    if (Function('return typeof ' + NEED[i])() !== 'function') { console.warn('[path-a] ' + NEED[i] + ' 없음: 원본 화면 유지'); return; }
  }
  if (typeof A !== 'object' || typeof VIEWS !== 'object' || typeof MU !== 'object') { console.warn('[path-a] A/VIEWS/MU 없음: 원본 화면 유지'); return; }

  var BASE = new URL('./', document.baseURI).href;
  var POSTER = 'ui/muscle-poster.webp';

  /* ---------- 아이콘 (lucide, stroke 2): 버튼 보조용으로만 ---------- */
  var P = {
    rotate: '<path d="M16.466 7.5C15.643 4.237 13.952 2 12 2 9.239 2 7 6.477 7 12s2.239 10 5 10c.342 0 .677-.069 1-.2"/><path d="m15.194 13.707 3.814 1.86-1.86 3.814"/><path d="M19 15.57c-1.804.885-4.274 1.43-7 1.43-5.523 0-10-2.239-10-5s4.477-5 10-5c4.838 0 8.873 1.718 9.8 4"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
    moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    auto: '<rect width="20" height="14" x="2" y="3" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>'
  };
  function ic(k) {
    return '<svg class="pa-i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (P[k] || '') + '</svg>';
  }
  var KAKAO = '<svg class="pa-i" viewBox="0 0 24 24" aria-hidden="true"><path fill="#191919" d="M12 3.5c-5 0-9 3.1-9 7 0 2.5 1.7 4.7 4.2 6l-.9 3.3c-.1.3.3.5.5.3l3.9-2.6c.4 0 .8.1 1.3.1 5 0 9-3.1 9-7s-4-7.1-9-7.1z"/></svg>';
  var GOOGLE = '<svg class="pa-i" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.9a5 5 0 0 1-2.2 3.3v2.7h3.6c2.1-1.9 3.3-4.8 3.3-7.9z"/><path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.7c-1 .7-2.2 1.1-3.7 1.1-2.9 0-5.3-1.9-6.2-4.5H2.1v2.8A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.8 14.2a6.6 6.6 0 0 1 0-4.3V7.1H2.1a11 11 0 0 0 0 9.9l3.7-2.8z"/><path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.2-3.2A11 11 0 0 0 2.1 7.1l3.7 2.8C6.7 7.3 9.1 5.4 12 5.4z"/></svg>';

  var $q = function (s, r) { return (r || document).querySelector(s); };
  var $all = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var LOGO = '<span class="pa-logo"><i aria-hidden="true">룬</i>룬PT</span>';

  /* ---------- 탭: 홈 없이 오늘이 첫 화면, 라벨 통일 ---------- */
  var MEMBER_TABS = [['today', '오늘'], ['cal', '달력'], ['stat', '통계'], ['me', '내 정보']];

  function syncInfo() {
    var t = '';
    try { t = typeof syLabel === 'function' ? syLabel() : ''; } catch (e) { t = ''; }
    var state = /오류/.test(t) ? 'err' : /실시간 연결됨/.test(t) ? 'ok' : /끊김/.test(t) ? 'warn' : 'idle';
    var text = state === 'ok' ? '저장됨' : t.replace(/^[^0-9A-Za-z가-힣]+/, '').trim() || '이 기기에 저장돼요';
    return { state: state, text: text, full: t };
  }
  function syncHTML() {
    var s = syncInfo();
    return '<span class="pa-sync" data-state="' + s.state + '" role="status" title="' + esc(s.full || s.text) + '"><i aria-hidden="true"></i><span>' + esc(s.text) + '</span></span>';
  }
  function giftCount() { return (typeof GIFTS !== 'undefined' && GIFTS) ? GIFTS.length : 0; }
  function paChrome() {
    var nav = $q('.nav');
    if (!nav) return;
    if (!$q('.pa-side-top', nav)) {
      var top = document.createElement('div');
      top.className = 'pa-side-top';
      top.innerHTML = LOGO;
      nav.insertBefore(top, nav.firstChild);
      var foot = document.createElement('div');
      foot.className = 'pa-side-foot';
      nav.appendChild(foot);
    }
    var member = S.mode !== 'admin';
    var n = giftCount();
    $q('.pa-side-foot', nav).innerHTML = (member ? '<button class="pa-side-gifts" data-act="gifts"><span>선물함</span><b class="pa-count' + (n ? ' on' : '') + '">' + n + '</b></button>' : '') + syncHTML();
    var app = $q('#app');
    if (app && !$q(':scope > .pa-top', app)) app.insertAdjacentHTML('afterbegin', '<div class="pa-top">' + LOGO + syncHTML() + '</div>');
  }
  function paSync() {
    $all('.pa-sync').forEach(function (el) { el.outerHTML = syncHTML(); });
  }
  function paNav() {
    var nav = $q('#nav');
    if (!nav || S.mode === 'admin') return;
    nav.innerHTML = MEMBER_TABS.map(function (t) {
      var on = tab === t[0];
      return '<button class="' + (on ? 'on' : '') + '" data-act="tab" data-v="' + t[0] + '"' + (on ? ' aria-current="page"' : '') + '>' + t[1] + '</button>';
    }).join('');
  }
  var TITLE = { '캘린더조회': '달력', '통계분석': '통계', '계정 정보': '내 정보' };
  function paTitles() {
    if (S.mode === 'admin') return;
    $all('#app h1.h1').forEach(function (h) { var t = TITLE[h.textContent.trim()]; if (t) h.textContent = t; });
  }

  var baseRender = render;
  render = function () {
    if (SCR === 'app' && S.mode !== 'admin' && tab === 'home') tab = 'today';
    baseRender.apply(this, arguments);
    var app = SCR === 'app';
    document.body.classList.toggle('pa-app', app);
    document.body.classList.toggle('pa-admin', app && S.mode === 'admin');
    if (app) { paNav(); paChrome(); paTitles(); }
  };

  if (typeof syStatus === 'function') {
    var baseSyStatus = syStatus;
    syStatus = function () { baseSyStatus.apply(this, arguments); paSync(); };
  }

  /* ---------- 근육 데이터: 원본의 세부 근육 분류(MU, exMus)를 그대로 써요 ---------- */
  function musUnion(ids) {
    var p = [], s = [];
    ids.forEach(function (id) {
      var m = exMus(id);
      m.p.forEach(function (k) { if (p.indexOf(k) < 0) p.push(k); });
      m.s.forEach(function (k) { if (s.indexOf(k) < 0) s.push(k); });
    });
    s = s.filter(function (k) { return p.indexOf(k) < 0; });
    return { p: p, s: s };
  }
  function muName(k) { return MU[k] ? MU[k][0] : k; }
  function chips(m) {
    return m.p.map(function (k) { return '<span class="pa-chip hot">' + esc(muName(k)) + '</span>'; }).join('') +
      m.s.map(function (k) { return '<span class="pa-chip">' + esc(muName(k)) + '</span>'; }).join('');
  }
  function isLift(x) { return x && typeof EX === 'object' && EX[x.id] && EX[x.id].part !== 'cardio'; }

  /* ---------- 오늘: 근육 카드(지금 운동) · 볼륨 카드 ---------- */
  function current() {
    var d = draft(), first = null;
    for (var i = 0; i < d.slots.length; i++) {
      var x = d.slots[i];
      if (!isLift(x)) continue;
      if (!first) first = x;
      if (x.sets.some(function (s) { return !s.done; })) return { x: x, live: true };
    }
    return first ? { x: first, live: false } : null;
  }
  function liftIds() { return draft().slots.filter(isLift).map(function (x) { return x.id; }); }
  function muscleCard(inline) {
    var c = current();
    if (!c) {
      return '<section class="pa-card' + (inline ? ' pa-inline-empty' : '') + '"><img class="pa-poster" src="' + POSTER + '" alt="" loading="lazy"><p class="pa-empty">운동을 담으면 그 운동이 쓰는 근육을 여기서 돌려 볼 수 있어요.</p></section>';
    }
    var m = exMus(c.x.id), name = EX[c.x.id].name, ids = liftIds();
    var body = '<div class="pa-card-body"><span class="pa-eyebrow">' + (c.live ? '지금 운동' : '오늘 운동') + '</span>' +
      '<h2 class="pa-card-title">' + esc(name) + '가 쓰는 근육</h2><div class="pa-chips">' + chips(m) + '</div>' +
      '<button class="btn ghost sm pa-3dbtn" data-act="pa3d" data-ids="' + esc(c.x.id) + '" data-all="' + esc(ids.join(',')) + '">' + ic('rotate') + '<span>회전해서 보기</span></button>' +
      (inline ? '' : '<p class="pa-fine">CC BY 4.0 · 교육용. 처음 열 때 모형을 받아요.</p>') + '</div>';
    return '<section class="pa-card' + (inline ? ' pa-inline' : '') + '" aria-label="' + esc(name) + '가 쓰는 근육"><img class="pa-poster" src="' + POSTER + '" alt="" loading="lazy">' + body + '</section>';
  }
  function volumeCard() {
    var d = draft();
    var tv = d.slots.reduce(function (a, x) { return a + (x ? vol(x.sets, x.id) : 0); }, 0);
    var pt = d.slots.reduce(function (a, x) { return a + (x ? pvol(x.sets, x.id) : 0); }, 0);
    var pct = pt > 0 ? Math.min(100, Math.round(tv / pt * 100)) : 0;
    return '<section class="pa-card pa-vol"><span class="pa-eyebrow">완료 볼륨 · 예정 ' + fmt(pt) + 'kg</span><b>' + fmt(tv) + ' kg</b>' +
      '<div class="pa-bar" role="progressbar" aria-label="완료 볼륨" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '"><i style="width:' + pct + '%"></i></div>' +
      '<p class="pa-fine">세트를 완료하면 이 막대가 늘어요.</p></section>';
  }
  function giftsRow() {
    var lk = typeof lkCard === 'function' ? lkCard() : '';
    var n = giftCount();
    setTimeout(function () { loadGifts(false); }, 0);
    return lk + '<button class="btn ghost pa-gifts" data-act="gifts"><span>선물함 <small class="mu">트레이너가 보낸 루틴</small></span><b class="pa-count' + (n ? ' on' : '') + '">' + n + '</b></button>';
  }
  var baseToday = viewToday;
  viewToday = function () {
    var html = baseToday.apply(this, arguments);
    if (typeof ADM === 'object' && ADM.cur) return html;
    html = html.replace('<h1 class="h1">룬PT</h1>', '<h1 class="h1">오늘 운동</h1>');
    var end = html.indexOf('</b> kg</div></div>');
    if (end > 0) {
      end += '</b> kg</div></div>'.length;
      html = html.slice(0, end) + muscleCard(true) + html.slice(end);
    }
    return '<div class="pa-today"><div class="pa-main">' + giftsRow() + html + '</div><aside class="pa-side" aria-label="지금 운동">' + muscleCard(false) + volumeCard() + '</aside></div>';
  };
  VIEWS.today = viewToday;

  var baseLoadGifts = loadGifts;
  loadGifts = function () {
    var before = (GIFTS || []).map(function (g) { return g.id; }).join(',');
    var r = baseLoadGifts.apply(this, arguments);
    return Promise.resolve(r).then(function (v) {
      var after = (GIFTS || []).map(function (g) { return g.id; }).join(',');
      var md = $q('#md');
      if (after !== before && SCR === 'app' && S.mode !== 'admin' && !(md && md.classList.contains('on'))) render();
      return v;
    });
  };

  /* ---------- 세트 기록 시트: 근육 칩과 회전해서 보기 ---------- */
  var baseRec = recHTML;
  recHTML = function () {
    var html = baseRec.apply(this, arguments);
    try {
      var x = draft().slots[RC];
      if (!isLift(x)) return html;
      var m = exMus(x.id);
      if (!m.p.length) return html;
      var anchor = '<button class="x" data-act="close">✕</button></div>';
      var at = html.indexOf(anchor);
      if (at < 0) return html;
      at += anchor.length;
      var row = '<div class="pa-recmus"><div class="pa-chips">' + chips(m) + '</div><button class="btn ghost sm pa-3dbtn" data-act="pa3d" data-ids="' + esc(x.id) + '">' + ic('rotate') + '<span>회전해서 보기</span></button></div>';
      return html.slice(0, at) + row + html.slice(at);
    } catch (e) { return html; }
  };

  /* ---------- 내 정보: 티어 요약과 아바타 ---------- */
  var baseMe = viewMe;
  viewMe = function () {
    var html = baseMe.apply(this, arguments).replace('<h1 class="h1">계정 정보</h1>', '<h1 class="h1">내 정보</h1>');
    var tiers = typeof homeTiers === 'function' ? homeTiers() : '';
    var avatar = '<section class="pn pa-avatar"><div class="row"><h2 class="h2">내 아바타</h2><span class="mu">장착한 장비 단계</span></div>' +
      '<iframe id="avf" class="avf" src="avatar/avatar.html?embed=1" title="내 아바타" loading="lazy"></iframe></section>';
    return html.replace('</h1>', '</h1>' + tiers) + avatar;
  };
  VIEWS.me = viewMe;

  /* ---------- 로그인 ---------- */
  var THEME_NEXT = { auto: 'light', light: 'dark', dark: 'auto' };
  var THEME_NAME = { auto: '기기 설정', light: '라이트', dark: '다크' };
  function themeNow() { try { return typeof themeMode === 'function' ? themeMode() : 'auto'; } catch (e) { return 'auto'; } }
  function themeBtn() {
    var m = themeNow();
    return '<button class="pa-icon" data-act="patheme" aria-label="화면 테마: ' + THEME_NAME[m] + '. 눌러서 ' + THEME_NAME[THEME_NEXT[m]] + '(으)로 바꾸기" title="화면 테마: ' + THEME_NAME[m] + '">' + ic(m) + '</button>';
  }
  A.patheme = function () { A.theme({ v: THEME_NEXT[themeNow()] }); };

  viewAuth = function () {
    return '<div class="pa-auth">' +
      '<header class="pa-auth-top">' + LOGO + themeBtn() + '</header>' +
      '<section class="pa-auth-intro"><h1>오늘 한 세트가<br>숙련도가 돼요</h1>' +
      '<p>루틴을 받고, 세트를 남기고, 종목마다 티어가 쌓여요. 고른 운동이 쓰는 근육은 그 자리에서 돌려 볼 수 있어요.</p>' +
      '<div class="pa-proof"><img src="' + POSTER + '" alt="" loading="lazy"><div><span class="pa-tag">고른 운동의 근육</span>' +
      '<ul><li>세트마다 무게와 횟수를 남겨요</li><li>내 몸 기준으로 티어가 정해져요</li><li>운동마다 쓰는 근육을 3D로 돌려 봐요</li></ul>' +
      '<p class="pa-fine">BodyParts3D © Life Science, CC BY 4.0. 교육용 모형이며 진단이 아니에요.</p></div></div></section>' +
      '<section class="pa-auth-card" aria-labelledby="pa-login-h"><h2 id="pa-login-h">로그인 · 계정 만들기</h2>' +
      '<p>처음이면 계정이 자동으로 만들어져요. 기록은 계정에 저장돼서 기기를 바꿔도 이어져요.</p>' +
      '<button class="btn kk" data-act="login" data-p="카카오">' + KAKAO + '<span>카카오로 시작하기</span></button>' +
      '<button class="btn ghost" data-act="login" data-p="구글">' + GOOGLE + '<span>구글로 시작하기</span></button>' +
      '<p class="pa-note">' + ic('info') + '<span>카톡 안에서 열었다면 크롬·사파리로 열어 로그인해 주세요.</span></p>' +
      '<p>카카오·구글에는 로그인만 맡겨요. 나이, 체중, 부상 기록은 로그인 제공자에게 보내지 않아요.</p>' +
      (typeof sb !== 'undefined' && sb ? '' : '<button class="pa-link" data-act="guest">로그인 없이 미리보기</button>') +
      '</section></div>';
  };

  var baseLogin = A.login;
  A.login = function (d) {
    var b = $q('.pa-auth [data-act="login"][data-p="' + d.p + '"]');
    if (b && typeof sb !== 'undefined' && sb) {
      if (b.getAttribute('aria-busy') === 'true') return;
      $all('.pa-auth [data-act="login"]').forEach(function (x) { x.disabled = true; });
      b.setAttribute('aria-busy', 'true');
      b.innerHTML = '<span>이동 중…</span>';
      setTimeout(function () { if (document.body.contains(b)) render(); }, 8000);
    }
    return baseLogin.apply(this, arguments);
  };

  /* ---------- 온보딩: 한 번에 한 질문 ---------- */
  var OBSTEP = 0, OBWAS = false;
  var STEP = [
    { q: '만 나이를 알려주세요', ok: function () { return ageOk(); }, hint: '8에서 90 사이로 입력해요.' },
    { q: '성별을 알려주세요', ok: function () { return !!OB.sex; }, hint: '하나를 골라 주세요.' },
    { q: '키와 체중을 알려주세요', ok: function () { return hwOk() && obBfOk(); }, hint: '키 120~230cm, 체중 25~250kg, 체지방률은 3~60% 또는 빈칸이에요.' },
    { q: '운동 경력을 알려주세요', ok: function () { return !!OB.exp; }, hint: '하나를 골라 주세요.' },
    { q: '주요 관심사를 골라 주세요', ok: function () { return OB.interests.length > 0; }, hint: '하나 이상 골라 주세요.' },
    { q: '부상·질병 이력이 있나요?', ok: function () { return OB.injuries.length > 0; }, hint: '해당하는 것을 모두 골라요. 없으면 “없음”을 눌러요.' }
  ];
  function obUpdate() {
    var nx = $q('#pa-ob-next');
    if (!nx) return;
    var ok = STEP[OBSTEP].ok();
    nx.disabled = !ok;
    var h = $q('#pa-ob-hint');
    if (h) h.textContent = ok ? '' : STEP[OBSTEP].hint;
  }
  function paOnboard() {
    var gate = $q('#app .gate');
    if (!gate) return;
    var panels = $all(':scope > .pn', gate);
    if (panels.length !== 6) return;
    if (!OBWAS) OBSTEP = 0;
    gate.classList.add('pa-ob');
    panels.forEach(function (p, i) { p.hidden = i !== OBSTEP; });
    var go = $q('#obgo'), cancel = $q('[data-act="obcancel"]', gate);
    var last = OBSTEP === 5;
    var uh = gate.firstElementChild && !gate.firstElementChild.classList.contains('pn') ? gate.firstElementChild : null;
    var sub = uh ? uh.querySelector('.mu:last-child') : null;
    if (uh) uh.hidden = true;
    var head = document.createElement('div');
    head.className = 'pa-ob-head';
    head.innerHTML = '<button type="button" id="pa-ob-prev"' + (OBSTEP === 0 ? ' disabled' : '') + '>이전</button><span>' + (OBSTEP + 1) + ' / 6</span><span></span>';
    var seg = document.createElement('div');
    seg.className = 'pa-seg';
    seg.setAttribute('role', 'progressbar');
    seg.setAttribute('aria-label', '기본 정보 단계');
    seg.setAttribute('aria-valuemin', '1');
    seg.setAttribute('aria-valuemax', '6');
    seg.setAttribute('aria-valuenow', String(OBSTEP + 1));
    seg.innerHTML = [0, 1, 2, 3, 4, 5].map(function (i) { return '<i' + (i <= OBSTEP ? ' class="on"' : '') + '></i>'; }).join('');
    var q = document.createElement('div');
    q.className = 'pa-ob-q';
    q.innerHTML = '<small>처음 한 번만 입력해요</small><h1>' + STEP[OBSTEP].q + '</h1>' + (OBSTEP === 0 && sub ? '<p>' + sub.innerHTML + '</p>' : '');
    gate.insertBefore(head, gate.firstChild);
    gate.insertBefore(q, panels[0]);
    gate.insertBefore(seg, q);
    var hint = document.createElement('p');
    hint.className = 'pa-ob-hint';
    hint.id = 'pa-ob-hint';
    hint.setAttribute('aria-live', 'polite');
    panels[OBSTEP].after(hint);
    var foot = document.createElement('div');
    foot.className = 'pa-ob-foot';
    if (!last) foot.innerHTML = '<button class="btn" id="pa-ob-next">다음</button>';
    gate.appendChild(foot);
    if (go) { go.hidden = !last; go.textContent = '입력 완료'; foot.appendChild(go); }
    if (cancel) foot.appendChild(cancel);
    head.querySelector('#pa-ob-prev').addEventListener('click', function () { if (OBSTEP > 0) { OBSTEP--; renderGate(); scrollTo(0, 0); } });
    var nx = foot.querySelector('#pa-ob-next');
    if (nx) nx.addEventListener('click', function () { if (STEP[OBSTEP].ok()) { OBSTEP++; renderGate(); scrollTo(0, 0); } });
    var first = panels[OBSTEP].querySelector('input');
    if (first && !OBWAS) setTimeout(function () { first.focus(); }, 0);
    panels[OBSTEP].addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && e.target.tagName === 'INPUT' && nx && !nx.disabled) { e.preventDefault(); nx.click(); }
    });
    obUpdate();
  }
  var baseGate = renderGate;
  renderGate = function () {
    baseGate.apply(this, arguments);
    document.body.classList.remove('pa-app', 'pa-admin');
    if (SCR === 'onboard') { paOnboard(); OBWAS = true; } else OBWAS = false;
  };
  if (typeof obRefresh === 'function') {
    var baseObRefresh = obRefresh;
    obRefresh = function () { baseObRefresh.apply(this, arguments); obUpdate(); };
  }

  /* ---------- 근육 3D 다이얼로그 ---------- */
  var DLG = null;
  function closeDlg() {
    if (!DLG) return;
    var d = DLG;
    DLG = null;
    if (d.viewer) d.viewer.dispose();
    d.el.remove();
    document.documentElement.classList.remove('pa-lock');
    document.removeEventListener('keydown', d.onKey, true);
    if (d.back && document.body.contains(d.back)) d.back.focus();
  }
  A.pa3d = function (d) {
    closeDlg();
    var ids = String(d.ids || '').split(',').filter(function (id) { return typeof EX === 'object' && EX[id]; });
    if (!ids.length) return;
    var m = musUnion(ids);
    var names = ids.map(function (id) { return EX[id].name; });
    var list = m.p.map(function (k) { return '<li class="hot">' + esc(muName(k)) + '<span>주동</span></li>'; }).join('') +
      m.s.map(function (k) { return '<li>' + esc(muName(k)) + '<span>보조</span></li>'; }).join('');
    var el = document.createElement('div');
    el.className = 'pa-dlg';
    el.innerHTML = '<div class="pa-dlg-box" role="dialog" aria-modal="true" aria-labelledby="pa-dlg-t">' +
      '<div class="pa-stage"><div class="pa-stage-msg" role="status">모형을 불러오는 중이에요 <span class="mono">0%</span></div>' +
      '<div class="pa-stage-tips" aria-hidden="true"><span>드래그로 회전</span><span>휠·두 손가락으로 확대</span></div></div>' +
      '<div class="pa-dlg-side"><header><div><span class="pa-tag">' + esc(names.join(' · ')) + '</span><h2 id="pa-dlg-t">이 운동이 쓰는 근육</h2>' +
      '<p>보는 방향을 고르면 모형이 그쪽으로 돌아가요. 계정 정보는 이 화면으로 전달되지 않아요.</p></div>' +
      '<button class="pa-icon" data-pa="close" aria-label="닫기">' + ic('x') + '</button></header>' +
      '<div class="pa-views" role="group" aria-label="보는 방향"><button data-pa="front" aria-pressed="false">앞</button><button data-pa="side" aria-pressed="false">옆</button><button data-pa="back" aria-pressed="false">뒤</button><button data-pa="reset" aria-pressed="true">처음 위치</button></div>' +
      '<ul class="pa-mlist">' + list + '</ul>' +
      '<p class="pa-attr">BodyParts3D © The Database Center for Life Science, CC BY 4.0. 성인 남성 참고 모형이며 개인 신체나 의학적 소견이 아니에요.</p></div></div>';
    document.body.appendChild(el);
    document.documentElement.classList.add('pa-lock');
    var st = { el: el, viewer: null, back: document.activeElement };
    st.onKey = function (e) {
      if (e.key === 'Escape') { e.stopPropagation(); closeDlg(); return; }
      if (e.key === 'Tab') {
        var f = $all('button', el).filter(function (b) { return !b.disabled; });
        if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    };
    document.addEventListener('keydown', st.onKey, true);
    el.addEventListener('click', function (e) {
      if (e.target === el) { closeDlg(); return; }
      var b = e.target.closest('[data-pa]');
      if (!b) return;
      e.stopPropagation();
      var v = b.dataset.pa;
      if (v === 'close') { closeDlg(); return; }
      $all('.pa-views button', el).forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      if (st.viewer) st.viewer.setView(v);
    });
    DLG = st;
    $q('[data-pa="close"]', el).focus();
    var stage = $q('.pa-stage', el), msg = $q('.pa-stage-msg', el);
    var fail = function () {
      if (DLG !== st) return;
      msg.innerHTML = '모형을 열지 못했어요. 쓰는 근육은 옆 목록에서 볼 수 있어요.';
      msg.classList.add('err');
      $all('.pa-views button', el).forEach(function (b) { b.disabled = true; });
    };
    import(BASE + 'ui/muscle-viewer.js').then(function (mod) {
      if (DLG !== st) return;
      st.viewer = mod.mountViewer(stage, {
        primary: m.p, secondary: m.s, base: BASE,
        onProgress: function (p) { var s = msg.querySelector('.mono'); if (s) s.textContent = p + '%'; }
      });
      return st.viewer.loaded.then(function () { if (DLG === st) msg.hidden = true; });
    }).catch(fail);
  };

  // 원본 스크립트가 이미 첫 화면을 그렸으니, 바뀐 화면으로 한 번 다시 그려요.
  render();
})();
