/* 룬PT Path A 화면 덧입힘
 * 트레이너의 index.html이 모든 함수를 정의한 뒤에 로드돼요. 원본 함수는 변수에 보관하고,
 * 같은 이름의 래퍼가 원본 결과(data-act, 숫자, 저장 경로)를 그대로 둔 채 화면만 바꿔요.
 * 원본 구조가 바뀌어 필요한 이름이 없으면 아무것도 하지 않고 원본 화면을 그대로 둬요. */
(function () {
  'use strict';
  // 원본의 const 이름(esc, muTxt 등)은 window 속성이 아니라서 전역 범위에서 typeof로 확인해요.
  var NEED = ['render', 'renderGate', 'viewToday', 'viewMe', 'viewAuth', 'recHTML', 'loadGifts', 'exMus', 'muTxt', 'draft', 'esc', 'ageOk', 'hwOk', 'obBfOk'];
  for (var i = 0; i < NEED.length; i++) {
    if (Function('return typeof ' + NEED[i])() !== 'function') { console.warn('[path-a] ' + NEED[i] + ' 없음: 원본 화면 유지'); return; }
  }
  if (typeof A !== 'object' || typeof VIEWS !== 'object' || typeof MU !== 'object') { console.warn('[path-a] A/VIEWS/MU 없음: 원본 화면 유지'); return; }

  /* ---------- 아이콘 (lucide, stroke 2) ---------- */
  var P = {
    today: '<path d="M17.596 12.768a2 2 0 1 0 2.829-2.829l-1.768-1.767a2 2 0 0 0 2.828-2.829l-2.828-2.828a2 2 0 0 0-2.829 2.828l-1.767-1.768a2 2 0 1 0-2.829 2.829z"/><path d="m2.5 21.5 1.4-1.4"/><path d="m20.1 3.9 1.4-1.4"/><path d="M5.343 21.485a2 2 0 1 0 2.829-2.828l1.767 1.768a2 2 0 1 0 2.829-2.829l-6.364-6.364a2 2 0 1 0-2.829 2.829l1.768 1.767a2 2 0 0 0-2.828 2.829z"/><path d="m9.6 14.4 4.8-4.8"/>',
    cal: '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
    stat: '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
    me: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    acal: '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
    day: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    quest: '<rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/>',
    mem: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    rec: '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>',
    cat: '<path d="M3 6h.01"/><path d="M3 12h.01"/><path d="M3 18h.01"/><path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/>',
    gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/>',
    rotate: '<path d="M16.466 7.5C15.643 4.237 13.952 2 12 2 9.239 2 7 6.477 7 12s2.239 10 5 10c.342 0 .677-.069 1-.2"/><path d="m15.194 13.707 3.814 1.86-1.86 3.814"/><path d="M19 15.57c-1.804.885-4.274 1.43-7 1.43-5.523 0-10-2.239-10-5s4.477-5 10-5c4.838 0 8.873 1.718 9.8 4"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
    moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    auto: '<rect width="20" height="14" x="2" y="3" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/>',
    chat: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
    shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="M12 8v7"/><path d="M8.5 11.5h7"/>',
    prev: '<path d="m15 18-6-6 6-6"/>',
    next: '<path d="m9 18 6-6-6-6"/>'
  };
  function ic(k, cls) {
    return '<svg class="pa-i' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (P[k] || '') + '</svg>';
  }
  var $q = function (s, r) { return (r || document).querySelector(s); };
  var $all = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- 탭: 홈 없이 오늘이 첫 화면, 라벨 통일 ---------- */
  var MEMBER_TABS = [['today', '오늘'], ['cal', '달력'], ['stat', '통계'], ['me', '내 정보']];

  function syncText() {
    var t = '';
    try { t = typeof syLabel === 'function' ? syLabel() : ''; } catch (e) { t = ''; }
    var state = /오류/.test(t) ? 'err' : /실시간 연결됨/.test(t) ? 'ok' : /끊김/.test(t) ? 'warn' : 'idle';
    return { state: state, text: t.replace(/^[^0-9A-Za-z가-힣]+/, '').trim() || '이 기기에 저장돼요' };
  }
  function paChrome() {
    var nav = $q('.nav');
    if (!nav) return;
    if (!$q('.pa-brand', nav)) {
      var b = document.createElement('div');
      b.className = 'pa-brand';
      b.innerHTML = '<span class="pa-mark">' + ic('shield') + '</span><b>룬PT</b>';
      nav.insertBefore(b, nav.firstChild);
      var s = document.createElement('div');
      s.className = 'pa-sync';
      s.setAttribute('role', 'status');
      nav.appendChild(s);
    }
    paSync();
  }
  function paSync() {
    var el = $q('.nav .pa-sync');
    if (!el) return;
    var s = syncText();
    el.dataset.state = s.state;
    el.innerHTML = '<i aria-hidden="true"></i><span>' + esc(s.text) + '</span>';
  }
  function paNav() {
    var nav = $q('#nav');
    if (!nav) return;
    if (S.mode !== 'admin') {
      nav.innerHTML = MEMBER_TABS.map(function (t) {
        var on = tab === t[0];
        return '<button class="' + (on ? 'on' : '') + '" data-act="tab" data-v="' + t[0] + '"' + (on ? ' aria-current="page"' : '') + '>' + ic(t[0]) + '<span>' + t[1] + '</span></button>';
      }).join('');
      return;
    }
    $all('button[data-act="tab"]', nav).forEach(function (b) {
      if (b.querySelector('.pa-i')) return;
      var label = document.createElement('span');
      while (b.firstChild && !(b.firstChild.nodeType === 1 && b.firstChild.classList.contains('mmd'))) label.appendChild(b.firstChild);
      b.insertBefore(label, b.firstChild);
      b.insertAdjacentHTML('afterbegin', ic(b.dataset.v));
      if (b.classList.contains('on')) b.setAttribute('aria-current', 'page');
    });
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
  var TITLE = { '캘린더조회': '달력', '통계분석': '통계', '계정 정보': '내 정보' };
  function paTitles() {
    if (S.mode === 'admin') return;
    $all('#app h1.h1').forEach(function (h) { var t = TITLE[h.textContent.trim()]; if (t) h.textContent = t; });
  }

  if (typeof syStatus === 'function') {
    var baseSyStatus = syStatus;
    syStatus = function () { baseSyStatus.apply(this, arguments); paSync(); };
  }

  /* ---------- 오늘: 선물함·연결 요청을 위로, 근육 카드를 옆에 ---------- */
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
  function chips(m) {
    var c = function (k, cls) { return MU[k] ? '<span class="pa-chip ' + cls + '">' + esc(MU[k][0]) + '</span>' : ''; };
    return m.p.map(function (k) { return c(k, 'hot'); }).join('') + m.s.map(function (k) { return c(k, 'warm'); }).join('');
  }
  function routeIds() {
    var d = draft();
    return d.slots.filter(function (x) { return x && typeof EX === 'object' && EX[x.id] && EX[x.id].part !== 'cardio'; }).map(function (x) { return x.id; });
  }
  function muscleCard() {
    var ids = routeIds();
    if (!ids.length) {
      return '<section class="pn pa-mus"><h2 class="h2">오늘 쓰는 근육</h2><p class="mu">운동을 담으면 주동근과 보조근이 여기 보여요.</p></section>';
    }
    var d = draft(), cur = null;
    for (var i = 0; i < d.slots.length; i++) {
      var x = d.slots[i];
      if (x && ids.indexOf(x.id) >= 0 && x.sets.some(function (s) { return !s.done; })) { cur = x; break; }
    }
    var rows = ids.map(function (id) {
      var m = exMus(id), live = cur && cur.id === id;
      return '<li' + (live ? ' class="live"' : '') + '><div class="pa-mus-name"><b>' + esc(EX[id].name) + '</b>' + (live ? '<span class="pa-badge">진행 중</span>' : '') +
        '</div><div class="mu">주동 ' + esc(muTxt(m.p) || '-') + (m.s.length ? ' · 보조 ' + esc(muTxt(m.s)) : '') + '</div>' +
        '<button class="pa-icon sm" data-act="pa3d" data-ids="' + esc(id) + '" aria-label="' + esc(EX[id].name) + ' 근육을 회전해서 보기">' + ic('rotate') + '</button></li>';
    }).join('');
    return '<section class="pn pa-mus"><div class="row"><h2 class="h2">오늘 쓰는 근육</h2><span class="mu"><span class="mono">' + ids.length + '</span>종목</span></div>' +
      '<div class="pa-chips">' + chips(musUnion(ids)) + '</div>' +
      '<button class="btn ghost pa-3dbtn" data-act="pa3d" data-ids="' + esc(ids.join(',')) + '">' + ic('rotate') + '<span>회전해서 보기</span></button>' +
      '<ul class="pa-mus-list">' + rows + '</ul>' +
      '<p class="pa-legend"><span class="pa-chip hot">주동근</span><span class="pa-chip warm">보조근</span></p></section>';
  }
  function topCards() {
    var lk = typeof lkCard === 'function' ? lkCard() : '';
    var n = (typeof GIFTS !== 'undefined' && GIFTS) ? GIFTS.length : 0;
    setTimeout(function () { loadGifts(false); }, 0);
    return lk + '<button class="btn ghost gbox pa-gifts" data-act="gifts">' + ic('gift') + '<span>선물함 <small class="mu">트레이너가 보낸 루틴</small></span><b class="gcnt mono' + (n ? ' on' : '') + '">' + n + '</b></button>';
  }
  var baseToday = viewToday;
  viewToday = function () {
    var html = baseToday.apply(this, arguments);
    if (typeof ADM === 'object' && ADM.cur) return html;
    html = html.replace('<h1 class="h1">룬PT</h1>', '<h1 class="h1">오늘 운동</h1>');
    return '<div class="pa-today"><div class="pa-main">' + topCards() + html + '</div><aside class="pa-side" aria-label="오늘 쓰는 근육">' + muscleCard() + '</aside></div>';
  };
  VIEWS.today = viewToday;

  var baseLoadGifts = loadGifts;
  loadGifts = function () {
    var before = (GIFTS || []).map(function (g) { return g.id; }).join(',');
    var r = baseLoadGifts.apply(this, arguments);
    return Promise.resolve(r).then(function (v) {
      var after = (GIFTS || []).map(function (g) { return g.id; }).join(',');
      var md = $q('#md');
      if (after !== before && SCR === 'app' && S.mode !== 'admin' && tab === 'today' && !(md && md.classList.contains('on'))) render();
      return v;
    });
  };

  /* ---------- 세트 기록 시트: 근육 이름 옆에 회전해서 보기 ---------- */
  var baseRec = recHTML;
  recHTML = function () {
    var html = baseRec.apply(this, arguments);
    try {
      var x = draft().slots[RC];
      if (!x || !EX[x.id] || EX[x.id].part === 'cardio') return html;
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

  /* ---------- 내 정보: 제목 통일, 티어 요약과 아바타는 여기서만 ---------- */
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

  function ladder() {
    if (typeof embImg !== 'function' || !window.RuneTier) return '';
    var T = window.RuneTier.TIERS || [];
    var items = [];
    for (var t = 1; t < T.length; t++) items.push('<li>' + embImg(t, 40) + '<span>' + esc(T[t]) + '</span></li>');
    return '<figure class="pa-poster"><ol class="pa-ladder">' + items.join('') + '</ol><figcaption>종목마다 세트 기록이 쌓이면 티어와 별이 올라가요.</figcaption></figure>';
  }
  viewAuth = function () {
    return '<div class="pa-auth">' +
      '<header class="pa-auth-top"><div class="pa-brand-inline"><span class="pa-mark">' + ic('shield') + '</span><b>룬PT</b></div>' + themeBtn() + '</header>' +
      '<section class="pa-auth-intro"><h1>오늘 한 세트가 숙련도가 돼요</h1>' +
      '<p>세트를 기록하면 종목별 티어와 별이 쌓이고, 고른 운동이 쓰는 근육을 돌려 볼 수 있어요.</p>' + ladder() + '</section>' +
      '<section class="pn pa-auth-card" aria-labelledby="pa-login-h"><h2 class="h2" id="pa-login-h">로그인 · 계정 만들기</h2>' +
      '<p class="mu">처음이면 계정이 자동으로 만들어져요. 기록은 계정에 저장돼서 기기를 바꿔도 이어져요.</p>' +
      '<button class="btn kk" data-act="login" data-p="카카오">' + ic('chat') + '<span>카카오로 계속하기</span></button>' +
      '<button class="btn ghost" data-act="login" data-p="구글"><span>구글로 계속하기</span></button>' +
      '<p class="mu">카톡 안에서 열었다면 크롬·사파리로 열어 로그인해 주세요.</p>' +
      '<p class="mu">카카오·구글에는 로그인만 맡겨요. 나이, 체중, 부상 기록은 로그인 제공자에게 보내지 않아요.</p>' +
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
  var STEP_OK = [
    function () { return ageOk(); },
    function () { return !!OB.sex; },
    function () { return hwOk() && obBfOk(); },
    function () { return !!OB.exp; },
    function () { return OB.interests.length > 0; },
    function () { return OB.injuries.length > 0; }
  ];
  var STEP_HINT = ['8~90세 사이 만 나이를 입력해 주세요', '성별을 골라 주세요', '키 120~230cm, 체중 25~250kg, 체지방률은 3~60% 또는 빈칸이에요',
    '운동 경력을 골라 주세요', '관심사를 하나 이상 골라 주세요', '해당하는 것을 골라 주세요. 없으면 “없음”을 눌러요'];
  function obUpdate() {
    var nx = $q('#pa-ob-next');
    if (!nx) return;
    var ok = STEP_OK[OBSTEP]();
    nx.disabled = !ok;
    var h = $q('#pa-ob-hint');
    if (h) h.textContent = ok ? '' : STEP_HINT[OBSTEP];
  }
  function paOnboard() {
    var gate = $q('#app .gate');
    if (!gate) return;
    var panels = $all(':scope > .pn', gate);
    if (panels.length !== 6) return;
    if (!OBWAS) OBSTEP = 0;
    gate.classList.add('pa-ob');
    var cnt = $q('#obn', gate);
    if (cnt && cnt.parentNode) cnt.parentNode.textContent = '처음 한 번만 입력해요';
    panels.forEach(function (p, i) { p.hidden = i !== OBSTEP; });
    var go = $q('#obgo'), cancel = $q('[data-act="obcancel"]', gate);
    var last = OBSTEP === 5;
    if (go) { go.hidden = !last; go.textContent = '입력 완료'; }
    var bar = document.createElement('div');
    bar.className = 'pa-ob-bar';
    bar.innerHTML = '<div class="pa-ob-prog"><span class="mono">' + (OBSTEP + 1) + ' / 6</span><div class="pa-track" role="progressbar" aria-valuemin="1" aria-valuemax="6" aria-valuenow="' + (OBSTEP + 1) + '" aria-label="기본 정보 단계"><i style="width:' + ((OBSTEP + 1) / 6 * 100) + '%"></i></div></div>';
    gate.insertBefore(bar, panels[0]);
    var nav = document.createElement('div');
    nav.className = 'pa-ob-nav';
    nav.innerHTML = '<button class="btn ghost" id="pa-ob-prev"' + (OBSTEP === 0 ? ' disabled' : '') + '>' + ic('prev') + '<span>이전</span></button>' +
      (last ? '' : '<button class="btn" id="pa-ob-next"><span>다음</span>' + ic('next') + '</button>');
    var hint = document.createElement('p');
    hint.className = 'mu pa-ob-hint';
    hint.id = 'pa-ob-hint';
    hint.setAttribute('aria-live', 'polite');
    var anchor = go || cancel;
    gate.insertBefore(nav, anchor);
    gate.insertBefore(hint, nav);
    if (go) nav.appendChild(go);
    nav.querySelector('#pa-ob-prev').addEventListener('click', function () { if (OBSTEP > 0) { OBSTEP--; renderGate(); scrollTo(0, 0); } });
    var nx = nav.querySelector('#pa-ob-next');
    if (nx) nx.addEventListener('click', function () { if (STEP_OK[OBSTEP]()) { OBSTEP++; renderGate(); scrollTo(0, 0); } });
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
    var el = document.createElement('div');
    el.className = 'pa-dlg';
    el.innerHTML = '<div class="pa-dlg-box" role="dialog" aria-modal="true" aria-labelledby="pa-dlg-t">' +
      '<header><div><h2 class="h2" id="pa-dlg-t">' + (ids.length > 1 ? '오늘 쓰는 근육' : '이 종목이 쓰는 근육') + '</h2><p class="mu">' + esc(names.join(' · ')) + '</p></div>' +
      '<button class="pa-icon" data-pa="close" aria-label="닫기">' + ic('x') + '</button></header>' +
      '<div class="pa-chips">' + chips(m) + '</div>' +
      '<div class="pa-stage"><div class="pa-stage-msg" role="status">모형을 불러오는 중이에요 <span class="mono">0%</span></div></div>' +
      '<div class="pa-views" role="group" aria-label="보는 방향"><button data-pa="front">앞</button><button data-pa="side">옆</button><button data-pa="back">뒤</button><button data-pa="reset">처음 위치</button></div>' +
      '<p class="pa-attr">BodyParts3D © The Database Center for Life Science, CC BY 4.0. 성인 남성 참고 모형이며 개인 신체나 의학적 소견이 아니에요. 드래그로 돌리고, 휠이나 두 손가락으로 확대해요.</p></div>';
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
      if (v === 'close') closeDlg();
      else if (st.viewer) st.viewer.setView(v);
    });
    DLG = st;
    $q('[data-pa="close"]', el).focus();
    var stage = $q('.pa-stage', el), msg = $q('.pa-stage-msg', el);
    var fail = function () {
      if (DLG !== st) return;
      msg.innerHTML = '모형을 열지 못했어요. 부위 이름은 위에서 볼 수 있어요.';
      msg.classList.add('err');
      $all('.pa-views button', el).forEach(function (b) { b.disabled = true; });
    };
    var base = new URL('./', document.baseURI).href;
    import(base + 'ui/muscle-viewer.js').then(function (mod) {
      if (DLG !== st) return;
      st.viewer = mod.mountViewer(stage, {
        primary: m.p, secondary: m.s, base: base,
        onProgress: function (p) { var s = msg.querySelector('.mono'); if (s) s.textContent = p + '%'; }
      });
      return st.viewer.loaded.then(function () { if (DLG === st) msg.hidden = true; });
    }).catch(fail);
  };

  // 원본 스크립트가 이미 첫 화면을 그렸으니, 바뀐 화면으로 한 번 다시 그려요.
  render();
})();
