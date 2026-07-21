document.addEventListener("DOMContentLoaded", async () => {
  await IA.renderHeader("blog.html");
  await IA.renderFooter();
  await IA.renderNoticeboard();

  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");
  const root = document.querySelector("[data-post-root]");

  let posts = [];
  try {
    posts = await IA.loadJSON("data/posts.json");
  } catch (e) {
    root.innerHTML = `<div class="state-msg">Couldn't load this post.</div>`;
    return;
  }

  const post = posts.find(p => p.slug === slug);
  if (!post) {
    root.innerHTML = `
      <div class="state-msg">
        We couldn't find that post.<br><br>
        <a class="btn btn-emerald" href="blog.html">Back to Blog</a>
      </div>`;
    return;
  }

  document.title = post.title + " — Indus Academy Blog";

  document.querySelector("[data-post-hero]").innerHTML = `
    <div class="container">
      <div class="meta">${post.category} &middot; ${IA.fmtDate(post.date)} &middot; ${post.views.toLocaleString()} views</div>
      <h1>${post.title}</h1>
      <div class="sub">By ${post.author} &middot; ${IA.timeAgo(post.date)}</div>
    </div>
  `;

  const tagsHtml = post.tags.map(t => `<span class="tag-pill">${t}</span>`).join("");
  document.querySelector("[data-post-body]").innerHTML = `
    ${post.body}
    <div class="tags">${tagsHtml}</div>
  `;

  // Related: same category, excluding self, most popular first
  const related = posts
    .filter(p => p.category === post.category && p.slug !== post.slug)
    .sort((a, b) => b.views - a.views)
    .slice(0, 3);

  const relatedWrap = document.querySelector("[data-related]");
  if (related.length && relatedWrap) {
    relatedWrap.innerHTML = `
      <div class="section-head">
        <div class="section-eyebrow">Keep reading</div>
        <h2>More on ${post.category}</h2>
      </div>
      <div class="post-grid">
        ${related.map(p => `
          <a class="post-card" href="post.html?slug=${p.slug}">
            <div class="meta">${p.category}</div>
            <h3>${p.title}</h3>
            <p class="excerpt">${p.excerpt}</p>
            <div class="footer-row">
              <span>${IA.fmtDate(p.date)}</span>
              <span class="read-link">Read &rarr;</span>
            </div>
          </a>
        `).join("")}
      </div>
    `;
  }
});
