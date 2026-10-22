/* 안양 AI·데이터 멘토링 대시보드 — 순수 JavaScript, 외부 통신 없음 */
(function () {
  "use strict";
  var D = window.MD || {};
  var JOBS = D.jobs || [];
  var JOB = {}; JOBS.forEach(function (j) { JOB[j.id] = j; });

  /* ───────── helpers ───────── */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function store(k, v) {
    try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { return null; }
  }
  function tag(t) {
    if (!t || !D.tagLegend || !D.tagLegend[t]) return "";
    return '<span class="tag tag-' + t + '" title="' + esc(D.tagLegend[t].desc) + '">' + esc(D.tagLegend[t].label) + "</span>";
  }
  function itemHtml(it) {
    if (typeof it === "string") return esc(it);
    return esc(it.t) + tag(it.tag);
  }
  function ul(items, cls) {
    return '<ul' + (cls ? ' class="' + cls + '"' : "") + ">" + (items || []).map(function (i) { return "<li>" + itemHtml(i) + "</li>"; }).join("") + "</ul>";
  }
  function toast(msg) {
    var t = $("#toast"); t.textContent = msg; t.classList.add("show");
    clearTimeout(toast._t); toast._t = setTimeout(function () { t.classList.remove("show"); }, 1400);
  }
  function copyText(text) {
    function fallback() {
      var ta = document.createElement("textarea"); ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); toast("복사했어요"); } catch (e) { toast("복사 실패"); }
      document.body.removeChild(ta);
    }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(function () { toast("복사했어요"); }, fallback);
    else fallback();
  }
  function script(label, text) {
    return '<div class="script-label"><span>' + esc(label) + '</span><button class="copy-btn" data-copy="' + esc(text) + '">복사</button></div>' +
      '<div class="script">' + esc(text) + "</div>";
  }
  var ICONS = {
    home: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
    planner: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>',
    prompt: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 10h8"/>',
    analyst: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    llmdev: '<path d="M8 8l-4 4 4 4M16 8l4 4-4 4M13 5l-2 14"/>',
    levels: '<path d="M4 20h4v-6H4zM10 20h4V9h-4zM16 20h4V4h-4z"/>',
    faq: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17.5v.01"/>',
    book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.01"/>',
    network: '<circle cx="5" cy="12" r="2"/><circle cx="12" cy="6" r="2"/><circle cx="12" cy="18" r="2"/><circle cx="19" cy="12" r="2"/><path d="M7 12l3-5M7 12l3 5M14 6l3 5M14 18l3-5"/>',
    loop: '<path d="M17 2l4 4-4 4"/><path d="M3 11V9a3 3 0 0 1 3-3h15"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v2a3 3 0 0 1-3 3H3"/>',
    qr: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 17h4v4h-4"/>'
  };
  function icon(n) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + (ICONS[n] || "") + "</svg>"; }
  function jobIcon(j) { return '<span class="job-icon">' + icon(j.id) + "</span>"; }

  /* ───────── nav ───────── */
  var NAV = [
    { label: "상담", items: [
      { r: "home", t: "홈 / 상담 시작", i: "home" },
      { r: "explore", t: "진로를 모르겠어요", i: "compass", cta: true },
      { r: "survey", t: "대기자 QR 설문", i: "qr" },
      { r: "graduate", t: "대졸자용 QR 설문", i: "qr" },
      { r: "trend", t: "AI 트렌드 4단계", i: "loop" }
    ]},
    { label: "직무별 상담 가이드", items: JOBS.map(function (j) { return { r: "job/" + j.id, t: j.name, dot: j.color }; }) },
    { label: "자료", items: [
      { r: "levels", t: "학생 수준별 조언", i: "levels" },
      { r: "faq", t: "예상 질문 FAQ", i: "faq" },
      { r: "neural", t: "신경망 한눈에 보기", i: "network" },
      { r: "resources", t: "추천 학습 자료", i: "book" },
      { r: "sources", t: "출처·정보 구분", i: "info" }
    ]}
  ];
  function renderNav() {
    $("#nav").innerHTML = NAV.map(function (g) {
      return '<div class="nav-label">' + esc(g.label) + "</div>" + g.items.map(function (it) {
        var lead = it.dot ? '<span class="nav-dot" style="background:var(--' + it.dot + ')"></span>' : icon(it.i);
        return '<a class="nav-link' + (it.cta ? " cta" : "") + '" data-r="' + it.r + '" href="#/' + it.r + '">' + lead + "<span>" + esc(it.t) + "</span></a>";
      }).join("");
    }).join("");
    if (D.event) $("#brandSub").textContent = D.event.dateLabel + " · " + D.event.place;
  }
  function setActiveNav(path) {
    $$(".nav-link").forEach(function (a) {
      var r = a.getAttribute("data-r");
      a.classList.toggle("active", path === r || path.indexOf(r + "/") === 0);
    });
  }

  /* ───────── timer ───────── */
  var T = { dur: 15, start: null, acc: 0 };
  (function loadTimer() {
    try { var s = JSON.parse(store("md-timer") || "null"); if (s && (s.dur === 15 || s.dur === 20)) T = s; } catch (e) {}
  })();
  function saveTimer() { store("md-timer", JSON.stringify(T)); }
  function elapsedMs() { return T.acc + (T.start ? Date.now() - T.start : 0); }
  function timerRunning() { return !!T.start; }
  function fmt(sec) { var s = Math.abs(Math.floor(sec)); return (sec < 0 ? "+" : "") + String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0"); }
  function curStageIdx() {
    var flow = D.flows[T.dur], m = elapsedMs() / 60000;
    for (var i = 0; i < flow.length; i++) if (m < flow[i].to) return i;
    return flow.length - 1;
  }
  function timerStart() { if (!T.start) { T.start = Date.now(); saveTimer(); tick(); } }
  function timerPause() { if (T.start) { T.acc += Date.now() - T.start; T.start = null; saveTimer(); tick(); } }
  function timerReset() { T.start = null; T.acc = 0; saveTimer(); tick(); }
  function timerSetDur(d) { T.dur = d; saveTimer(); tick(); if (route.page === "home") renderTimerCard(); }
  function timerJump(i) {
    var f = D.flows[T.dur][i]; T.acc = f.from * 60000; if (T.start) T.start = Date.now(); saveTimer(); tick();
  }
  function tick() {
    var el = elapsedMs() / 1000, rem = T.dur * 60 - el, idx = curStageIdx(), flow = D.flows[T.dur];
    var started = el > 0;
    var mt = $("#miniTimer");
    $("#mtTime").textContent = fmt(rem);
    $("#mtStage").textContent = started ? flow[idx].title : T.dur + "분 상담 · 대기";
    mt.classList.toggle("running", timerRunning());
    mt.classList.toggle("over", rem < 0);
    var big = $("#timerBig");
    if (big) {
      big.textContent = fmt(rem); big.classList.toggle("over", rem < 0);
      $("#timerSub").textContent = !started ? "시작 버튼을 누르면 상담 단계가 표시됩니다" :
        rem < 0 ? "예정 시간을 넘었어요 — 마무리 멘트로 정리하세요" :
        "지금: " + flow[idx].title + " · 다음 단계까지 " + fmt(flow[idx].to * 60 - el);
      $("#timerBar").style.width = Math.min(100, el / (T.dur * 60) * 100) + "%";
      $$("#flowList li").forEach(function (li, i) {
        li.classList.toggle("now", started && i === idx);
        li.classList.toggle("done", started && i < idx);
      });
      var tb = $("#tToggle"); if (tb) tb.textContent = timerRunning() ? "일시정지" : (started ? "계속" : "시작");
    }
  }
  setInterval(tick, 500);

  function renderTimerCard() {
    var box = $("#timerCard"); if (!box) return;
    var flow = D.flows[T.dur];
    box.innerHTML =
      '<div class="card-head"><h2>상담 타이머</h2><div class="seg" role="group" aria-label="상담 시간">' +
      '<button data-dur="15" class="' + (T.dur === 15 ? "on" : "") + '">15분</button><button data-dur="20" class="' + (T.dur === 20 ? "on" : "") + '">20분</button></div></div>' +
      '<div class="timer-big" id="timerBig">' + fmt(T.dur * 60) + '</div><div class="timer-sub" id="timerSub"></div>' +
      '<div class="progress"><i id="timerBar"></i></div>' +
      '<div class="btn-row" style="margin-bottom:10px"><button class="btn primary" id="tToggle">시작</button><button class="btn" id="tReset">초기화</button></div>' +
      '<ol class="flow" id="flowList">' + flow.map(function (f, i) {
        return '<li><span class="fl-time">' + f.from + "~" + f.to + '분</span><div><div class="fl-title">' + esc(f.title) +
          ' <button class="btn sm ghost" data-jump="' + i + '" title="이 단계로 타이머 이동">↳ 이동</button>' +
          (f.link ? ' <a class="btn sm ghost" href="' + f.link + '">' + esc(f.linkLabel) + " →</a>" : "") +
          '</div><div class="fl-hint">' + esc(f.hint) + "</div></div></li>";
      }).join("") + "</ol>" +
      '<p class="small muted" style="margin:8px 0 0">흐름은 참고용이에요. 단계 옆 <b>이동</b>으로 상황에 맞게 건너뛸 수 있습니다.' +
      (T.dur === 20 ? " 20분 상담은 자유 질의응답 시간이 늘어납니다." : "") + "</p>";
    tick();
  }

  /* ───────── search ───────── */
  var INDEX = null;
  function norm(s) { return String(s || "").toLowerCase().replace(/\s+/g, ""); }
  function buildIndex() {
    var idx = [];
    (D.faq || []).forEach(function (f) {
      idx.push({ type: "예상 질문 · " + D.faqCats[f.cat], title: f.q, snip: f.short, route: "#/faq/" + f.id,
        hay: [f.q, (f.kw || []).join(" ")].join(" "), body: f.short + " " + f.detail });
    });
    JOBS.forEach(function (j) {
      idx.push({ type: "직무 가이드", title: j.name + " — 개요", snip: j.oneLine, route: "#/job/" + j.id, hay: j.name + " " + j.aka + " " + j.short, body: j.definition + " " + j.oneLine });
      idx.push({ type: "직무 가이드 · " + j.name, title: "필요 역량·첫 학습: " + j.firstSkill.name, snip: j.firstSkill.why, route: "#/job/" + j.id + "/skills",
        hay: j.name + " 역량 기술 첫 학습 " + j.firstSkill.name, body: j.competencies.items.map(function (i) { return typeof i === "string" ? i : i.t; }).join(" ") });
      idx.push({ type: "직무 가이드 · " + j.name, title: "학습 순서·로드맵", snip: j.levelPath.beginner[0], route: "#/job/" + j.id + "/path",
        hay: j.name + " 로드맵 학습 순서 초급 중급 취준생", body: [].concat(j.levelPath.beginner, j.levelPath.intermediate, j.levelPath.jobseeker).join(" ") });
      j.portfolios.forEach(function (p) {
        idx.push({ type: "포트폴리오 · " + j.name, title: p.title, snip: p.desc, route: "#/job/" + j.id + "/portfolio", hay: p.title + " 포트폴리오 " + j.name, body: p.desc + " " + p.point });
      });
      j.certs.forEach(function (c) {
        idx.push({ type: "자격증 · " + j.name, title: c.name, snip: c.use, route: "#/job/" + j.id + "/certs", hay: c.name + " 자격증 " + c.status, body: c.use + " " + c.limit });
      });
      j.qna.forEach(function (q) {
        idx.push({ type: "직무 Q&A · " + j.name, title: q.q, snip: q.a, route: "#/job/" + j.id + "/qna", hay: q.q + " " + j.name, body: q.a });
      });
      idx.push({ type: "직무 가이드 · " + j.name, title: "면접 어필·자주 하는 실수", snip: j.interview[0], route: "#/job/" + j.id + "/interview", hay: j.name + " 면접 실수", body: j.interview.join(" ") + " " + j.mistakes.join(" ") });
      idx.push({ type: "직무 가이드 · " + j.name, title: "피드백 멘트 (30~60초)", snip: j.scripts[0].text, route: "#/job/" + j.id + "/scripts", hay: j.name + " 멘트 피드백 대본 설명", body: "" });
      idx.push({ type: "직무 가이드 · " + j.name, title: "채용공고 확인 방법", snip: j.postings.keywords.join(", "), route: "#/job/" + j.id + "/courses", hay: j.name + " 채용공고 공고 검색 교육과정 국비", body: j.postings.how.join(" ") + " " + j.courses.items.join(" ") });
      var posting = D.jobPostings.cases[j.id];
      if (posting) idx.push({ type: "실제 채용공고 · " + j.name, title: posting.company + " — " + posting.title, snip: posting.focus, route: "#/job/" + j.id + "/hiring", hay: j.name + " " + posting.company + " " + posting.title + " 실제 채용공고 분석", body: posting.requirements.concat(posting.preferred, posting.prep.map(function (p) { return p.skill + " " + p.learn + " " + p.target; }), [posting.project.title, posting.message]).join(" ") });
    });
    (D.levels || []).forEach(function (l) {
      idx.push({ type: "수준별 조언", title: l.name, snip: l.tagline, route: "#/levels/" + l.id, hay: l.name + " " + l.tagline, body: [].concat(l.check, l.priority, l.notNow, [l.project, l.week]).join(" ") });
    });
    idx.push({ type: "진로 탐색", title: "진로 탐색 시작 (관심 분야가 없을 때)", snip: "질문 5개로 먼저 탐색할 분야 찾기 · 모두 모르겠다면 체험 A·B·C", route: "#/explore", hay: "진로 탐색 모르겠 관심 분야 적성 체험", body: "" });
    (D.explore.experiences || []).forEach(function (e) {
      idx.push({ type: "진로 탐색 · 입문 체험", title: e.title, snip: e.desc, route: "#/explore/experiences", hay: e.title + " 체험 " + e.examples.join(" "), body: e.desc });
    });
    idx.push({ type: "자료", title: "국비지원·교육과정 고르는 기준", snip: D.courseCriteria[0], route: "#/resources/criteria", hay: "국비 교육과정 내일배움카드 k-디지털 고용24 학원", body: D.courseCriteria.join(" ") });
    (D.resources || []).forEach(function (g) {
      g.items.forEach(function (r) { idx.push({ type: "학습 자료 · " + g.group, title: r.name, snip: r.desc, route: "#/resources", hay: r.name, body: r.desc }); });
    });
    idx.push({ type: "홈", title: "멘토 자기소개 30초 / 1분", snip: D.mentor.intro30, route: "#/home/intro", hay: "자기소개 소개 멘토 인사", body: "" });
    idx.push({ type: "대기자 설문", title: "대기자 QR 설문 · 학생 결과 대응", snip: D.survey.handoutShort, route: "#/survey", hay: "qr 설문 대기 학생 결과지 공유 공개 큐알", body: D.survey.handout });
    idx.push({ type: "AI 트렌드", title: "AI를 다루는 기술 4단계 (프롬프트·컨텍스트·하네스·루프)", snip: D.trend.say30, route: "#/trend", hay: "트렌드 루프 루프엔지니어링 하네스 컨텍스트 프롬프트 에이전트 agent 4단계", body: D.trend.steer });
    idx.push({ type: "홈", title: "마무리 멘트", snip: D.closings.short, route: "#/home/closing", hay: "마무리 끝 정리 멘트", body: "" });
    idx.push({ type: "홈", title: "상담 시작 질문", snip: D.openers[0].q, route: "#/home/openers", hay: "시작 질문 오프닝 첫 질문", body: "" });
    idx.push({ type: "AI 기초", title: D.neural.title, snip: D.neural.intro, route: "#/neural", hay: "신경망 딥러닝 입력층 은닉층 출력층 가중치 역전파", body: D.neural.flow.join(" ") });
    idx.forEach(function (e) { e.nT = norm(e.title); e.nH = norm(e.hay); e.nB = norm(e.body + " " + e.snip); });
    return idx;
  }
  function bigrams(s) { var out = []; for (var i = 0; i < s.length - 1; i++) out.push(s.substr(i, 2)); return out; }
  function search(q, limit) {
    if (!INDEX) INDEX = buildIndex();
    var nq = norm(q); if (!nq) return [];
    var toks = q.toLowerCase().split(/\s+/).filter(Boolean).map(norm);
    var res = [];
    INDEX.forEach(function (e) {
      var s = 0;
      if (e.nT.indexOf(nq) >= 0) s += 12;
      else if (e.nH.indexOf(nq) >= 0) s += 8;
      else if (e.nB.indexOf(nq) >= 0) s += 4;
      var hit = 0;
      toks.forEach(function (t) {
        if (!t) return;
        if (e.nT.indexOf(t) >= 0) { s += 4; hit++; } else if (e.nH.indexOf(t) >= 0) { s += 3; hit++; } else if (e.nB.indexOf(t) >= 0) { s += 1; hit++; }
      });
      if (toks.length > 1 && hit === toks.length) s += 3;
      if (s === 0 && nq.length >= 3) { /* 한글 부분 일치 보정 */
        var bg = bigrams(nq), m = 0, all = e.nT + e.nH;
        bg.forEach(function (b) { if (all.indexOf(b) >= 0) m++; });
        if (m / bg.length >= 0.6) s = 1 + m / bg.length;
      }
      if (s > 0) res.push({ e: e, s: s });
    });
    res.sort(function (a, b) { return b.s - a.s; });
    return res.slice(0, limit || 50).map(function (r) { return r.e; });
  }
  var spSel = -1, spItems = [];
  function renderPop(q) {
    var pop = $("#searchPop");
    if (!q.trim()) { pop.classList.remove("open"); return; }
    spItems = search(q, 8); spSel = -1;
    pop.innerHTML = (spItems.length ? spItems.map(function (e, i) {
      return '<button class="sp-item" data-i="' + i + '"><div class="sp-type">' + esc(e.type) + '</div><div class="sp-title">' + esc(e.title) + '</div><div class="sp-snip">' + esc(e.snip) + "</div></button>";
    }).join("") : '<div class="sp-foot">결과가 없어요. 다른 단어로 검색해 보세요 (예: 자격증, 포트폴리오, 비전공)</div>') +
      '<div class="sp-foot">Enter: 전체 결과 보기 · ↑↓ 이동 · Esc 닫기</div>';
    pop.classList.add("open");
  }
  function closePop() { $("#searchPop").classList.remove("open"); }
  function bindSearch() {
    var inp = $("#q");
    inp.addEventListener("input", function () { renderPop(inp.value); });
    inp.addEventListener("focus", function () { if (inp.value.trim()) renderPop(inp.value); });
    inp.addEventListener("keydown", function (ev) {
      var items = $$(".sp-item");
      if (ev.key === "ArrowDown" || ev.key === "ArrowUp") {
        ev.preventDefault(); if (!items.length) return;
        spSel = (spSel + (ev.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
        items.forEach(function (b, i) { b.classList.toggle("sel", i === spSel); });
        items[spSel].scrollIntoView({ block: "nearest" });
      } else if (ev.key === "Enter") {
        ev.preventDefault();
        if (spSel >= 0 && spItems[spSel]) go(spItems[spSel].route);
        else if (inp.value.trim()) go("#/search/" + encodeURIComponent(inp.value.trim()));
        closePop(); inp.blur();
      } else if (ev.key === "Escape") { closePop(); inp.blur(); }
    });
    $("#searchPop").addEventListener("mousedown", function (ev) {
      var b = ev.target.closest(".sp-item"); if (!b) return;
      ev.preventDefault(); go(spItems[+b.getAttribute("data-i")].route); closePop(); inp.blur();
    });
    document.addEventListener("click", function (ev) { if (!ev.target.closest(".search-wrap")) closePop(); });
    document.addEventListener("keydown", function (ev) {
      if (ev.key === "/" && !/input|textarea/i.test(document.activeElement.tagName)) { ev.preventDefault(); inp.focus(); inp.select(); }
    });
  }
  function go(h) { if (location.hash === h) onRoute(); else location.hash = h; }

  /* ───────── pages ───────── */
  var route = { page: "home", parts: [] };
  var P = {};

  P.home = function () {
    var m = D.mentor;
    var html =
      '<div class="page-head"><div class="eyebrow">' + esc(D.event.dateLabel + " · " + D.event.place + " · " + D.event.format) + "</div>" +
      "<h1>AI·데이터 멘토링 상담 대시보드</h1><p>" + esc(m.name) + " 멘토 · " + esc(m.role) + "</p></div>" +

      '<div class="cta-hero"><div><h2>아직 관심 분야가 없어요</h2><p>질문 5개, 2~3분이면 먼저 탐색할 분야와 이번 주 실천 과제가 나와요.</p></div>' +
      '<a class="btn" href="#/explore">진로 탐색 시작 →</a></div>' +
      '<div class="card qr-strip"><div><b>기다리는 학생이 있나요?</b> <span class="small muted">' + esc(D.survey.handoutShort) + '</span></div>' +
      '<div class="btn-row"><button class="btn primary sm" data-qr="1">QR 크게 보기</button><a class="btn sm" href="#/survey">설문 대응 가이드</a></div></div>' +

      '<div class="grid g2" style="margin-top:16px">' +
        '<section class="card" id="timerCard"></section>' +
        '<section class="card section" id="intro"><div class="card-head"><h2>멘토 자기소개</h2><div class="seg" id="introSeg"><button data-v="30" class="on">30초</button><button data-v="60">1분</button></div></div>' +
          '<div id="introBox">' + script("30초 버전", m.intro30) + "</div>" +
          '<div style="margin-top:12px"><div class="small muted" style="font-weight:800">소개 팁' + tag("M") + "</div>" + ul(m.introTips, "small") + "</div>" +
          '<details class="acc"><summary>확인된 멘토 배경 (이 외 학위·학교·연수는 말하지 않기)</summary><div class="acc-body">' + ul(m.facts, "small") + "</div></details>" +
        "</section>" +
      "</div>" +

      '<section class="card section" id="trend" style="margin-top:16px"><div class="card-head"><h2>AI 트렌드 · AI를 다루는 기술 4단계</h2><div class="btn-row"><button class="btn primary sm" data-trendbig="1">크게 보기</button><button class="btn sm" data-toggle="trendSay">30초 멘트</button><a class="btn sm" href="#/trend">자세히 →</a></div></div>' +
        trendDiagram() + '<div id="trendSay" hidden style="margin-top:12px">' + script("트렌드 30초", D.trend.say30) + '</div></section>' +
      '<section class="section" id="jobs" style="margin-top:24px"><div class="card-head"><h2>직무별 상담 가이드</h2><span class="small muted">행사 현수막 공식 직무 구분</span></div>' +
      '<div class="grid g4">' + JOBS.map(function (j) {
        var posting = D.jobPostings.cases[j.id];
        return '<div class="card job-card c-' + j.color + '"><div class="jc-name">' + jobIcon(j) + esc(j.name) + "</div>" +
          '<div class="small">' + esc(j.short) + "</div>" +
          '<div class="btn-row" style="margin-top:auto"><a class="btn sm" href="#/job/' + j.id + '">가이드 열기</a>' +
          '<button class="btn sm" data-toggle="js-' + j.id + '">30초 설명</button></div>' +
          (posting ? '<div class="small muted">공고 사례: ' + esc(posting.company) + '</div><a class="btn sm" href="#/job/' + j.id + '/hiring">실제 공고 분석 →</a>' : '') +
          '<div id="js-' + j.id + '" hidden>' + script("참가자에게", j.scripts[0].text) + "</div></div>";
      }).join("") + "</div></section>" +

      hiringOverview() +

      '<div class="grid g2" style="margin-top:16px">' +
        '<section class="card section" id="openers"><h2>상담 시작 질문</h2><ol>' + D.openers.map(function (o) {
          return "<li><b>" + esc(o.q) + '</b><div class="small muted">→ ' + esc(o.why) + "</div></li>";
        }).join("") + '</ol><a class="btn sm" href="#/explore">관심 분야가 없으면 → 진로 탐색</a></section>' +
        '<section class="card"><h2>3~4명 그룹 진행 팁' + tag("M") + "</h2>" + ul(D.groupTips) + "</section>" +
      "</div>" +

      '<div class="grid g2" style="margin-top:16px">' +
        '<section class="card section" id="stories"><h2>현직자 실무 소개 소재' + tag("M") + '</h2><p class="small muted">3~5분 구간용. 본인 경험에 맞게 바꿔 말하세요. 회사 내부 정보는 제외.</p>' +
          D.workStories.map(function (s, i) {
            return '<details class="acc"' + (i === 0 ? " open" : "") + "><summary>" + esc(s.title) + '</summary><div class="acc-body">' + script("이야기", s.text) + "</div></details>";
          }).join("") + "</section>" +
        '<section class="card section" id="closing"><div class="card-head"><h2>마무리 멘트</h2><div class="seg" id="closeSeg"><button data-v="short" class="on">짧게</button><button data-v="long">길게</button></div></div>' +
          '<div id="closeBox">' + script("마무리", D.closings.short) + "</div>" +
          '<div style="margin-top:12px">' + script("실천 과제 확인 질문", D.closings.actionAsk) + "</div></section>" +
      "</div>" +

      '<div class="grid g2" style="margin-top:16px">' +
        '<section class="card"><div class="card-head"><h2>자주 받는 질문</h2><a class="btn sm" href="#/faq">전체 ' + D.faq.length + "개 →</a></div><ul>" +
          ["u1", "u4", "l1", "c2", "c3", "w3", "w2", "c5"].map(function (id) {
            var f = D.faq.filter(function (x) { return x.id === id; })[0];
            return f ? '<li><a href="#/faq/' + f.id + '">' + esc(f.q) + "</a></li>" : "";
          }).join("") + "</ul></section>" +
        '<section class="card"><div class="card-head"><h2>참가자 상황별 조언</h2><a class="btn sm" href="#/levels">전체 →</a></div><div class="btn-row">' +
          D.levels.map(function (l) { return '<a class="btn sm" href="#/levels/' + l.id + '">' + esc(l.name) + "</a>"; }).join("") + "</div></section>" +
      "</div>";
    return html;
  };
  P.home.after = function () {
    renderTimerCard();
    segBind("#introSeg", function (v) { $("#introBox").innerHTML = v === "30" ? script("30초 버전", D.mentor.intro30) : script("1분 버전", D.mentor.intro60); });
    segBind("#closeSeg", function (v) { $("#closeBox").innerHTML = script("마무리", D.closings[v]); });
  };
  function segBind(sel, fn) {
    var seg = $(sel); if (!seg) return;
    seg.addEventListener("click", function (ev) {
      var b = ev.target.closest("button"); if (!b) return;
      $$("button", seg).forEach(function (x) { x.classList.toggle("on", x === b); }); fn(b.getAttribute("data-v"));
    });
  }

  /* ───────── explore ───────── */
  var EX = { step: 0, ans: {} };
  function exOpt(qi, oid) { var q = D.explore.questions[qi]; return q.options.filter(function (o) { return o.id === oid; })[0]; }
  function computeExplore(ans) {
    var E = D.explore, Q = E.questions;
    var scores = { planner: 0, prompt: 0, analyst: 0, llmdev: 0 }, reasons = [], interestPts = 0, interestSignals = 0;
    [0, 1, 2].forEach(function (qi) {
      var o = exOpt(qi, ans[Q[qi].id]); if (!o) return;
      Object.keys(o.points || {}).forEach(function (k) {
        scores[k] += o.points[k];
        reasons.push({ q: Q[qi].title, a: o.label, job: k, pts: o.points[k], why: o.reason });
        if (qi < 2) { interestPts += o.points[k]; interestSignals++; }
      });
    });
    var q1 = exOpt(0, ans.q1), q2 = exOpt(1, ans.q2), q3 = exOpt(2, ans.q3), q4 = exOpt(3, ans.q4), q5 = exOpt(4, ans.q5);
    var q1Job = q1 && Object.keys(q1.points || {})[0], q2Job = q2 && Object.keys(q2.points || {})[0];
    var level = (q3 && q3.level) || "none", size = (q5 && q5.size) || "light", focus = (q4 && q4.focus) || "fit";
    var res = { scores: scores, reasons: reasons, level: level, size: size, focus: focus, q3: q3, q4: q4, q5: q5 };
    if (interestPts === 0) {
      res.mode = "experience";
      res.startExp = { ai: "A", excel: "B", code: "C", project: "C" }[level] || "A";
      return res;
    }
    var order = Object.keys(scores).sort(function (a, b) {
      if (scores[b] !== scores[a]) return scores[b] - scores[a];
      if (a === q2Job) return -1; if (b === q2Job) return 1;
      if (a === q1Job) return -1; if (b === q1Job) return 1;
      return E.tieOrder.indexOf(a) - E.tieOrder.indexOf(b);
    });
    res.mode = "job";
    res.primary = order[0];
    res.tie = scores[order[1]] === scores[order[0]];
    if (scores[order[1]] > 0) { res.secondary = order[1]; res.secondaryReason = "답변 중 이 직무와 연결되는 응답이 있었어요."; }
    else { res.secondary = E.neighbor[res.primary]; res.secondaryReason = "답변 점수는 없지만 인접 직무예요. " + E.neighborReason[res.primary]; }
    res.weak = interestSignals <= 1;
    return res;
  }
  var FOCUS_SEC = { know: "", fit: "", study: "path", portfolio: "portfolio", apply: "courses" };

  P.explore = function () {
    var E = D.explore, Q = E.questions;
    if (route.parts[0] === "experiences" && !EX.started) { EX.started = true; EX.step = Q.length; EX.ans = { q1: "u", q2: "u", q3: "u", q4: "u", q5: "u" }; }
    var head = '<div class="page-head"><div class="eyebrow">진로 미결정자 상담 모드</div><h1>진로 탐색</h1>' +
      "<p>적성 검사가 아니라, 지금 답변을 바탕으로 <b>먼저 탐색할 만한 분야</b>를 찾는 대화 도구입니다. 응답은 이 화면에만 있고 저장·전송되지 않습니다.</p></div>";
    if (!EX.started) {
      return head + '<div class="card stack">' + script("시작 멘트 (참가자에게)", E.mentorScript.start) +
        '<div class="callout"><strong>그룹 진행 팁</strong>' + esc(E.mentorScript.groupTip) + "</div>" +
        '<div class="btn-row"><button class="btn primary" data-ex="begin" style="height:48px;font-size:1.05rem">질문 시작하기 →</button>' +
        '<a class="btn" href="#/explore/experiences" style="height:48px">바로 입문 체험 3가지 보기</a></div></div>' + rulesBox();
    }
    if (EX.step < Q.length) return head + questionView(EX.step);
    return head + resultView(computeExplore(EX.ans));
  };
  function questionView(i) {
    var q = D.explore.questions[i], sel = EX.ans[q.id];
    return '<div class="card"><div class="steps">' + D.explore.questions.map(function (_, k) { return "<i" + (k <= i ? ' class="on"' : "") + "></i>"; }).join("") + "</div>" +
      '<div class="eyebrow">질문 ' + (i + 1) + " / " + D.explore.questions.length + "</div>" +
      '<div class="q-title">' + esc(q.title) + '</div><div class="muted">' + esc(q.help) + "</div>" +
      '<div class="opt-list">' + q.options.map(function (o, k) {
        return '<button class="opt' + (o.unknown ? " unknown" : "") + (sel === o.id ? " sel" : "") + '" data-opt="' + o.id + '"><span class="opt-n">' + (k + 1) + "</span>" + esc(o.label) + "</button>";
      }).join("") + "</div>" +
      '<div class="btn-row"><button class="btn" data-ex="prev">← 이전</button>' +
      (sel ? '<button class="btn" data-ex="next">다음 →</button>' : "") +
      '<button class="btn ghost" data-ex="reset">처음부터</button></div>' +
      '<p class="small muted" style="margin-top:10px">숫자 키 1~' + q.options.length + "로도 선택할 수 있어요.</p></div>";
  }
  function jobLinkFor(id, focus) { var s = FOCUS_SEC[focus]; return "#/job/" + id + (s ? "/" + s : ""); }
  function resultView(r) {
    var E = D.explore, out = "";
    var answers = D.explore.questions.map(function (q, i) {
      var o = exOpt(i, EX.ans[q.id]);
      return "<tr><td>" + esc(q.title) + "</td><td>" + (o ? esc(o.label) : '<span class="muted">미응답</span>') + '</td><td><button class="btn sm ghost" data-goto="' + i + '">수정</button></td></tr>';
    }).join("");
    if (r.mode === "experience") {
      out += '<div class="callout"><strong>흥미 관련 질문(Q1·Q2)에 모두 \'모르겠어요\'를 골랐어요.</strong>그래서 직무를 억지로 추천하지 않고, 일주일 안에 해 볼 수 있는 입문 체험 3가지를 제안합니다.</div>';
      out += '<div class="card" style="margin-top:16px">' + script("참가자에게 (30초)", E.mentorScript.allUnknown) + "</div>";
      var startNote = r.level !== "none" && r.q3 && !r.q3.unknown ? "현재 경험(" + r.q3.label + ")을 보면 <b>체험 " + r.startExp + "</b>부터 시작하면 부담이 적어요." : "경험이 없다면 준비물이 가장 적은 <b>체험 A</b>부터 권해요.";
      out += '<section class="section" id="experiences" style="margin-top:16px"><div class="card-head"><h2>입문 체험 3가지</h2><span class="small">' + startNote + "</span></div>" +
        '<div class="grid g3">' + E.experiences.map(function (x) {
          return '<div class="card exp-card"' + (x.id === r.startExp ? ' style="border-top-color:var(--ok)"' : "") + "><h3>" + esc(x.title) + (x.id === r.startExp ? ' <span class="tag tag-O">먼저 추천</span>' : "") + "</h3>" +
            "<p>" + esc(x.desc) + '</p><dl class="kv"><dt>예시</dt><dd>' + esc(x.examples.join(" · ")) + "</dd><dt>소요 시간</dt><dd>" + esc(x.time) + "</dd><dt>난이도</dt><dd>" + esc(x.level) +
            "</dd><dt>준비물</dt><dd>" + esc(x.prep) + "</dd><dt>결과물</dt><dd>" + esc(x.output) + "</dd><dt>확인 질문</dt><dd>" + esc(x.check) + "</dd></dl>" +
            '<div class="btn-row" style="margin-top:10px">' + x.relates.map(function (id) { return '<a class="btn sm" href="#/job/' + id + '">관련: ' + esc(JOB[id].name) + "</a>"; }).join("") + "</div></div>";
        }).join("") + "</div>" +
        '<div class="callout" style="margin-top:16px"><strong>체험 후</strong>' + esc(E.afterExperience) + "</div></section>";
    } else {
      var J = JOB[r.primary], C = E.cards[r.primary], J2 = JOB[r.secondary], C2 = E.cards[r.secondary];
      var myReasons = r.reasons.filter(function (x) { return x.job === r.primary; });
      out += '<div class="callout"><strong>현재 답변을 바탕으로 먼저 탐색할 만한 분야예요.</strong>확정된 적성 판정이 아닙니다. 체험해 보고 아니면 다른 쪽으로 바꾸면 됩니다.</div>';
      if (r.weak) out += '<div class="callout warn" style="margin-top:8px"><strong>근거가 약한 편</strong>' + esc(E.weakSignalNote) + "</div>";
      out += '<div class="card" style="margin-top:16px">' + script("참가자에게 말할 짧은 설명 (30초)", C.say) + "</div>";
      out += '<div class="grid g2" style="margin-top:16px">' +
        '<section class="card result-main c-' + J.color + '"><div class="rm-label">먼저 체험해 볼 직무</div><h2 style="display:flex;gap:8px;align-items:center">' + jobIcon(J) + esc(J.name) + "</h2>" +
          "<p>" + esc(C.what) + "</p>" +
          '<h3>추천 이유 (답변 근거)</h3><ul class="reason-list">' + myReasons.map(function (x) { return "<li>" + esc(x.why) + ' <span class="muted small">(+' + x.pts + "점: " + esc(x.a) + ")</span></li>"; }).join("") + "</ul>" +
          (r.tie ? '<p class="small muted">함께 탐색 직무와 점수가 같아요. 동점일 때는 Q2(업무 방식) 응답을 우선했어요. 두 직무를 모두 체험해 보길 권하세요.</p>' : "") +
          "<h3>관련 역량</h3>" + C.skills.map(function (s) { return '<span class="chip">' + esc(s) + "</span>"; }).join("") +
          '<h3 style="margin-top:14px">입문자 첫 학습 방법</h3><p>' + esc(C.first[r.level] || C.first.none) + "</p>" +
          "<h3>일주일 실천 과제 <span class=\"small muted\">(" + esc(E.sizeLabel[r.size]) + ")</span></h3><p><b>" + esc(C.week[r.size]) + "</b></p>" +
          '<div class="btn-row"><a class="btn primary" href="' + jobLinkFor(J.id, r.focus) + '">' + esc(J.name) + " 가이드 열기 →</a></div>" +
        "</section>" +
        '<section class="card result-main c-' + J2.color + '"><div class="rm-label">함께 탐색하면 좋은 직무</div><h2 style="display:flex;gap:8px;align-items:center">' + jobIcon(J2) + esc(J2.name) + "</h2>" +
          "<p>" + esc(C2.what) + '</p><p class="small muted">' + esc(r.secondaryReason) + "</p>" +
          "<h3>관련 역량</h3>" + C2.skills.map(function (s) { return '<span class="chip">' + esc(s) + "</span>"; }).join("") +
          '<h3 style="margin-top:14px">가볍게 해 볼 것</h3><p>' + esc(C2.week.light) + "</p>" +
          '<div class="btn-row"><a class="btn" href="#/job/' + J2.id + '">' + esc(J2.name) + " 가이드 →</a></div>" +
        "</section></div>";
      out += '<section class="card" style="margin-top:16px"><h2>멘토용 상세 설명</h2>' +
        "<p>" + esc(E.focusText[r.focus]) + "</p>" + script("결과 안내 멘트", E.mentorScript.resultIntro) +
        '<h3 style="margin-top:14px">직무별 점수</h3><div class="score-bars">' + ["planner", "analyst", "prompt", "llmdev"].map(function (id) {
          var j = JOB[id], max = 5;
          return '<div class="score-row c-' + j.color + '"><span>' + esc(j.name) + '</span><span class="bar"><i style="width:' + (r.scores[id] / max * 100) + '%"></i></span><b>' + r.scores[id] + "</b></div>";
        }).join("") + '</div><p class="small muted" style="margin-top:8px">Q1·Q2 각 +2점, Q3 +1점 (최대 5점). Q4·Q5는 점수에 영향 없음.</p></section>';
    }
    out += '<section class="card" style="margin-top:16px"><h2>응답 요약</h2><div class="tbl-wrap"><table class="tbl"><thead><tr><th>질문</th><th>응답</th><th></th></tr></thead><tbody>' + answers + "</tbody></table></div>" +
      '<div class="btn-row" style="margin-top:12px"><button class="btn" data-ex="prev">← 이전 질문</button><button class="btn primary" data-ex="reset">다음 참가자 (초기화)</button></div></section>';
    out += rulesBox();
    return out;
  }
  function rulesBox() {
    var Q = D.explore.questions;
    return '<details class="acc" style="margin-top:16px"><summary>추천 기준 보기 (투명한 점수표)</summary><div class="acc-body">' +
      '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>질문</th><th>선택지</th><th>점수</th></tr></thead><tbody>' +
      [0, 1, 2].map(function (qi) {
        return Q[qi].options.map(function (o, k) {
          var pts = Object.keys(o.points || {}).map(function (j) { return JOB[j].name + " +" + o.points[j]; }).join(", ") || "—";
          return "<tr>" + (k === 0 ? '<td rowspan="' + Q[qi].options.length + '">' + esc(Q[qi].title) + "</td>" : "") + "<td>" + esc(o.label) + "</td><td>" + esc(pts) + "</td></tr>";
        }).join("");
      }).join("") + "</tbody></table></div>" +
      "<ul class=\"small\"><li>Q4(목표)는 결과 화면에서 어떤 정보를 먼저 연결할지만 정합니다.</li><li>Q5(학습 시간)는 실천 과제 크기만 정합니다.</li>" +
      "<li>동점이면 Q2 응답 직무 → Q1 응답 직무 → 기획자·분석가·프롬프트·개발자 순.</li>" +
      "<li>함께 탐색 직무는 2순위 점수가 0이면 인접 직무로 표시합니다.</li>" +
      "<li>Q1·Q2가 모두 '모르겠어요'면 직무 대신 입문 체험 A·B·C를 제안합니다.</li>" +
      "<li>AI·외부 서비스·숨은 가중치를 쓰지 않습니다. 기준은 data/explore.js에서 수정할 수 있습니다.</li></ul></div></details>";
  }
  P.explore.after = function () {
    var v = $("#view");
    v.onclick = function (ev) {
      var b = ev.target.closest("[data-ex],[data-opt],[data-goto]"); if (!b) return commonClick(ev);
      var Q = D.explore.questions;
      if (b.hasAttribute("data-opt")) {
        EX.ans[Q[EX.step].id] = b.getAttribute("data-opt"); EX.step++; rerender(); return;
      }
      if (b.hasAttribute("data-goto")) { EX.step = +b.getAttribute("data-goto"); rerender(); return; }
      var a = b.getAttribute("data-ex");
      if (a === "begin") { EX.started = true; EX.step = 0; EX.ans = {}; rerender(); }
      if (a === "next") { EX.step++; rerender(); }
      if (a === "prev") { if (EX.step === 0) { EX.started = false; EX.ans = {}; } else EX.step--; rerender(); }
      if (a === "reset") { EX.step = 0; EX.ans = {}; EX.started = false; rerender(); }
    };
    function rerender() {
      if (route.parts[0] === "experiences") { location.hash = "#/explore"; return; }
      onRoute(true);
    }
  };

  /* ───────── job ───────── */
  function hiringOverview() {
    var A = D.jobPostings;
    return '<section class="card section" id="hiring" style="margin-top:24px"><div class="card-head"><h2>실제 채용공고로 보는 4개 직무</h2><span class="small muted">분석 기준일 ' + esc(A.date) + '</span></div><p>' + esc(A.intro) + '</p>' +
      '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>직무·대표 공고</th><th>공고상 경력</th><th>먼저 준비할 것</th><th>상담 자료</th></tr></thead><tbody>' + JOBS.map(function (j) {
        var p = A.cases[j.id];
        return '<tr><th scope="row">' + esc(j.name) + '<div class="small muted">' + esc(p.company) + '</div></th><td>' + esc(p.career) + '</td><td>' + esc(p.focus) + '</td><td><a class="btn sm" href="#/job/' + j.id + '/hiring">분석 보기</a></td></tr>';
      }).join('') + '</tbody></table></div><p class="small muted" style="margin-top:12px">' + esc(A.caution) + '</p><div style="margin-top:12px">' + script('공고를 함께 보며 시작하는 질문', A.question) + '</div></section>';
  }
  function hiringGuide(j) {
    var A = D.jobPostings, p = A.cases[j.id];
    if (!p) return '';
    return '<section class="card section" id="hiring"><div class="card-head"><h2>실제 채용공고 분석' + tag('P') + '</h2><span class="small muted">기준일 ' + esc(A.date) + '</span></div>' +
      '<h3>' + esc(p.company + ' · ' + p.title) + '</h3><dl class="kv"><dt>경력 조건</dt><dd>' + esc(p.career) + '</dd><dt>근무지역</dt><dd>' + esc(p.region) + '</dd><dt>접수·마감</dt><dd>' + esc(p.deadline) + '</dd></dl>' +
      '<div class="btn-row" style="margin:12px 0"><a class="btn primary" href="' + esc(p.url) + '" target="_blank" rel="noopener">원본 공고 보기 · ' + esc(p.source) + '</a>' +
      (p.relatedUrl ? '<a class="btn" href="' + esc(p.relatedUrl) + '" target="_blank" rel="noopener">고용24 연계 공고</a>' : '') + '</div>' +
      '<div class="callout' + (p.verified ? '' : ' warn') + '"><strong>' + (p.verified ? '공고 본문 확인' : '첨부·검색 자료 기준') + '</strong>' + esc(p.verification) + '</div><p style="margin-top:12px">' + esc(p.context) + '</p>' +
      '<div class="grid g2" style="margin-top:16px"><div><h3>' + (p.verified ? '공고에서 확인한 핵심 역량' : '첨부 분석의 핵심 역량') + '</h3>' + ul(p.requirements) + '</div>' +
      '<div><h3>' + (p.verified ? '선호·우대 경험' : '첨부 분석의 우대 경험') + '</h3>' + (p.preferred.length ? ul(p.preferred) : '<p class="small muted">첨부에 별도 우대 목록은 없습니다. 원문 조건을 확인하세요.</p>') + '</div></div>' +
      '<h3 style="margin-top:20px">학생에게 제안할 준비 방법' + tag('M') + '</h3><div class="tbl-wrap"><table class="tbl"><thead><tr><th>준비할 것</th><th>학습·실습 방법</th><th>목표 수준·보여 줄 증거</th></tr></thead><tbody>' + p.prep.map(function (x) {
        return '<tr><th scope="row">' + esc(x.skill) + '</th><td>' + esc(x.learn) + '</td><td>' + esc(x.target) + '</td></tr>';
      }).join('') + '</tbody></table></div><p class="small muted" style="margin-top:8px">이 표의 학습 방법과 목표 수준은 공고를 상담에 활용하기 위한 멘토 권장입니다. 모든 항목이 해당 공고의 필수요건이라는 뜻은 아닙니다.</p>' +
      '<div class="port" style="margin-top:18px"><h3>추천 프로젝트: ' + esc(p.project.title) + '</h3><p>' + esc(p.project.desc) + '</p><h3>남길 결과물</h3>' + ul(p.project.proof) + '<p><b>추천 결과물: ' + esc(p.output) + '</b></p></div>' +
      '<div style="margin-top:18px">' + script('멘토링 핵심 멘트', p.message) + '</div><h3 style="margin-top:18px">공고와 내 경험을 연결하는 질문</h3><p>' + esc(A.question) + '</p><ol>' + p.follow.map(function (q) { return '<li>' + esc(q) + '</li>'; }).join('') + '</ol>' +
      '<div class="callout" style="margin-top:14px"><strong>상담 마무리</strong>' + esc(A.conclusion) + '</div><p class="small muted" style="margin-top:12px">' + esc(A.caution) + '</p><p class="small"><a href="#/home/hiring">4개 직무 공고 비교로 돌아가기 →</a></p></section>';
  }
  function llmRoleGuide() {
    var L = D.llmRoles;
    return '<section class="card section" id="llm-roles"><h2>LLM 응용 개발과 모델 학습은 어떻게 다를까요?</h2><p>' + esc(L.intro) + '</p>' +
      '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>직무</th><th>주요 업무</th><th>모델 튜닝</th></tr></thead><tbody>' + L.roles.map(function (r) {
        return '<tr><th scope="row">' + esc(r.name) + '</th><td>' + esc(r.work) + '</td><td>' + esc(r.tuning) + '</td></tr>';
      }).join('') + '</tbody></table></div><div class="callout" style="margin-top:14px"><strong>로컬 실행과 파인튜닝 구분</strong>' + esc(L.distinction) + '</div>' +
      '<h3 style="margin-top:16px">내가 하고 싶은 일로 구분하기</h3><ul>' + L.roles.map(function (r) { return '<li><b>' + esc(r.want) + '</b> → ' + esc(r.name) + '<div class="small muted">필요 역량: ' + esc(r.skills) + '</div></li>'; }).join('') + '</ul>' +
      '<h3 style="margin-top:16px">실제 서비스 개발 예시</h3><p>' + esc(L.practice) + '</p><p class="small muted">' + esc(L.note) + '</p><p class="small" style="margin-top:10px">개념 참고: ' + L.sources.map(function (s) { return '<a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.label) + '</a>'; }).join(' · ') + '</p></section>';
  }
  var SECS = [
    ["overview", "정의·실제 업무"], ["fit", "이런 사람에게"], ["skills", "필요 역량"], ["path", "학습 순서"],
    ["portfolio", "포트폴리오"], ["certs", "자격증"], ["courses", "교육·채용공고"], ["hiring", "실제 공고 분석"], ["interview", "면접·실수"], ["qna", "예상 Q&A"], ["scripts", "피드백 멘트"]
  ];
  P.job = function () {
    var j = JOB[route.parts[0]]; if (!j) return notFound();
    var sections = j.id === 'llmdev' ? SECS.slice(0, 1).concat([['llm-roles', '모델 학습과 차이']], SECS.slice(1)) : SECS;
    var h = '<div class="c-' + j.color + '">' +
      '<div class="card job-hero"><div class="eyebrow">직무별 상담 가이드</div><h1>' + jobIcon(j) + esc(j.name) + "</h1>" +
      '<p style="font-size:1.08rem"><b>' + esc(j.oneLine) + '</b></p><p class="small muted" style="margin:0">' + esc(j.aka) + "</p>" +
      '<div class="btn-row" style="margin-top:12px">' + j.scripts.map(function (s, i) { return '<button class="btn sm" data-sc="' + i + '">' + esc(s.label) + "</button>"; }).join("") + "</div>" +
      '<div id="scBox" style="margin-top:10px"></div></div>' +
      (j.trendNote ? '<div class="callout warn" style="margin-top:12px"><strong>요즘 흐름 → 루프 엔지니어링' + tag("M") + '</strong>' + esc(j.trendNote) + ' <a href="#/trend">AI 트렌드 4단계 보기 →</a></div>' : "") +
      (D.trend && D.trend.jobsMap[j.id] ? '<p class="small" style="margin:10px 0 0"><b>AI 트렌드 4단계에서 이 직무:</b> ' + esc(D.trend.jobsMap[j.id]) + ' · <a href="#/trend">4단계 보기</a></p>' : "") +
      '<nav class="sec-nav" aria-label="섹션">' + sections.map(function (s) { return '<a href="#/job/' + j.id + "/" + s[0] + '">' + s[1] + "</a>"; }).join("") + "</nav>" +

      '<section class="card section" id="overview"><h2>직무 정의</h2><p>' + esc(j.id === 'llmdev' ? D.llmRoles.intro : j.definition) + "</p>" +
        (j.distinction ? '<div class="callout warn"><strong>독립 직무 vs 다른 직무에 포함된 업무' + tag(j.distinction.tag) + "</strong>" + esc(j.distinction.text) + "</div>" : "") +
        '<h2 style="margin-top:16px">실제 업무 사례' + tag(j.tasks.tag) + "</h2>" + ul(j.tasks.items) + "</section>" +

      (j.id === 'llmdev' ? llmRoleGuide() : '') +

      '<section class="card section" id="fit"><h2>이런 성향·활동에 관심 있다면 탐색해 볼 만해요</h2>' + ul(j.fit) +
        '<p class="small muted" style="margin:0">성향은 참고일 뿐, 맞지 않는다고 못 하는 직무는 아닙니다.</p></section>' +

      '<section class="card section" id="skills"><h2>기업에서 요구하는 역량' + tag(j.competencies.tag) + "</h2>" + ul(j.competencies.items) +
        '<div class="callout warn"><strong>채용공고 관찰' + tag("P") + "</strong>" + esc(j.competencies.posting) + "</div>" +
        '<h2 style="margin-top:16px">가장 먼저 배울 것: ' + esc(j.firstSkill.name) + tag("G") + "</h2><p>" + esc(j.firstSkill.why) + "</p></section>" +

      '<section class="card section" id="path"><h2>수준별 학습 순서' + tag(j.levelPath.tag) + "</h2>" +
        '<div class="grid g3">' + [["beginner", "초급 (입문)"], ["intermediate", "중급"], ["jobseeker", "취준생"]].map(function (x) {
          return '<div class="path-col"><h3>' + x[1] + "</h3>" + ul(j.levelPath[x[0]], "small") + "</div>";
        }).join("") + "</div>" +
        '<h2 style="margin-top:12px">권장 로드맵 (예시 기간 · 개인차 큼)</h2><div class="tbl-wrap"><table class="tbl"><thead><tr><th>기간</th><th>목표</th><th>할 일</th></tr></thead><tbody>' +
        j.roadmap.map(function (r) { return "<tr><td><b>" + esc(r.period) + "</b></td><td>" + esc(r.goal) + "</td><td>" + esc(r.todo) + "</td></tr>"; }).join("") + "</tbody></table></div></section>" +

      '<section class="card section" id="portfolio"><h2>추천 포트폴리오' + tag("G") + '</h2><div class="grid g3">' + j.portfolios.map(function (p) {
        return '<div class="port"><h3>' + esc(p.title) + '</h3><p class="small">' + esc(p.desc) + '</p><dl class="kv"><dt>결과물</dt><dd>' + esc(p.output) + "</dd><dt>포인트</dt><dd>" + esc(p.point) + "</dd></dl></div>";
      }).join("") + "</div></section>" +

      '<section class="card section" id="certs"><h2>도움이 되는 자격증 — 활용도와 한계</h2><div class="tbl-wrap"><table class="tbl"><thead><tr><th>자격증</th><th>구분</th><th>활용도</th><th>한계</th></tr></thead><tbody>' +
        j.certs.map(function (c) { return "<tr><td><b>" + esc(c.name) + "</b>" + tag(c.tag) + "</td><td>" + esc(c.status) + "</td><td>" + esc(c.use) + "</td><td>" + esc(c.limit) + "</td></tr>"; }).join("") +
        "</tbody></table></div>" + (j.certNote ? '<p class="small muted" style="margin-top:8px">' + esc(j.certNote) + "</p>" : "") + "</section>" +

      '<section class="card section" id="courses"><h2>추천 교육과정·학습 자료' + tag(j.courses.tag) + "</h2>" + ul(j.courses.items) +
        '<p class="small"><a href="#/resources/criteria">국비지원 과정 고르는 기준 →</a> · 특정 과정의 모집 여부·비용·취업률은 확인하지 않았으므로 추천하지 않습니다.</p>' +
        '<h2 style="margin-top:16px">채용공고 확인 방법</h2><div>' + j.postings.keywords.map(function (k) { return '<span class="chip">' + esc(k) + "</span>"; }).join("") + "</div>" + ul(j.postings.how) + "</section>" +

      hiringGuide(j) +

      '<section class="card section" id="interview"><div class="grid g2"><div><h2>면접에서 어필할 경험' + tag("M") + "</h2>" + ul(j.interview) + "</div>" +
        "<div><h2>자주 하는 실수" + tag("M") + "</h2>" + ul(j.mistakes) + "</div></div></section>" +

      '<section class="card section" id="qna"><h2>예상 질문·답변</h2>' + j.qna.map(function (q) {
        return '<details class="acc"><summary>' + esc(q.q) + '</summary><div class="acc-body">' + esc(q.a) + "</div></details>";
      }).join("") + '<p class="small" style="margin-top:10px"><a href="#/faq">전체 FAQ에서 더 찾기 →</a></p></section>' +

      '<section class="card section" id="scripts"><h2>멘토용 피드백 멘트 (30~60초)' + tag("M") + '</h2><div class="stack">' +
        j.scripts.map(function (s) { return "<div>" + script(s.label, s.text) + "</div>"; }).join("") + "</div></section>" +
      "</div>";
    return h;
  };
  P.job.after = function () {
    var j = JOB[route.parts[0]]; if (!j) return;
    $$("[data-sc]").forEach(function (b) {
      b.addEventListener("click", function () {
        var i = +b.getAttribute("data-sc"), box = $("#scBox"), on = b.classList.contains("on");
        $$("[data-sc]").forEach(function (x) { x.classList.remove("on"); });
        if (on) { box.innerHTML = ""; return; }
        b.classList.add("on"); box.innerHTML = script(j.scripts[i].label, j.scripts[i].text);
      });
    });
  };

  /* ───────── levels ───────── */
  P.levels = function () {
    var cur = D.levels.filter(function (l) { return l.id === route.parts[0]; })[0] || D.levels[0];
    return '<div class="page-head"><div class="eyebrow">상황별 진로 피드백</div><h1>학생 수준별 조언</h1><p>전공이나 학력만으로 가능성을 단정하지 않습니다. 참가자의 현재 상황을 골라 주세요.</p></div>' +
      '<div class="level-tabs">' + D.levels.map(function (l) { return '<a class="btn sm' + (l.id === cur.id ? " on" : "") + '" href="#/levels/' + l.id + '">' + esc(l.name) + "</a>"; }).join("") + "</div>" +
      '<div class="card"><h2>' + esc(cur.name) + '</h2><p class="muted">' + esc(cur.tagline) + "</p>" + script("참가자에게 (30초)", cur.say) + "</div>" +
      '<div class="grid g2" style="margin-top:16px">' +
        '<section class="card"><h2>현재 단계에서 확인할 사항</h2>' + ul(cur.check) + "</section>" +
        '<section class="card"><h2>우선순위가 높은 준비</h2>' + ul(cur.priority) + "</section>" +
        '<section class="card"><h2>지금 하지 않아도 되는 것</h2>' + ul(cur.notNow) + "</section>" +
        '<section class="card"><h2>주의할 점</h2>' + ul(cur.caution) + "</section>" +
        '<section class="card"><h2>추천 프로젝트</h2><p>' + esc(cur.project) + '</p><h3>학습 자료</h3>' + cur.resources.map(function (r) { return '<span class="chip">' + esc(r) + "</span>"; }).join("") +
          '<p class="small" style="margin-top:8px"><a href="#/resources">자료 링크 보기 →</a></p></section>' +
        '<section class="card" style="border-top:4px solid var(--ok)"><h2>일주일 실천 과제</h2><p style="font-size:1.08rem"><b>' + esc(cur.week) + "</b></p></section>" +
      "</div>" + '<p class="small muted" style="margin-top:12px">구분: 일반 학습 권장' + tag("G") + " + 멘토 조언" + tag("M") + "</p>";
  };

  /* ───────── faq ───────── */
  var FAQ = { cat: "all", q: "" };
  function hl(text, q) {
    var t = esc(text); if (!q) return t;
    q.split(/\s+/).filter(function (w) { return w.length >= 1; }).forEach(function (w) {
      var re = new RegExp("(" + esc(w).replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "gi");
      t = t.replace(re, "<mark>$1</mark>");
    });
    return t;
  }
  function faqList() {
    var list = D.faq.slice();
    if (FAQ.cat !== "all") list = list.filter(function (f) { return f.cat === FAQ.cat; });
    if (FAQ.q.trim()) {
      var hits = search(FAQ.q, 200).filter(function (e) { return e.route.indexOf("#/faq/") === 0; }).map(function (e) { return e.route.slice(6); });
      list = hits.map(function (id) { return list.filter(function (f) { return f.id === id; })[0]; }).filter(Boolean);
    }
    var open = route.parts[0];
    if (!list.length) return '<p class="muted">일치하는 질문이 없어요. 상단 검색창에서 직무·자료까지 함께 찾아보세요.</p>';
    return list.map(function (f) {
      var isOpen = f.id === open || (FAQ.q.trim() && list.length <= 3);
      return '<details class="acc' + (f.id === open ? " hl" : "") + '" id="f-' + f.id + '"' + (isOpen ? " open" : "") + "><summary><span>" + hl(f.q, FAQ.q) +
        ' <span class="chip">' + esc(D.faqCats[f.cat]) + "</span>" + tag(f.tag) + '</span></summary><div class="acc-body">' +
        '<div class="faq-short"><b>현장 답변</b> · ' + hl(f.short, FAQ.q) + '</div><div class="faq-detail">' + hl(f.detail, FAQ.q) + "</div>" +
        '<div style="margin-top:8px"><button class="copy-btn" data-copy="' + esc(f.short) + '">짧은 답변 복사</button></div></div></details>';
    }).join("");
  }
  P.faq = function () {
    var counts = {}; D.faq.forEach(function (f) { counts[f.cat] = (counts[f.cat] || 0) + 1; });
    return '<div class="page-head"><div class="eyebrow">예상 질문·답변 ' + D.faq.length + '개</div><h1>예상 질문 FAQ</h1><p>질문 일부만 입력해도 찾을 수 있어요. 답변은 <b>현장 답변</b>(짧게)과 <b>추가 설명</b>으로 나뉩니다.</p></div>' +
      '<div class="filter-row"><div class="seg" id="faqCat"><button data-v="all" class="' + (FAQ.cat === "all" ? "on" : "") + '">전체</button>' +
      Object.keys(D.faqCats).map(function (k) { return '<button data-v="' + k + '" class="' + (FAQ.cat === k ? "on" : "") + '">' + esc(D.faqCats[k]) + " " + counts[k] + "</button>"; }).join("") + "</div>" +
      '<input id="faqQ" type="search" placeholder="FAQ 안에서 찾기 (예: 자격증)" value="' + esc(FAQ.q) + '" style="height:36px;border-radius:10px;border:1px solid var(--border);background:var(--surface);color:var(--text);padding:0 12px;min-width:220px;flex:1;max-width:360px">' +
      '<button class="btn sm" id="faqOpenAll">모두 펼치기</button></div><div id="faqList">' + faqList() + "</div>";
  };
  P.faq.after = function () {
    segBind("#faqCat", function (v) { FAQ.cat = v; $("#faqList").innerHTML = faqList(); });
    $("#faqQ").addEventListener("input", function (e) { FAQ.q = e.target.value; $("#faqList").innerHTML = faqList(); });
    $("#faqOpenAll").addEventListener("click", function () {
      var all = $$("#faqList details"), anyClosed = all.some(function (d) { return !d.open; });
      all.forEach(function (d) { d.open = anyClosed; }); this.textContent = anyClosed ? "모두 접기" : "모두 펼치기";
    });
    if (route.parts[0]) { var el = $("#f-" + route.parts[0]); if (el) setTimeout(function () { el.scrollIntoView({ block: "center" }); }, 30); }
  };

  /* ───────── resources / sources ───────── */
  function resItem(r) {
    var jobs = r.jobs.indexOf("all") >= 0 ? "전체 직무" : r.jobs.map(function (id) { return JOB[id] ? JOB[id].name : id; }).join(", ");
    return "<tr><td><b>" + (r.url ? '<a href="' + esc(r.url) + '" target="_blank" rel="noopener noreferrer">' + esc(r.name) + "</a>" : esc(r.name)) + "</b>" +
      (r.verified ? tag("O") : ' <span class="tag tag-G">직접 확인 필요</span>') + "</td><td>" + esc(r.desc) + '</td><td class="small">' + esc(jobs) + "</td></tr>";
  }
  P.resources = function () {
    return '<div class="page-head"><div class="eyebrow">' + esc(D.verifiedDate) + ' 링크 확인</div><h1>추천 학습 자료</h1><p>공식·공공 자료 중심입니다. 외부 링크는 새 탭으로 열립니다.</p></div>' +
      D.resources.map(function (g) {
        return '<section class="card"><h2>' + esc(g.group) + '</h2><div class="tbl-wrap"><table class="tbl"><thead><tr><th style="width:32%">자료</th><th>설명</th><th style="width:18%">관련 직무</th></tr></thead><tbody>' +
          g.items.map(resItem).join("") + "</tbody></table></div></section>";
      }).join("") +
      '<section class="card section" id="criteria"><h2>국비지원·교육과정 고르는 기준' + tag("G") + "</h2>" + ul(D.courseCriteria) + "</section>" +
      '<section class="card"><h2>채용공고 관찰 기록' + tag("P") + '</h2><p class="small muted">' + esc(D.postings.note) + '</p><div class="tbl-wrap"><table class="tbl"><thead><tr><th>검색어</th><th>관찰 요약</th><th>자주 보인 태그</th></tr></thead><tbody>' +
        D.postings.searches.map(function (s) {
          return "<tr><td><b>" + esc(s.keyword) + '</b><div class="small muted">' + esc(JOB[s.job].name) + "</div></td><td>" + esc(s.summary) + "</td><td>" + s.tags.map(function (t) { return '<span class="chip">' + esc(t) + "</span>"; }).join("") + "</td></tr>";
        }).join("") + "</tbody></table></div></section>";
  };
  P.resources.after = function () { if (route.parts[0]) { var el = document.getElementById(route.parts[0]); if (el) el.scrollIntoView(); } };
  P.sources = function () {
    return '<div class="page-head"><div class="eyebrow">정확성 원칙</div><h1>출처·정보 구분</h1><p>상담 중 근거를 구분해서 말할 수 있도록 모든 콘텐츠에 정보 구분 표시를 붙였습니다.</p></div>' +
      '<section class="card"><h2>정보 구분 표시</h2><div class="tbl-wrap"><table class="tbl"><tbody>' +
        Object.keys(D.tagLegend).map(function (k) { return "<tr><td>" + tag(k) + "</td><td>" + esc(D.tagLegend[k].desc) + "</td></tr>"; }).join("") + "</tbody></table></div></section>" +
      '<section class="card"><h2>조사 방법과 한계 (' + esc(D.verifiedDate) + ")</h2>" + ul(D.researchLimits) + "</section>" +
      '<section class="card"><h2>확인한 출처 목록</h2><div class="tbl-wrap"><table class="tbl"><tbody>' +
        D.resources.map(function (g) { return g.items.map(resItem).join(""); }).join("") + "</tbody></table></div></section>" +
      '<section class="card"><h2>공개 범위·개인정보</h2><ul>' +
        "<li>이 사이트는 GitHub Pages로 배포되어 <b>URL을 아는 누구나 접근할 수 있습니다.</b> 비공개 서비스가 아닙니다.</li>" +
        "<li><code>noindex</code> 설정은 검색 노출을 줄이기 위한 것일 뿐 접근 제한 수단이 아닙니다.</li>" +
        "<li>진로 탐색 응답·상담 내용은 서버나 외부 분석 도구로 전송되지 않습니다. 화면을 새로 고치면 사라집니다.</li>" +
        "<li>브라우저에는 타이머 상태·글자 크기·테마만 저장됩니다 (이 기기에만).</li>" +
        "<li>회사 내부 정보·비공개 데이터·고객 정보는 포함하지 않습니다.</li></ul></section>";
  };

  P.search = function () {
    var q = decodeURIComponent(route.parts.join("/") || ""); var r = search(q, 60);
    return '<div class="page-head"><div class="eyebrow">검색 결과 ' + r.length + "건</div><h1>‘" + esc(q) + "’ 검색</h1></div>" +
      (r.length ? '<div class="card">' + r.map(function (e) {
        return '<a class="sp-item" style="display:block" href="' + e.route + '"><div class="sp-type">' + esc(e.type) + '</div><div class="sp-title">' + esc(e.title) + '</div><div class="sp-snip">' + esc(e.snip) + "</div></a>";
      }).join("") + "</div>" : '<div class="card"><p>결과가 없어요. 짧은 단어로 다시 검색해 보세요. (예: 자격증, 코딩, 포트폴리오)</p></div>');
  };
  /* ───────── AI 트렌드 4단계 ───────── */
  function trendDiagram() {
    var T = D.trend;
    return '<div class="tl-board" role="img" aria-label="' + esc(T.title + ": " + T.stages.map(function (s) { return s.name; }).join(" → ")) + '">' +
      '<div class="tl-kicker">AI를 다루는 기술의 4단계</div>' +
      '<div class="tl-title">AI를 다루는 기술은 <em>4단계</em>로 진화</div><ol class="tl">' +
      T.stages.map(function (s) {
        return '<li class="tl-step' + (s.now ? " now" : "") + '"><span class="tl-year">' + esc(s.year) + '</span><span class="tl-dot"></span>' +
          '<span class="tl-text"><b class="tl-name">' + esc(s.name) + '</b><span class="tl-line">' + esc(s.line.split(" ").slice(0, 2).join(" ")) + '<br class="tl-br"> ' + esc(s.line.split(" ").slice(2).join(" ")) + '</span></span></li>';
      }).join("") + '</ol><div class="tl-src">' + esc(T.source.label) + '</div></div>';
  }
  function openTrendBig() {
    var o = document.createElement("div"); o.className = "qr-overlay tl-overlay"; o.setAttribute("role", "dialog"); o.setAttribute("aria-label", "AI를 다루는 기술 4단계");
    o.innerHTML = '<div class="tl-big">' + trendDiagram() + '<button class="btn" data-close="1">닫기 (Esc)</button></div>';
    function close() { o.remove(); document.removeEventListener("keydown", esck); window.removeEventListener("hashchange", close); }
    function esck(e) { if (e.key === "Escape") close(); }
    o.addEventListener("click", function (e) { if (e.target === o || e.target.closest("[data-close]")) close(); });
    document.addEventListener("keydown", esck); window.addEventListener("hashchange", close);
    document.body.appendChild(o); o.querySelector("[data-close]").focus();
  }
  P.trend = function () {
    var T = D.trend;
    return '<div class="page-head"><div class="eyebrow">상담 소재 · 멘토 견해' + tag("M") + '</div><h1>AI 트렌드: AI를 다루는 기술 4단계</h1>' +
      '<p>' + esc(T.note) + ' <a href="' + esc(T.source.url) + '" target="_blank" rel="noopener">영상 보기</a></p></div>' +
      '<div class="btn-row" style="margin-bottom:10px"><button class="btn primary" data-trendbig="1">크게 보기 (학생에게 화면 보여주기)</button></div>' +
      trendDiagram() +
      '<div class="grid g2" style="margin-top:16px"><section class="card">' + script("트렌드 설명 30초", T.say30) + '</section>' +
      '<section class="card">' + script("프롬프트 엔지니어 관심 학생 → 루프 엔지니어링으로 안내", T.steer) + '</section></div>' +
      '<section class="card" style="margin-top:16px"><h2>단계별로 쉽게 설명하기 (자기소개서 예시)</h2><div class="tbl-wrap"><table class="tbl"><thead><tr><th style="width:13%">단계</th><th>무엇을 하나</th><th>예시</th><th style="width:22%">사람의 역할</th></tr></thead><tbody>' +
        T.stages.map(function (s) { return '<tr><td><b>' + esc(s.name) + '</b><div class="small muted">' + esc(s.en) + (s.year ? " · " + esc(s.year) : "") + '</div></td><td>' + esc(s.desc) + '</td><td>' + esc(s.ex) + '</td><td>' + esc(s.human) + '</td></tr>'; }).join("") +
      '</tbody></table></div></section>' +
      '<div class="grid g2" style="margin-top:16px">' +
        '<section class="card"><h2>루프 엔지니어링에 필요한 힘</h2>' + ul(T.loopSkills) + '</section>' +
        '<section class="card"><h2>학생이 지금 해 볼 수 있는 것</h2><ol>' + T.start.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + '</ol></section>' +
      '</div>' +
      '<section class="card" style="margin-top:16px"><h2>4개 직무와 연결하기</h2><div class="tbl-wrap"><table class="tbl"><tbody>' +
        JOBS.map(function (j) { return '<tr><td style="width:24%"><a href="#/job/' + j.id + '"><b>' + esc(j.name) + '</b></a></td><td>' + esc(T.jobsMap[j.id]) + '</td></tr>'; }).join("") +
      '</tbody></table></div><div class="callout warn" style="margin-top:12px"><strong>채용공고 관찰' + tag("P") + '</strong>' + esc(T.postingNote) + '</div></section>' +
      '<section class="card" style="margin-top:16px"><h2>참고 영상에서 더 다루는 주제</h2><div>' + T.videoTopics.map(function (t) { return '<span class="chip">' + esc(t) + '</span>'; }).join("") +
        '</div><p class="small muted" style="margin-top:8px">영상 목차 기준입니다. 세부 내용은 영상에서 직접 확인하세요. <a href="' + esc(T.source.url) + '" target="_blank" rel="noopener">' + esc(T.source.label) + '</a></p></section>';
  };

  P.neural = function () {
    var N = D.neural;
    return '<div class="page-head"><div class="eyebrow">AI 기초 개념</div><h1>' + esc(N.title) + '</h1><p>' + esc(N.intro) + '</p></div>' +
      '<section class="card"><figure class="neural-figure"><img class="neural-img" src="assets/img/neural-network-overview.png" alt="' + esc(N.imageAlt) + '"><figcaption class="neural-caption">입력 → 은닉층 → 출력, 그리고 오차를 이용해 가중치를 조정하는 역전파의 흐름</figcaption></figure></section>' +
      '<div class="grid g3" style="margin-top:16px">' + N.layers.map(function (layer) {
        return '<section class="card"><h2>' + esc(layer.name) + '</h2><p>' + esc(layer.desc) + '</p></section>';
      }).join("") + '</div>' +
      '<section class="card" style="margin-top:16px"><h2>그림을 읽는 순서</h2><ol>' + N.flow.map(function (step) { return '<li>' + esc(step) + '</li>'; }).join("") + '</ol></section>' +
      '<div class="grid g2" style="margin-top:16px"><section class="card"><h2>학생에게 30초로 설명하기</h2>' + script("설명 멘트", N.say30) + '</section>' +
      '<section class="card"><h2>꼭 짚을 점</h2><p>' + esc(N.note) + '</p><p class="small muted" style="margin-top:10px">신경망은 ChatGPT 같은 생성형 AI의 기반이 되는 딥러닝 모델을 이해하는 출발점이에요.</p></section></div>';
  };

  /* ───────── 대기자 설문 (멘토 전용) ───────── */
  function openQR(kind) {
    var S = kind === "graduate" ? D.survey.graduate : D.survey;
    var o = document.createElement("div"); o.className = "qr-overlay"; o.setAttribute("role", "dialog"); o.setAttribute("aria-label", "설문 QR 코드");
    o.innerHTML = '<div class="qr-box">' + (kind === "graduate" ? '<div class="qr-title">대졸자용 AI·데이터 커리어 탐색</div>' : '') + '<div class="qr-img">' + S.qrSvg + '</div>' +
      '<div class="qr-url">' + esc(S.url.replace("https://", "")) + '</div><div class="qr-sub">결과 맨 아래 카드를 멘토에게 보여 주세요</div>' +
      '<button class="btn" data-close="1">닫기 (Esc)</button></div>';
    function close() { o.remove(); document.removeEventListener("keydown", esck); }
    function esck(e) { if (e.key === "Escape") close(); }
    o.addEventListener("click", function (e) { if (e.target === o || e.target.closest("[data-close]")) close(); });
    document.addEventListener("keydown", esck);
    document.body.appendChild(o); o.querySelector("[data-close]").focus();
  }
  P.graduate = function () {
    var S = D.survey.graduate;
    return '<div class="page-head"><div class="eyebrow">대졸자 · 졸업예정자 · 커리어 전환 준비</div><h1>대졸자용 QR 설문</h1><p>전공·경험·보유 역량·목표를 확인하는 8개 질문으로, 4개 직무의 맞춤 실천 계획을 안내합니다.</p></div>' +
      '<div class="grid g2"><section class="card"><h2>대졸자용 페이지 공유</h2><div class="qr-inline">' + S.qrSvg + '</div><p class="small" style="margin-top:10px;word-break:break-all"><a href="' + S.url + '" target="_blank" rel="noopener">' + S.url + '</a></p><div class="btn-row"><button class="btn primary" data-qr="graduate">QR 크게 보기</button><button class="btn" data-copy="' + S.url + '">링크 복사</button><a class="btn" href="' + S.url + '" target="_blank" rel="noopener">대졸자 화면 열기</a></div></section>' +
      '<section class="card"><h2>상담 이어가기</h2><ol><li>추천 분야와 원래 희망 직무가 일치하는지 확인합니다.</li><li>전공·실습·프로젝트에서 본인이 직접 한 일을 묻습니다.</li><li>역량 점검에서 빠진 항목 하나를 우선 과제로 고릅니다.</li><li>4주 계획의 첫 과제와 포트폴리오 증거를 합의합니다.</li></ol><p class="small muted">전공은 직무 추천을 제한하지 않습니다. 결과는 자기보고 답변과 멘토의 탐색 규칙에 따른 안내이며, 채용 가능성 평가가 아닙니다.</p></section></div>' +
      '<section class="card" style="margin-top:16px"><h2>4개 직무로 이어가기</h2><div class="btn-row">' + JOBS.map(function (j) { return '<a class="btn" href="#/job/' + j.id + '">' + esc(j.name) + '</a>'; }).join('') + '</div><p class="small muted" style="margin-top:12px">학생용 2분 설문은 기존 주소에 유지됩니다. <a href="#/survey">고등학생용 QR 설문 보기 →</a></p></section>';
  };
  P.survey = function () {
    var S = D.survey, cur = route.parts[0] || "planner";
    var tname = function (id) { return id === "explore" ? "탐색 시작형 (모두 모르겠음)" : JOB[id].name; };
    var t = S.types.filter(function (x) { return x.id === cur; })[0] || S.types[0];
    var say = t.id === "explore" ? D.explore.mentorScript.allUnknown : D.explore.cards[t.id].say;
    var faqById = {}; D.faq.forEach(function (f) { faqById[f.id] = f; });
    return '<div class="page-head"><div class="eyebrow">멘토 전용 · 학생에게는 QR만 보여 주세요</div><h1>대기자 QR 설문</h1>' +
      '<p>한 명과 상담하는 동안 나머지 학생은 휴대폰으로 2분 설문 → 결과지를 읽으며 기다립니다. 설문 기준은 \'진로 탐색\'과 같습니다.</p></div>' +
      '<div class="grid g2">' +
        '<section class="card"><div class="card-head"><h2>공유하기</h2><span class="tag tag-P">공개 페이지</span></div>' +
          '<div class="qr-inline">' + S.qrSvg + '</div>' +
          '<p class="small" style="margin-top:8px;word-break:break-all"><a href="' + esc(S.url) + '" target="_blank" rel="noopener">' + esc(S.url) + '</a></p>' +
          '<div class="btn-row"><button class="btn primary" data-qr="1">QR 크게 보기</button><button class="btn" data-copy="' + esc(S.url) + '">링크 복사</button><a class="btn" href="' + esc(S.url) + '" target="_blank" rel="noopener">학생 화면 미리보기</a></div>' +
          '<p class="small muted" style="margin-top:8px">공개 페이지에는 이 대시보드 링크가 없습니다. 다만 주소를 아는 누구나 두 페이지 모두 열 수 있습니다.</p></section>' +
        '<section class="card"><h2>안내 멘트</h2>' + script("기다리는 학생에게", S.handout) + '<h3 style="margin-top:14px">운영 방법' + tag("M") + '</h3>' + ul(S.howTo, "small") + '</section>' +
      '</div>' +
      '<section class="card" style="margin-top:16px"><div class="card-head"><h2>학생 결과 유형별 대응</h2><span class="small muted">학생 카드의 \'먼저 알아볼 분야\'를 고르세요</span></div>' +
        '<div class="level-tabs">' + S.types.map(function (x) { return '<a class="btn sm' + (x.id === t.id ? " on" : "") + '" href="#/survey/' + x.id + '">' + esc(tname(x.id)) + '</a>'; }).join("") + '</div>' +
        '<div class="grid g2"><div>' + script("30초 이어가기 멘트", say) + '</div><div><h3>이어서 물어볼 질문</h3><ol>' + t.follow.map(function (q) { return "<li>" + esc(q) + "</li>"; }).join("") + '</ol>' +
        (t.id === "explore" ? '<a class="btn sm" href="#/explore/experiences">입문 체험 A·B·C 자세히 →</a>' : '<a class="btn sm" href="#/job/' + t.id + '">' + esc(JOB[t.id].name) + ' 가이드 →</a> <a class="btn sm" href="#/levels/vocational">특성화고 조언 →</a>') +
        '</div></div></section>' +
      '<section class="card" style="margin-top:16px"><h2>졸업 후 계획별 대응' + tag("G") + tag("M") + '</h2><div class="grid g2">' +
        S.plans.map(function (p) { return '<div><h3>' + esc(p.label) + '</h3>' + script(p.label, p.say) + '<ul class="small" style="margin-top:6px">' + p.check.map(function (c) { return "<li>" + esc(c) + "</li>"; }).join("") + '</ul></div>'; }).join("") +
      '</div></section>' +
      '<section class="card" style="margin-top:16px"><h2>학생이 고른 \'궁금한 것\' → 바로 답하기</h2><div class="tbl-wrap"><table class="tbl"><thead><tr><th>학생 카드 표시</th><th>FAQ</th></tr></thead><tbody>' +
        S.topics.map(function (tp) { return "<tr><td><b>" + esc(tp.label) + "</b></td><td>" + tp.faq.map(function (id) { var f = faqById[id]; return f ? '<a href="#/faq/' + id + '">' + esc(f.q) + "</a>" : ""; }).join("<br>") + "</td></tr>"; }).join("") +
      '</tbody></table></div></section>';
  };

  function notFound() { return '<div class="card"><h1>페이지를 찾을 수 없어요</h1><p><a href="#/home">홈으로 이동</a></p></div>'; }

  /* ───────── router ───────── */
  function parseHash() {
    var h = location.hash.replace(/^#\/?/, ""); var parts = h.split("/").filter(Boolean);
    return { page: parts[0] || "home", parts: parts.slice(1), path: parts.join("/") || "home" };
  }
  function commonClick(ev) {
    var qb = ev.target.closest("[data-qr]"); if (qb) { openQR(qb.getAttribute("data-qr")); return; }
    var tb = ev.target.closest("[data-trendbig]"); if (tb) { openTrendBig(); return; }
    var c = ev.target.closest("[data-copy]"); if (c) { copyText(c.getAttribute("data-copy")); return; }
    var t = ev.target.closest("[data-toggle]"); if (t) { var el = document.getElementById(t.getAttribute("data-toggle")); el.hidden = !el.hidden; t.classList.toggle("on", !el.hidden); return; }
    var d = ev.target.closest("[data-dur]"); if (d) { timerSetDur(+d.getAttribute("data-dur")); return; }
    var jmp = ev.target.closest("[data-jump]"); if (jmp) { timerJump(+jmp.getAttribute("data-jump")); toast("타이머를 이 단계로 옮겼어요"); return; }
    if (ev.target.closest("#tToggle")) { timerRunning() ? timerPause() : timerStart(); return; }
    if (ev.target.closest("#tReset")) { timerReset(); return; }
  }
  var lastPage = null;
  function onRoute(keepScroll) {
    var r = parseHash();
    if (r.page === "job" && !r.parts.length) r.parts = [JOBS[0].id];
    var samePage = lastPage === r.page + "/" + (r.page === "job" ? r.parts[0] : "");
    route = r;
    var fn = P[r.page] || notFound;
    var v = $("#view");
    v.onclick = commonClick;
    v.innerHTML = fn();
    if (fn.after) fn.after();
    setActiveNav(r.page === "job" ? "job/" + r.parts[0] : r.page);
    closeMenu();
    var sec = (r.page === "job" || r.page === "home") ? r.parts[r.page === "job" ? 1 : 0] : (r.page === "explore" && r.parts[0] === "experiences" ? "experiences" : null);
    if (sec && document.getElementById(sec)) document.getElementById(sec).scrollIntoView({ block: "start" });
    else if (!keepScroll && !(r.page === "faq" && r.parts[0])) window.scrollTo(0, 0);
    else if (keepScroll && r.page === "explore") window.scrollTo(0, 0);
    document.title = (titleFor(r) ? titleFor(r) + " · " : "") + "AI·데이터 멘토링 대시보드";
    lastPage = r.page + "/" + (r.page === "job" ? r.parts[0] : "");
    tick();
    void samePage;
  }
  function titleFor(r) {
    return { home: "", trend: "AI 트렌드 4단계", neural: "신경망 한눈에 보기", survey: "대기자 QR 설문", graduate: "대졸자용 QR 설문", explore: "진로 탐색", levels: "수준별 조언", faq: "FAQ", resources: "학습 자료", sources: "출처", search: "검색" }[r.page] ||
      (r.page === "job" && JOB[r.parts[0]] ? JOB[r.parts[0]].name : "");
  }

  /* ───────── chrome ───────── */
  function closeMenu() { $("#sidebar").classList.remove("open"); $("#scrim").classList.remove("open"); }
  function bindChrome() {
    $("#menuBtn").addEventListener("click", function () { $("#sidebar").classList.add("open"); $("#scrim").classList.add("open"); });
    $("#scrim").addEventListener("click", closeMenu);
    $("#miniTimer").addEventListener("click", function () { go("#/home"); });
    $("#themeBtn").addEventListener("click", function () {
      var cur = document.documentElement.getAttribute("data-theme");
      var dark = cur ? cur === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
      var next = dark ? "light" : "dark"; document.documentElement.setAttribute("data-theme", next); store("md-theme", next);
    });
    var sizes = [16, 17, 18, 15];
    $("#fsBtn").addEventListener("click", function () {
      var cur = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--fs"), 10) || 16;
      var next = sizes[(sizes.indexOf(cur) + 1) % sizes.length];
      document.documentElement.style.setProperty("--fs", next + "px"); store("md-fs", String(next)); toast("글자 크기 " + next + "px");
    });
    document.addEventListener("keydown", function (ev) {
      if (route.page !== "explore" || /input|textarea/i.test(document.activeElement.tagName)) return;
      var n = parseInt(ev.key, 10); if (!n) return;
      var btns = $$(".opt"); if (btns[n - 1]) btns[n - 1].click();
    });
  }

  renderNav(); bindChrome(); bindSearch();
  window.addEventListener("hashchange", function () { onRoute(); });
  onRoute();

  /* 오프라인 캐시 (https/http에서만, file://에서는 생략) */
  if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener("load", function () { navigator.serviceWorker.register("sw.js").catch(function () {}); });
  }
  window.__MD_TEST__ = { computeExplore: computeExplore, search: search };
})();
