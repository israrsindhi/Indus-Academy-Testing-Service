document.addEventListener("DOMContentLoaded", async () => {
  await IA.renderHeader("index.html");
  await IA.renderFooter();
  await IA.renderNoticeboard();

  const cfg = await IA.getConfig();

  // ---- Programs (external links) ----
  const programs = [
    {
      idx: "01",
      title: "MDCAT Preparation",
      desc: "Chapter-wise tests, high-yield revision, and direct access to PMC's official syllabus and past papers.",
      href: cfg.external_links.mdcat,
      label: "Official MDCAT (PMC)"
    },
    {
      idx: "02",
      title: "Sukkur IBA Phase II",
      desc: "Our core program: quantitative, English, and analytical prep built around real IBA past papers.",
      href: cfg.external_links.iba_phase2,
      label: "Official IBA Admission Test"
    },
    {
      idx: "03",
      title: "Aror University Entry Test",
      desc: "Orientation and prep for Aror University's admission test — pattern, eligibility, and merit.",
      href: cfg.external_links.aror_university,
      label: "Official Aror University"
    }
  ];

  document.querySelector("[data-programs]").innerHTML = programs.map(p => `
    <div class="program-card">
      <div class="program-index">${p.idx}</div>
      <h3>${p.title}</h3>
      <p>${p.desc}</p>
      <a class="program-link" href="${p.href}" target="_blank" rel="noopener">
        ${p.label} <span class="arrow">&#8599;</span>
      </a>
    </div>
  `).join("");

  // ---- Blog preview: featured + most popular, 3 total ----
  try {
    const posts = await IA.loadJSON("data/posts.json");
    const featured = posts.filter(p => p.featured).sort((a, b) => b.views - a.views);
    const rest = posts.filter(p => !p.featured).sort((a, b) => b.views - a.views);
    const preview = [...featured, ...rest].slice(0, 3);

    document.querySelector("[data-blog-preview]").innerHTML = preview.map(p => `
      <a class="post-card" href="post.html?slug=${p.slug}" style="cursor:pointer">
        <div class="meta">
          ${p.category}${p.featured ? '<span class="dot">&middot;</span><span class="badge-featured">Featured</span>' : ""}
        </div>
        <h3>${p.title}</h3>
        <p class="excerpt">${p.excerpt}</p>
        <div class="footer-row">
          <span>${IA.fmtDate(p.date)}</span>
          <span class="read-link">Read &rarr;</span>
        </div>
      </a>
    `).join("");
  } catch (e) {
    document.querySelector("[data-blog-preview]").innerHTML = `<div class="state-msg">Blog posts unavailable right now.</div>`;
  }
});
