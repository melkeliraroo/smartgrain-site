(function () {
  const state = { articles: [], currentHint: '' };

  function formatDate(value) {
    const date = new Date(`${value}T12:00:00`);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date).replace('.', '');
  }

  function imageUrl(article) {
    return article.imagem;
  }

  function articleHref(article) {
    return /\.html$/i.test(article.url) ? article.url : `${article.url}.html`;
  }

  function articleSlug(article) {
    return (article.url || '').replace(/\.html$/i, '').toLowerCase();
  }

  function currentFilename() {
    return decodeURIComponent(window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
  }

  function currentSlug() {
    return currentFilename().replace(/\.html$/i, '');
  }

  function injectStyles() {
    if (document.getElementById('blog-engine-styles')) return;
    const style = document.createElement('style');
    style.id = 'blog-engine-styles';
    style.textContent = `
      .be-related{display:flex;gap:.8rem;padding:.85rem 0;border-bottom:1px solid rgba(26,58,42,.08);text-decoration:none;align-items:center}
      .be-related:last-child{border-bottom:0;padding-bottom:0}
      .be-related__thumb{width:72px;height:58px;flex:0 0 72px;border-radius:8px;overflow:hidden;background:#edf1ed}
      .be-related__thumb img{display:block;width:100%!important;height:100%!important;object-fit:cover!important;margin:0!important;border-radius:0!important;box-shadow:none!important}
      .be-related__body{min-width:0}
      .be-related__title{color:var(--te,#111a14);font-size:.84rem;font-weight:700;line-height:1.35;transition:color .2s}
      .be-related__date{color:var(--tm,#3a4a3e);font-size:.7rem;margin-top:.3rem;opacity:.72}
      .be-related:hover .be-related__title{color:var(--dou,#c8960c)}
      .be-empty{padding:.9rem 0;color:var(--tm,#3a4a3e);font-size:.83rem;line-height:1.5}
      .popular-post.be-popular{display:grid;grid-template-columns:64px minmax(0,1fr);gap:.75rem;align-items:center}
      .be-popular__thumb{width:64px;height:52px;border-radius:7px;overflow:hidden;background:#edf1ed}
      .be-popular__thumb img{display:block;width:100%;height:100%;object-fit:cover}
      .be-popular a{font-size:.84rem}
    `;
    document.head.appendChild(style);
  }

  function relatedMarkup(article) {
    return `
      <a href="${articleHref(article)}" class="be-related">
        <span class="be-related__thumb">
          <img src="${imageUrl(article)}" alt="" width="144" height="116" loading="lazy"/>
        </span>
        <span class="be-related__body">
          <span class="be-related__title">${article.titulo}</span>
          <span class="be-related__date">${formatDate(article.data)} · ${article.tempoLeitura}</span>
        </span>
      </a>`;
  }

  function ensureRelatedContainer() {
    const existing = document.getElementById('relatedPosts');
    if (existing) {
      const existingTitle = existing.parentElement && existing.parentElement.querySelector('.sb-title');
      if (existingTitle) existingTitle.textContent = '📖 Leia mais';
      return existing;
    }

    const title = Array.from(document.querySelectorAll('.sb-title')).find((element) =>
      element.textContent.toLocaleLowerCase('pt-BR').includes('leia tamb')
      || element.textContent.toLocaleLowerCase('pt-BR').includes('leia mais')
    );
    if (!title || !title.parentElement) return null;

    title.textContent = '📖 Leia mais';
    const card = title.parentElement;
    Array.from(card.children).forEach((child) => {
      if (child !== title) child.remove();
    });
    const container = document.createElement('div');
    container.id = 'relatedPosts';
    card.appendChild(container);
    return container;
  }

  function renderRelated() {
    const container = ensureRelatedContainer();
    if (!container || !state.articles.length) return;

    const slug = currentSlug();
    const current = state.articles.find((article) => articleSlug(article) === slug);
    const candidates = state.articles
      .filter((article) =>
        articleSlug(article) !== slug
        && current
        && article.categoria === current.categoria
      )
      .sort((a, b) => b.data.localeCompare(a.data))
      .slice(0, 3);

    container.innerHTML = candidates.length
      ? candidates.map(relatedMarkup).join('')
      : '<p class="be-empty">Ainda não há outro artigo publicado nesta categoria.</p>';
  }

  function renderPopular() {
    const container = document.getElementById('popularPosts');
    if (!container) return;
    const articles = state.articles.slice().sort((a, b) => b.data.localeCompare(a.data)).slice(0, 5);
    container.innerHTML = articles.map((article) => `
      <div class="popular-post be-popular">
        <a class="be-popular__thumb" href="${articleHref(article)}" aria-label="${article.titulo}">
          <img src="${imageUrl(article)}" alt="" width="128" height="104" loading="lazy"/>
        </a>
        <a href="${articleHref(article)}">${article.titulo}</a>
      </div>`).join('');
  }

  function renderFeatured() {
    const container = document.getElementById('featuredCard');
    if (!container || !state.articles.length) return;

    const article = state.articles.slice().sort((a, b) => b.data.localeCompare(a.data))[0];
    container.innerHTML = `
      <a class="featured-card" href="${articleHref(article)}">
        <div class="featured-img">
          <img src="${imageUrl(article)}" alt="${article.titulo}" width="1200" height="630" loading="eager"/>
          <span class="featured-label">Destaque</span>
        </div>
        <div class="featured-body">
          <div class="article-meta">
            <span class="article-cat">${article.categoria}</span>
            <span class="article-dot"></span>
            <span class="article-date">${formatDate(article.data)}</span>
            <span class="article-dot"></span>
            <span class="article-read">${article.tempoLeitura}</span>
          </div>
          <h2 class="featured-title">${article.titulo}</h2>
          <p class="featured-excerpt">${article.descricao}</p>
          <span class="read-more">Ler artigo →</span>
        </div>
      </a>`;
  }

  function renderArticleGrid(articles) {
    const container = document.getElementById('articlesGrid');
    if (!container) return;
    container.innerHTML = '';
    articles.slice().sort((a, b) => b.data.localeCompare(a.data)).forEach((article) => {
      const card = document.createElement('article');
      card.className = 'blog-card';
      card.innerHTML = `
        <img src="${imageUrl(article)}" alt="${article.titulo}" loading="lazy"/>
        <div class="blog-content">
          <span class="categoria">${article.categoria}</span>
          <h2>${article.titulo}</h2>
          <p>${article.descricao}</p>
          <small>${formatDate(article.data)} · ${article.tempoLeitura}</small>
          <br><br>
          <a href="${articleHref(article)}">Ler artigo</a>
        </div>`;
      container.appendChild(card);
    });
  }

  function setupFilters() {
    const buttons = document.querySelectorAll('.cat-btn');
    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        buttons.forEach((item) => item.classList.remove('active'));
        button.classList.add('active');
        const category = button.dataset.category;
        renderArticleGrid(category === 'Todos'
          ? state.articles
          : state.articles.filter((article) => article.categoria === category));
      });
    });

    const search = document.getElementById('searchInput');
    if (search) {
      search.addEventListener('input', () => {
        const term = search.value.trim().toLocaleLowerCase('pt-BR');
        renderArticleGrid(state.articles.filter((article) =>
          `${article.titulo} ${article.descricao} ${article.categoria}`
            .toLocaleLowerCase('pt-BR').includes(term)
        ));
      });
    }
  }

  function loadSalesWidget() {
    if (document.querySelector('script[src$="sales-widget.js"]') || document.querySelector('.sg-books')) return;
    const script = document.createElement('script');
    script.src = 'sales-widget.js';
    script.defer = true;
    document.head.appendChild(script);
  }

  function renderAll() {
    state.articles = Array.isArray(window.BLOG_ARTICLES) ? window.BLOG_ARTICLES : [];
    renderFeatured();
    renderArticleGrid(state.articles);
    renderPopular();
    renderRelated();
    const count = document.getElementById('artCount');
    if (count) count.textContent = String(state.articles.length);
    setupFilters();
    loadSalesWidget();
  }

  function start() {
    injectStyles();
    if (Array.isArray(window.BLOG_ARTICLES)) {
      renderAll();
      return;
    }

    const dataScript = document.createElement('script');
    dataScript.src = 'artigos-data.js';
    dataScript.onload = renderAll;
    dataScript.onerror = function () {
      const related = ensureRelatedContainer();
      if (related) related.innerHTML = '<p class="be-empty">Não foi possível carregar as sugestões agora.</p>';
      loadSalesWidget();
    };
    document.head.appendChild(dataScript);
  }

  window.BlogEngine = {
    init: function (_pageType, currentHint) {
      state.currentHint = currentHint || '';
      if (state.articles.length) renderRelated();
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
