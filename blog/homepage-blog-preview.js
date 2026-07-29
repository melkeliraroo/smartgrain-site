(function () {
  const container = document.getElementById('homepageBlogPreview');
  const fallback = document.getElementById('homepageBlogPreviewFallback');

  if (!container) return;

  function formatDate(value) {
    const date = new Date(`${value}T12:00:00`);
    return new Intl.DateTimeFormat('pt-BR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date).replace('.', '');
  }

  function articleHref(article) {
    const slug = article && article.url ? article.url : '';
    return slug.endsWith('.html') ? `blog/${slug}` : `blog/${slug}.html`;
  }

  function imageSrc(article) {
    const image = article && article.imagem ? article.imagem.replace(/^\.?\/*/, '') : '';
    return `blog/${image}`;
  }

  function render(articles) {
    const recent = articles
      .slice()
      .sort((a, b) => b.data.localeCompare(a.data))
      .slice(0, 3);

    if (!recent.length) return false;

    container.innerHTML = recent.map((article) => `
      <a href="${articleHref(article)}"
         style="background:#fff;border-radius:16px;overflow:hidden;border:1px solid rgba(26,58,42,.08);text-decoration:none;display:block;transition:box-shadow .3s,transform .3s;"
         onmouseover="this.style.boxShadow='0 10px 32px rgba(26,58,42,.12)';this.style.transform='translateY(-4px)'"
         onmouseout="this.style.boxShadow='none';this.style.transform='translateY(0)'">
        <div style="height:220px;overflow:hidden;">
          <img src="${imageSrc(article)}"
               alt="${article.titulo}"
               loading="lazy"
               style="width:100%;height:100%;object-fit:cover;object-position:center;display:block;">
        </div>
        <div style="padding:1.4rem;">
          <div style="display:flex;gap:.8rem;align-items:center;flex-wrap:wrap;margin-bottom:.7rem;">
            <span style="font-size:.7rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--dou);">
              ${article.categoria}
            </span>
            <span style="font-size:.78rem;color:rgba(58,74,62,.45);">
              ${formatDate(article.data)}
            </span>
          </div>
          <div style="font-family:Fraunces,serif;font-weight:700;font-size:1.05rem;line-height:1.3;letter-spacing:-.02em;color:var(--te);margin-bottom:.6rem;">
            ${article.titulo}
          </div>
          <span style="font-size:.85rem;color:var(--vd);font-weight:600;">
            Ler artigo &rarr;
          </span>
        </div>
      </a>`).join('');

    if (fallback) fallback.style.display = 'none';
    return true;
  }

  function renderFromWindow() {
    return Array.isArray(window.BLOG_ARTICLES) && render(window.BLOG_ARTICLES);
  }

  if (renderFromWindow()) return;

  const script = document.createElement('script');
  script.src = 'blog/artigos-data.js';
  script.onload = function () {
    if (!renderFromWindow() && fallback) {
      container.style.display = 'none';
    }
  };
  script.onerror = function () {
    container.style.display = 'none';
  };
  document.head.appendChild(script);
})();
