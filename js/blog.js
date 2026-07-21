document.addEventListener("DOMContentLoaded", async () => {
  await IA.renderHeader("blog.html");
  await IA.renderFooter();
  await IA.renderNoticeboard();

  let posts = [];
  try {
    posts = await IA.loadJSON("data/posts.json");
  } catch (e) {
    document.querySelector("[data-post-grid]").innerHTML = `<div class="state-msg">Couldn't load blog posts.</div>`;
    return;
  }

  const grid = document.querySelector("[data-post-grid]");
  const buttons = document.querySelectorAll("[data-sort]");

  function sortPosts(mode) {
    const copy = [...posts];
    switch (mode) {
      case "popular":
        return copy.sort((a, b) => b.views - a.views);
      case "oldest":
        return copy.sort((a, b) => new Date(a.date) - new Date(b.date));
      case "featured":
        return copy.filter(p => p.featured).sort((a, b) => b.views - a.views);
      case "newest":
      default:
        return copy.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
  }

  function render(mode) {
    const list = sortPosts(mode);
    if (!list.length) {
      grid.innerHTML = `<div class="state-msg">No posts in this view yet.</div>`;
      return;
    }
    grid.innerHTML = list.map(p => `
      <a class="post-card" href="post.html?slug=${p.slug}">
        <div class="meta">
          ${p.category}${p.featured ? '<span class="dot">&middot;</span><span class="badge-featured">Featured</span>' : ""}
        </div>
        <h3>${p.title}</h3>
        <p class="excerpt">${p.excerpt}</p>
        <div class="footer-row">
          <span>${IA.fmtDate(p.date)} &middot; ${p.views.toLocaleString()} views</span>
          <span class="read-link">Read &rarr;</span>
        </div>
      </a>
    `).join("");
  }

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      render(btn.dataset.sort);
    });
  });

  render("newest");
});
