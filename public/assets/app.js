// Renders /releases.json (see README.md). Plain ES2015, no build step.
(function () {
  var TEXT = {
    vi: {
      title: "Tải TS IPTV",
      lead: "Trình phát IPTV cho danh sách phát của riêng bạn. Chọn thiết bị để tải bản mới nhất.",
      loading: "Đang tải danh sách…",
      failed: "Không tải được danh sách. Xem các bản phát hành trên GitHub.",
      checksumsHint: "Bản desktop kèm file SHA256SUMS.txt để kiểm tra file tải về.",
      site: "Trang chủ", privacy: "Quyền riêng tư", allReleases: "Tất cả bản phát hành",
      soon: "Sắp ra mắt", soonText: "Chưa có bản tải. Hãy quay lại sau.",
      yours: "Thiết bị của bạn", version: "Phiên bản", released: "phát hành",
      notes: "Ghi chú phát hành", checksums: "SHA256SUMS",
    },
    en: {
      title: "Download TS IPTV",
      lead: "An IPTV player for your own playlists. Pick your device to get the latest version.",
      loading: "Loading…",
      failed: "Could not load the list. See the releases on GitHub.",
      checksumsHint: "Desktop builds come with SHA256SUMS.txt to verify the download.",
      site: "Home", privacy: "Privacy", allReleases: "All releases",
      soon: "Coming soon", soonText: "No download yet. Check back later.",
      yours: "Your device", version: "Version", released: "released",
      notes: "Release notes", checksums: "SHA256SUMS",
    },
  };

  var ICONS = {
    android: '<path d="M7 9h10v8a1 1 0 0 1-1 1h-1v3h-2v-3h-2v3H9v-3H8a1 1 0 0 1-1-1V9zm-3 0h2v6H4zm14 0h2v6h-2zM7.5 8a4.5 4.5 0 0 1 9 0z" fill="currentColor"/>',
    ios: '<rect x="7" y="2" width="10" height="20" rx="2.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M11 18h2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    macos: '<rect x="3" y="4" width="18" height="12" rx="1.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M1 19h22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    windows: '<path d="M3 5.5 10.5 4.5v7H3zm8.5-1.2L21 3v8.5h-9.5zM3 12.5h7.5v7L3 18.5zm8.5 0H21V21l-9.5-1.3z" fill="currentColor"/>',
    tv: '<rect x="2" y="4" width="20" height="13" rx="1.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 21h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  };

  var lang = pickLang();
  var data = null;

  function pickLang() {
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

  function t(key) { return TEXT[lang][key]; }

  function tr(value) {
    if (value == null) return "";
    return typeof value === "string" ? value : (value[lang] || value.en || "");
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function card(p, mine) {
    var live = p.status === "live" && p.links && p.links.length;
    var html = '<article class="card' + (mine ? " mine" : "") + '">';
    html += '<div class="card-head"><svg viewBox="0 0 24 24" aria-hidden="true">' + (ICONS[p.id] || ICONS.tv) + "</svg>";
    html += "<h2>" + esc(p.name) + "</h2>";
    if (mine) html += '<span class="badge mine">' + esc(t("yours")) + "</span>";
    else if (!live) html += '<span class="badge">' + esc(t("soon")) + "</span>";
    html += "</div>";
    if (p.requirements) html += '<p class="req">' + esc(tr(p.requirements)) + "</p>";
    if (p.version) {
      html += '<p class="meta">' + esc(t("version")) + " " + esc(p.version) +
        (p.published ? " · " + esc(t("released")) + " " + esc(p.published) : "") + "</p>";
    }
    if (live && p.hint) html += '<p class="hint">' + esc(tr(p.hint)) + "</p>";
    if (live) {
      html += '<div class="links">';
      p.links.forEach(function (l) {
        html += '<a class="btn" href="' + esc(l.url) + '" rel="noopener">' + esc(tr(l.label)) +
          (l.size ? '<span class="size">' + esc(l.size) + "</span>" : "") + "</a>";
      });
      html += "</div>";
      if (p.notes || p.checksums) {
        html += '<div class="extra">';
        if (p.notes) html += '<a href="' + esc(p.notes) + '" rel="noopener">' + esc(t("notes")) + "</a>";
        if (p.checksums) html += '<a href="' + esc(p.checksums) + '" rel="noopener">' + esc(t("checksums")) + "</a>";
        html += "</div>";
      }
    } else {
      html += '<p class="soon">' + esc(t("soonText")) + "</p>";
    }
    return html + "</article>";
  }

  function render() {
    document.documentElement.lang = lang;
    document.title = t("title");
    Array.prototype.forEach.call(document.querySelectorAll("[data-i18n]"), function (el) {
      el.textContent = t(el.getAttribute("data-i18n"));
    });
    Array.prototype.forEach.call(document.querySelectorAll("[data-lang]"), function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-lang") === lang));
    });
    var box = document.getElementById("platforms");
    if (data === "error") { box.innerHTML = '<p class="dim">' + esc(t("failed")) + "</p>"; return; }
    if (!data) return;
    var mine = detectPlatform();
    // The visitor's platform first, the rest in file order.
    var list = data.platforms.slice().sort(function (a, b) { return (b.id === mine) - (a.id === mine); });
    box.innerHTML = list.map(function (p) { return card(p, p.id === mine); }).join("");
  }

  Array.prototype.forEach.call(document.querySelectorAll("[data-lang]"), function (b) {
    b.addEventListener("click", function () {
      lang = b.getAttribute("data-lang");
      try { localStorage.setItem("lang", lang); } catch (e) {}
      render();
    });
  });

  render();
  fetch("/releases.json", { cache: "no-cache" })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (json) { data = json; render(); })
    .catch(function () { data = "error"; render(); });
})();
