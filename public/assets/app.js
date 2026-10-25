// Renders /releases.json (see README.md). Plain ES2015, no build step, no libraries.
// The visitor's platform gets the download box at the top and the highlighted card; motion is off under
// prefers-reduced-motion.
(function () {
  "use strict";
  window.tsiptvDownload = true; // the inline guard in <head> shows everything if this never runs

  var TEXT = {
    vi: {
      title: "Tải TS IPTV", titleA: "Tải", eyebrow: "Tải về miễn phí",
      lead: "Trình phát IPTV cho danh sách phát của riêng bạn, trên điện thoại, TV và máy tính.",
      navAll: "Tất cả nền tảng", navVerify: "Kiểm tra file", site: "Trang chủ", guides: "Hướng dẫn",
      privacy: "Quyền riêng tư", allReleases: "Tất cả bản phát hành",
      loading: "Đang tải danh sách…",
      failed: "Không tải được danh sách. Xem tất cả bản phát hành ở cuối trang.",
      allEyebrow: "Mọi thiết bị", allTitle: "Chọn nền tảng của bạn",
      stepsEyebrow: "Bắt đầu", stepsTitle: "Ba bước là xem được",
      s1t: "Tải và cài", s1p: "Chọn nền tảng ở trên. Android cài từ Google Play, máy tính tải bộ cài.",
      s2t: "Thêm danh sách của bạn", s2p: "Dán link M3U hoặc chọn file. TS IPTV không kèm sẵn kênh nào.",
      s3t: "Xem, hoặc phát lên TV", s3p: "Chạm biểu tượng TV trong trình phát để chuyển kênh lên Android TV.",
      verifyEyebrow: "An toàn", verifyTitle: "Kiểm tra file tải về",
      checksumsHint: "Bản desktop kèm file SHA256SUMS.txt. So mã băm của file bạn tải với mã trong file đó.",
      copy: "Sao chép", copied: "Đã sao chép",
      legal: "TS IPTV không cung cấp kênh hay nội dung. Google Play và logo Google Play là nhãn hiệu của Google LLC.",
      soon: "Sắp ra mắt", soonText: "Chưa có bản tải. Hãy quay lại sau.",
      yours: "Thiết bị của bạn", version: "Phiên bản", released: "phát hành",
      notes: "Ghi chú phát hành", checksums: "SHA256SUMS",
      forYou: "Dành cho {os}", detected: "Đã nhận diện thiết bị của bạn",
      pickOther: "Thiết bị khác?", seeAll: "Xem mọi nền tảng",
      starting: "Đang bắt đầu tải {file}…", openingPlay: "Đang mở Google Play…",
      androidTv: "Cùng bản này chạy trên Android TV và Google TV.",
      iosSoon: "TS IPTV cho iPhone sắp có trên App Store.", iosMeanwhile: "Trong lúc chờ, bạn có thể dùng bản Android hoặc máy tính.",
      tvSoon: "Ứng dụng cho TV LG và Samsung sắp ra mắt.", tvMeanwhile: "Android TV / Google TV: cài từ Google Play.",
      unknown: "Chọn thiết bị của bạn", unknownSub: "Có cho Android, Android TV, Windows và macOS.",
      appStore: "App Store", lgStore: "LG Content Store", samsungStore: "Samsung Apps TV",
      badgeAlt: "Tải trên Google Play",
    },
    en: {
      title: "Download TS IPTV", titleA: "Download", eyebrow: "Free download",
      lead: "An IPTV player for your own playlists, on phone, TV and desktop.",
      navAll: "All platforms", navVerify: "Verify files", site: "Home", guides: "Guides",
      privacy: "Privacy", allReleases: "All releases",
      loading: "Loading…",
      failed: "Could not load the list. See all releases at the bottom of the page.",
      allEyebrow: "Every device", allTitle: "Pick your platform",
      stepsEyebrow: "Get started", stepsTitle: "Three steps to watching",
      s1t: "Download and install", s1p: "Pick your platform above. Android installs from Google Play; computers get an installer.",
      s2t: "Add your playlist", s2p: "Paste an M3U link or pick a file. TS IPTV ships with no channels.",
      s3t: "Watch, or play on TV", s3p: "Tap the TV icon in the player to move the channel to your Android TV.",
      verifyEyebrow: "Safety", verifyTitle: "Verify your download",
      checksumsHint: "Desktop builds come with SHA256SUMS.txt. Compare your file's hash with the one in that file.",
      copy: "Copy", copied: "Copied",
      legal: "TS IPTV provides no channels or content. Google Play and the Google Play logo are trademarks of Google LLC.",
      soon: "Coming soon", soonText: "No download yet. Check back later.",
      yours: "Your device", version: "Version", released: "released",
      notes: "Release notes", checksums: "SHA256SUMS",
      forYou: "For {os}", detected: "We detected your device",
      pickOther: "Another device?", seeAll: "See every platform",
      starting: "Starting the download of {file}…", openingPlay: "Opening Google Play…",
      androidTv: "The same app runs on Android TV and Google TV.",
      iosSoon: "TS IPTV for iPhone is coming to the App Store.", iosMeanwhile: "Meanwhile, use the Android or desktop version.",
      tvSoon: "The LG and Samsung TV apps are coming soon.", tvMeanwhile: "Android TV / Google TV: install from Google Play.",
      unknown: "Pick your device", unknownSub: "Available for Android, Android TV, Windows and macOS.",
      appStore: "App Store", lgStore: "LG Content Store", samsungStore: "Samsung Apps TV",
      badgeAlt: "Get it on Google Play",
    },
  };

  var GLYPH = { android: "i-android", ios: "i-ios", macos: "i-macos", windows: "i-windows", tv: "i-tv" };
  var reduced = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia && matchMedia("(hover: hover) and (pointer: fine)").matches;
  var lang = pickLang();
  var data = null;
  var mine = detectPlatform();

  function pickLang() {
    var q = new URLSearchParams(location.search).get("lang");
    if (q === "vi" || q === "en") return q;
    var saved = null;
    try { saved = localStorage.getItem("lang"); } catch (e) {}
    if (saved === "vi" || saved === "en") return saved;
    return (navigator.language || "vi").toLowerCase().indexOf("vi") === 0 ? "vi" : "en";
  }

  function detectPlatform() {
    var ua = navigator.userAgent || "";
    if (/Web0S|webOS|Tizen|SMART-TV|SmartTV/i.test(ua)) return "tv";
    if (/Android/i.test(ua)) return "android";
    if (/iPhone|iPad|iPod/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return "ios";
    if (/Macintosh|Mac OS X/i.test(ua)) return "macos";
    if (/Windows/i.test(ua)) return "windows";
    return null;
  }

  function t(key, vars) {
    var s = TEXT[lang][key] || "";
    if (vars) Object.keys(vars).forEach(function (k) { s = s.replace("{" + k + "}", vars[k]); });
    return s;
  }
  function tr(value) { return value == null ? "" : typeof value === "string" ? value : (value[lang] || value.en || ""); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; });
  }
  function glyph(id) { return '<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#' + (GLYPH[id] || "i-tv") + '"/></svg>'; }
  function isPlay(url) { return /play\.google\.com/.test(url); }
  function find(id) { return data && data.platforms ? data.platforms.filter(function (p) { return p.id === id; })[0] : null; }
  function live(p) { return p && p.status === "live" && p.links && p.links.length; }

  function playBadge(url) {
    return '<a class="badge-link" href="' + esc(url) + '" rel="noopener" data-store="play"><img src="/assets/badges/google-play-' + lang +
      '.png" alt="' + esc(t("badgeAlt")) + '" width="150" height="58"></a>';
  }
  function fileName(url) { return decodeURIComponent(url.split("/").pop() || ""); }
  function linkButton(l, primary) {
    if (isPlay(l.url)) return playBadge(l.url);
    return '<a class="btn' + (primary ? " primary" : "") + '" href="' + esc(l.url) + '" rel="noopener" data-file="' + esc(fileName(l.url)) + '">' +
      '<span class="label"><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-download"/></svg>' + esc(tr(l.label)) + "</span>" +
      (l.size ? '<span class="size">' + esc(l.size) + "</span>" : "") + "</a>";
  }
  function soonStore(name) { return '<span class="store-soon"><b>' + esc(name) + "</b> · " + esc(t("soon")) + "</span>"; }

  /* ---- the download box in the hero ------------------------------------------------------------- */
  function renderSmart() {
    var box = document.getElementById("smart");
    if (data === "error") { box.innerHTML = '<p class="dim">' + esc(t("failed")) + "</p>"; return; }
    if (!data) return;
    var p = find(mine);
    var android = find("android");
    var head = function (id, title, sub) {
      return '<div class="smart-head"><span class="os-ico">' + glyph(id) + '</span><div><p class="smart-title">' + esc(title) +
        '</p><p class="smart-sub">' + esc(sub) + "</p></div></div>";
    };
    var html;
    if (p && live(p)) {
      html = head(p.id, t("forYou", { os: p.name }), p.version ? t("version") + " " + p.version + (p.published ? " · " + t("released") + " " + p.published : "") : tr(p.requirements));
      html += '<div class="smart-actions">' + p.links.map(function (l, i) { return linkButton(l, i === 0); }).join("") + "</div>";
      if (p.id === "android") html += '<p class="smart-more">' + esc(t("androidTv")) + "</p>";
      else if (p.hint) html += '<p class="smart-more">' + esc(tr(p.hint)) + "</p>";
    } else if (mine === "ios") {
      html = head("ios", t("iosSoon"), t("iosMeanwhile"));
      html += '<div class="smart-actions">' + soonStore(t("appStore")) + "</div>";
    } else if (mine === "tv") {
      html = head("tv", t("tvSoon"), t("tvMeanwhile"));
      html += '<div class="smart-actions">' + (live(android) ? playBadge(android.links[0].url) : "") + "</div>";
    } else {
      html = head("tv", t("unknown"), t("unknownSub"));
      html += '<div class="smart-actions">' + (live(android) ? playBadge(android.links[0].url) : "") +
        '<a class="btn" href="#all">' + esc(t("seeAll")) + "</a></div>";
    }
    if (mine) html += '<p class="smart-more">' + esc(t("pickOther")) + ' <a href="#all">' + esc(t("seeAll")) + "</a></p>";
    box.innerHTML = html;
  }

  /* ---- platform cards ------------------------------------------------------------------------------- */
  function card(p, isMine, i) {
    var ok = live(p);
    var html = '<article class="card reveal' + (isMine ? " mine" : "") + (ok ? "" : " soon") + '" style="--d:' + (i * 70) + 'ms" data-spot>';
    html += '<div class="card-head"><span class="os-ico">' + glyph(p.id) + "</span><h3>" + esc(p.name) + "</h3>";
    if (isMine) html += '<span class="pill mine">' + esc(t("yours")) + "</span>";
    else if (!ok) html += '<span class="pill soon">' + esc(t("soon")) + "</span>";
    html += "</div>";
    if (p.requirements) html += '<p class="req">' + esc(tr(p.requirements)) + "</p>";
    if (p.version) html += '<p class="meta">' + esc(t("version")) + " <b>" + esc(p.version) + "</b>" + (p.published ? " · " + esc(t("released")) + " " + esc(p.published) : "") + "</p>";
    if (ok && p.hint) html += '<p class="hint">' + esc(tr(p.hint)) + "</p>";
    if (ok) {
      var stores = p.links.filter(function (l) { return isPlay(l.url); });
      var files = p.links.filter(function (l) { return !isPlay(l.url); });
      if (stores.length) html += '<div class="stores">' + stores.map(function (l) { return playBadge(l.url); }).join("") + "</div>";
      if (p.id === "android") html += '<p class="meta">' + esc(t("androidTv")) + "</p>";
      if (files.length) html += '<div class="links">' + files.map(function (l, j) { return linkButton(l, j === 0 && isMine); }).join("") + "</div>";
      if (p.notes || p.checksums) {
        html += '<div class="extra">';
        if (p.notes) html += '<a href="' + esc(p.notes) + '" rel="noopener">' + esc(t("notes")) + "</a>";
        if (p.checksums) html += '<a href="' + esc(p.checksums) + '" rel="noopener">' + esc(t("checksums")) + "</a>";
        html += "</div>";
      }
    } else {
      html += '<p class="meta">' + esc(t("soonText")) + "</p>";
      html += '<div class="stores">' + (p.id === "ios" ? soonStore(t("appStore")) : p.id === "tv" ? soonStore(t("lgStore")) + soonStore(t("samsungStore")) : "") + "</div>";
    }
    return html + "</article>";
  }

  function renderCards() {
    var box = document.getElementById("platforms");
    if (data === "error") { box.innerHTML = '<p class="dim">' + esc(t("failed")) + "</p>"; return; }
    if (!data) return;
    // The visitor's platform first, then what can be downloaded today, then what is coming.
    var list = data.platforms.slice().sort(function (a, b) {
      return (b.id === mine) - (a.id === mine) || (live(b) ? 1 : 0) - (live(a) ? 1 : 0);
    });
    box.innerHTML = list.map(function (p, i) { return card(p, p.id === mine, i); }).join("");
    observeReveals(box);
  }

  function render() {
    document.documentElement.lang = lang;
    document.title = t("title");
    Array.prototype.forEach.call(document.querySelectorAll("[data-i18n]"), function (el) { el.textContent = t(el.getAttribute("data-i18n")); });
    Array.prototype.forEach.call(document.querySelectorAll("[data-lang]"), function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-lang") === lang)); });
    renderSmart();
    renderCards();
  }

  /* ---- reveal on scroll ------------------------------------------------------------------------------- */
  var io = "IntersectionObserver" in window && !reduced ? new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.1 }) : null;
  function observeReveals(root) {
    Array.prototype.forEach.call((root || document).querySelectorAll(".reveal:not(.is-in)"), function (el) {
      if (io) io.observe(el); else el.classList.add("is-in");
    });
  }

  /* ---- interactions ------------------------------------------------------------------------------------- */
  var toast = document.getElementById("toast");
  var toastTimer = 0;
  function showToast(text) {
    toast.textContent = text;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("show"); }, 2600);
  }

  document.addEventListener("click", function (ev) {
    var a = ev.target.closest && ev.target.closest("a.btn[data-file], a.badge-link");
    if (!a) return;
    if (!reduced && a.classList.contains("btn")) {
      var r = a.getBoundingClientRect();
      var dot = document.createElement("span");
      var size = Math.max(r.width, r.height);
      dot.className = "ripple";
      dot.style.width = dot.style.height = size + "px";
      dot.style.left = ev.clientX - r.left - size / 2 + "px";
      dot.style.top = ev.clientY - r.top - size / 2 + "px";
      a.appendChild(dot);
      setTimeout(function () { dot.remove(); }, 700);
    }
    showToast(a.getAttribute("data-store") === "play" ? t("openingPlay") : t("starting", { file: a.getAttribute("data-file") }));
  });

  if (finePointer && !reduced) {
    document.addEventListener("pointermove", function (ev) {
      var c = ev.target.closest && ev.target.closest("[data-spot]");
      if (!c) return;
      var r = c.getBoundingClientRect();
      c.style.setProperty("--mx", ev.clientX - r.left + "px");
      c.style.setProperty("--my", ev.clientY - r.top + "px");
    });
  }

  // Checksum commands: tabs and copy.
  var codeTabs = Array.prototype.slice.call(document.querySelectorAll("[data-code]"));
  codeTabs.forEach(function (b) {
    b.addEventListener("click", function () {
      codeTabs.forEach(function (x) { x.setAttribute("aria-selected", String(x === b)); });
      Array.prototype.forEach.call(document.querySelectorAll("[data-code-pane]"), function (p) { p.hidden = p.getAttribute("data-code-pane") !== b.getAttribute("data-code"); });
    });
  });
  if (mine === "macos" && codeTabs[1]) codeTabs[1].click();
  var copyBtn = document.querySelector(".copy");
  if (copyBtn) copyBtn.addEventListener("click", function () {
    var pane = document.querySelector("[data-code-pane]:not([hidden]) code");
    var done = function () { copyBtn.textContent = t("copied"); setTimeout(function () { copyBtn.textContent = t("copy"); }, 1600); };
    if (navigator.clipboard && pane) navigator.clipboard.writeText(pane.textContent).then(done, function () {});
  });

  // Hero clips: no autoplay under reduced motion.
  if (reduced) Array.prototype.forEach.call(document.querySelectorAll(".scene video"), function (v) { v.removeAttribute("autoplay"); v.pause(); });

  Array.prototype.forEach.call(document.querySelectorAll("[data-lang]"), function (b) {
    b.addEventListener("click", function () {
      lang = b.getAttribute("data-lang");
      try { localStorage.setItem("lang", lang); } catch (e) {}
      render();
    });
  });

  render();
  observeReveals(document);
  fetch("/releases.json", { cache: "no-cache" })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (json) { data = json; render(); })
    .catch(function () { data = "error"; render(); });
})();
