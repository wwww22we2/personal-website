/* 猫鱼笨鱼工作室 · 站点交互 */
(function () {
  "use strict";

  const GAMES = window.GAMES || [];
  const CATEGORIES = ["模拟", "修仙", "养成", "塔防"];
  const NEW_THRESHOLD = 5; // 评分人数少视为新上架

  const $ = (sel) => document.querySelector(sel);

  const starSvg =
    '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M12 2 L15 9 L22 9 L16.5 13.5 L18.5 21 L12 16.5 L5.5 21 L7.5 13.5 L2 9 L9 9 Z" fill="currentColor"/></svg>';
  const arrowSvg =
    '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M3 13 L13 3 M6 3 h7 v7" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function isNew(g) {
    return !g.ratingCount || g.ratingCount < NEW_THRESHOLD;
  }

  function ratingLabel(g) {
    return isNew(g) ? "新上架" : g.rating.toFixed(1);
  }

  /* ---------- 跑马灯 ---------- */
  function buildMarquee() {
    const track = $("#marqueeTrack");
    if (!track) return;
    const names = GAMES.map((g) => g.name);
    const half = document.createElement("div");
    half.style.display = "flex";
    names.forEach((n) => {
      const item = document.createElement("span");
      item.className = "marquee-item";
      item.textContent = n;
      half.appendChild(item);
    });
    track.appendChild(half);
    track.appendChild(half.cloneNode(true));
  }

  /* ---------- 最新上架（取发布日期最新且未隐藏的一款） ---------- */
  function buildFeatured() {
    const g = GAMES.find((x) => x.id === "980975") || GAMES[0];
    if (!g) return;
    $("#featuredDesc").textContent = g.desc;
    $("#featuredLink").href = g.link;

    const meta = $("#featuredMeta");
    const name = document.createElement("span");
    name.className = "featured-name";
    name.textContent = g.name;
    meta.appendChild(name);

    const badge = document.createElement("span");
    badge.className = "badge-new";
    badge.textContent = isNew(g) ? "新上架" : "TapTap " + g.rating.toFixed(1) + " 分";
    meta.appendChild(badge);

    const tags = document.createElement("div");
    tags.className = "featured-tags";
    g.cats.forEach((c) => {
      const t = document.createElement("span");
      t.className = "tag";
      t.style.setProperty("--card-accent", g.accent);
      t.textContent = c;
      tags.appendChild(t);
    });
    meta.appendChild(tags);

    const art = $("#featuredArt");
    art.classList.add("hero-panel-wrap");
    ["hero-shot-a", "hero-shot-b"].forEach((cls, i) => {
      const d = document.createElement("div");
      d.className = "hero-shot " + cls;
      const img = document.createElement("img");
      img.src = g.shots[i] || g.shots[0];
      img.alt = "";
      img.loading = "lazy";
      d.appendChild(img);
      art.appendChild(d);
    });
  }

  /* ---------- 游戏网格 ---------- */
  function buildGrid() {
    const grid = $("#gameGrid");
    if (!grid) return;
    const tpl = document.createElement("template");
    tpl.innerHTML = GAMES.map(
      (g) => `
      <article class="game-card" data-cats="${g.cats.join(",")}" style="--card-accent:${g.accent}">
        <div class="game-media">
          <img src="${g.shots[0]}" alt="${g.name} 游戏截图" loading="lazy" />
          ${
            isNew(g)
              ? `<span class="game-badge badge-new-float">新上架</span>`
              : `<span class="game-badge">${starSvg}${g.rating.toFixed(1)}</span>`
          }
          <img class="game-icon" src="${g.icon}" alt="" loading="lazy" />
        </div>
        <div class="game-body">
          <h3 class="game-name">${g.name}</h3>
          <div class="game-tags">
            ${g.cats.map((c) => `<span class="tag">${c}</span>`).join("")}
          </div>
          <p class="game-desc">${g.desc}</p>
          <div class="game-foot">
            <a class="game-link" href="${g.link}" target="_blank" rel="noopener">TapTap 页面</a>
            <a class="game-arrow" href="${g.link}" target="_blank" rel="noopener" aria-label="打开 ${g.name} 的 TapTap 页面">${arrowSvg}</a>
          </div>
        </div>
      </article>`
    ).join("");
    grid.appendChild(tpl.content);
  }

  /* ---------- 筛选 ---------- */
  function buildFilters() {
    const bar = $("#filterBar");
    if (!bar) return;
    const counts = { 全部: GAMES.length };
    CATEGORIES.forEach((c) => {
      counts[c] = GAMES.filter((g) => g.cats.includes(c)).length;
    });
    const cats = ["全部", ...CATEGORIES];
    bar.innerHTML = cats
      .map(
        (c, i) =>
          `<button class="filter-pill${i === 0 ? " is-active" : ""}" role="tab" aria-selected="${i === 0}" data-cat="${c}">${c}<span class="count">${counts[c]}</span></button>`
      )
      .join("");

    bar.addEventListener("click", (e) => {
      const btn = e.target.closest(".filter-pill");
      if (!btn) return;
      bar.querySelectorAll(".filter-pill").forEach((p) => {
        p.classList.toggle("is-active", p === btn);
        p.setAttribute("aria-selected", p === btn ? "true" : "false");
      });
      applyFilter(btn.dataset.cat);
    });
  }

  function applyFilter(cat) {
    const cards = document.querySelectorAll("#gameGrid .game-card");
    let visible = 0;
    cards.forEach((card, i) => {
      const match = cat === "全部" || card.dataset.cats.split(",").includes(cat);
      card.classList.remove("is-entering");
      if (match) {
        card.classList.remove("is-hidden");
        card.style.animationDelay = (visible * 0.04) + "s";
        void card.offsetWidth; // 重新触发入场动画
        card.classList.add("is-entering");
        visible++;
      } else {
        card.classList.add("is-hidden");
      }
    });
    $("#gridEmpty").hidden = visible !== 0;
  }

  /* ---------- 分类卡片 ---------- */
  function buildCategories() {
    const wrap = $("#catGrid");
    if (!wrap) return;
    const meta = {
      模拟: {
        color: "var(--primary)",
        icon: '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="M4 20 h16 M6 20 V9 l4 -2 v13 M14 20 V5 l4 2 v13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        desc: "从一个小摊位开始，一路经营成商业帝国。",
      },
      修仙: {
        color: "var(--teal)",
        icon: '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="M3 19 L9 8 l3.2 5.4 L15 9 l6 10 Z M12 4.5 v2 M11 5.5 h2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        desc: "凡人逆天改命，渡劫飞升三界之巅。",
      },
      养成: {
        color: "var(--purple)",
        icon: '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="M12 21 v-8 M12 13 c0 -4 -3 -6 -7 -6 c0 4 3 6 7 6 Z M12 10 c0 -3.5 2.6 -5.5 6.5 -5.5 C18.5 8.5 16 10 12 10 Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        desc: "招募伙伴、培养装备，见证每一点成长。",
      },
      塔防: {
        color: "var(--stone)",
        icon: '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="M12 3 l8 3 v6 c0 4.5 -3.2 7.6 -8 9 c-4.8 -1.4 -8 -4.5 -8 -9 V6 Z M12 8 v5 M9.5 10.5 h5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        desc: "布置守卫，挡住一波波来袭的怪潮。",
      },
    };
    wrap.innerHTML = CATEGORIES.map((c) => {
      const count = GAMES.filter((g) => g.cats.includes(c)).length;
      const m = meta[c];
      return `
      <button class="cat-card" data-cat="${c}">
        <span class="cat-chip" style="background:${m.color}">${m.icon}</span>
        <span class="cat-count">${count} 款游戏</span>
        <span class="cat-name">${c}</span>
        <p class="cat-desc">${m.desc}</p>
        <span class="cat-go" style="color:${m.color}">查看此类 ${arrowSvg}</span>
      </button>`;
    }).join("");

    wrap.addEventListener("click", (e) => {
      const card = e.target.closest(".cat-card");
      if (!card) return;
      const cat = card.dataset.cat;
      const pill = document.querySelector(`.filter-pill[data-cat="${cat}"]`);
      if (pill) pill.click();
      document.getElementById("games").scrollIntoView({ behavior: "smooth" });
    });
  }

  /* ---------- 滚动进场 ---------- */
  function setupReveal() {
    const els = document.querySelectorAll(".reveal");
    els.forEach((el, i) => {
      el.style.setProperty("--reveal-delay", (i % 4) * 0.08 + "s");
    });
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("is-visible");
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    els.forEach((el) => io.observe(el));
  }

  /* ---------- init ---------- */
  buildMarquee();
  buildFeatured();
  buildGrid();
  buildFilters();
  buildCategories();
  setupReveal();
})();
