/* 오프라인 대비 캐시: 네트워크 우선, 실패 시 캐시 사용 (행사 직전 수정 내용이 바로 반영되도록) */
var CACHE = "md-mentor-v9";
var FILES = ["./", "index.html", "assets/css/style.css", "assets/js/app.js",
  "assets/img/neural-network-overview.png", "data/mentor.js", "data/jobs.js", "data/explore.js", "data/levels.js", "data/faq.js", "data/resources.js", "data/survey.js", "data/trend.js", "data/neural.js", "data/llm-roles.js", "data/job-postings.js"];
self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES.map(function (file) { return new Request(file, { cache: "reload" }); })); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(fetch(e.request, { cache: "no-cache" }).then(function (res) {
    var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(e.request, copy); }); return res;
  }).catch(function () {
    return caches.match(e.request, { ignoreSearch: true }).then(function (r) { return r || caches.match("index.html"); });
  }));
});
