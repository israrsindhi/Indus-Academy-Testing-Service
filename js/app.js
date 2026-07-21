/* app.js — shared across all pages: loads config.json, builds header/nav, footer */

const IA = (() => {
  let configCache = null;

  async function loadJSON(path) {
    const res = await fetch(path, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load " + path);
    return res.json();
  }

  async function getConfig() {
    if (!configCache) configCache = await loadJSON("data/config.json");
    return configCache;
  }

  function fmtDate(iso) {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  }

  function timeAgo(iso) {
    const then = new Date(iso + "T00:00:00").getTime();
    const days = Math.floor((Date.now() - then) / 86400000);
    if (days <= 0) return "today";
    if (days === 1) return "1 day ago";
    if (days < 30) return days + " days ago";
    const months = Math.floor(days / 30);
    if (months < 12) return months + (months === 1 ? " month ago" : " months ago");
    return Math.floor(months / 12) + " yr ago";
  }

  async function renderHeader(activeHref) {
    const cfg = await getConfig();
    const navHtml = cfg.nav.map(item =>
      `<a href="${item.href}" class="${item.href === activeHref ? "active" : ""}">${item.label}</a>`
    ).join("");

    document.querySelectorAll("[data-ia-header]").forEach(el => {
      el.innerHTML = `
        <div class="topbar">
          <div class="container">
            <div class="topbar-contact">
              <span>${cfg.city}</span>
              <span>${cfg.phone}</span>
            </div>
            <div>${cfg.email}</div>
          </div>
        </div>
        <header class="site-header">
          <div class="container nav-row">
            <a class="brand" href="index.html">
              <span class="brand-mark">IA</span>
              <span class="brand-text">
                <span class="name">${cfg.short_name}</span><br>
                <span class="sub">Testing Services</span>
              </span>
            </a>
            <nav class="main-nav">${navHtml}</nav>
          </div>
        </header>
      `;
    });
  }

  async function renderFooter() {
    const cfg = await getConfig();
    const year = new Date().getFullYear();
    document.querySelectorAll("[data-ia-footer]").forEach(el => {
      el.innerHTML = `
        <div class="container">
          <div class="footer-grid">
            <div>
              <h5>${cfg.site_name}</h5>
              <p>${cfg.tagline}</p>
            </div>
            <div>
              <h5>Programs</h5>
              <a href="${cfg.external_links.mdcat}" target="_blank" rel="noopener">MDCAT (PMC)</a><br>
              <a href="${cfg.external_links.iba_phase2}" target="_blank" rel="noopener">Sukkur IBA Phase II</a><br>
              <a href="${cfg.external_links.aror_university}" target="_blank" rel="noopener">Aror University</a>
            </div>
            <div>
              <h5>Academy</h5>
              <a href="blog.html">Blog & Notices</a><br>
              <a href="verify.html">Verify Certificate</a><br>
              <a href="index.html#programs">All Programs</a>
            </div>
          </div>
          <div class="footer-bottom">
            <span>&copy; ${year} ${cfg.site_name}, ${cfg.city}.</span>
            <span>Built for students who show up early.</span>
          </div>
        </div>
      `;
    });
  }

  async function renderNoticeboard() {
    const track = document.querySelector("[data-noticeboard]");
    if (!track) return;
    let updates;
    try {
      updates = await loadJSON("data/updates.json");
    } catch (e) {
      track.innerHTML = `<div class="notice-item active"><span class="notice-title">Notices unavailable right now.</span></div>`;
      return;
    }

    // Sort: pinned first, then newest date first
    updates.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return new Date(b.date) - new Date(a.date);
    });
    const shown = updates.slice(0, 6);

    const dotsWrap = document.querySelector("[data-notice-dots]");
    track.innerHTML = shown.map((u, i) => `
      <div class="notice-item ${i === 0 ? "active" : ""}" data-idx="${i}">
        <span class="notice-tag ${u.type}">${u.type}</span>
        <span class="notice-date">${fmtDate(u.date)}</span>
        <span class="notice-title">${u.title} — ${u.body}</span>
      </div>
    `).join("");

    if (dotsWrap) {
      dotsWrap.innerHTML = shown.map((_, i) =>
        `<button class="${i === 0 ? "active" : ""}" data-goto="${i}" aria-label="Notice ${i + 1}"></button>`
      ).join("");
    }

    let current = 0;
    const items = track.querySelectorAll(".notice-item");
    const dots = dotsWrap ? dotsWrap.querySelectorAll("button") : [];

    function show(idx) {
      items.forEach(el => el.classList.remove("active"));
      dots.forEach(el => el.classList.remove("active"));
      items[idx].classList.add("active");
      if (dots[idx]) dots[idx].classList.add("active");
      current = idx;
    }

    dots.forEach(btn => btn.addEventListener("click", () => show(parseInt(btn.dataset.goto, 10))));

    if (items.length > 1) {
      setInterval(() => show((current + 1) % items.length), 5000);
    }
  }

  return { getConfig, loadJSON, fmtDate, timeAgo, renderHeader, renderFooter, renderNoticeboard };
})();
