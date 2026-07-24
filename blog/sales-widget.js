(function () {
  const products = [
    {
      type: 'E-book',
      title: 'Agro 4.0 — versão digital',
      description: 'Como a tecnologia está revolucionando o campo, em formato digital.',
      image: 'imagens/livros/agrocultura-digital.jpg',
      imageAlt: 'Capa do e-book Agro 4.0',
      imageWidth: 600,
      imageHeight: 900,
      url: 'https://hotmart.com/pt-br/marketplace/produtos/agrocultura-digital-o-futuro-do-agronegocio-brasileiro/K102919888J?sck=HOTMART_PRODUCT_PAGE',
      action: 'Conhecer o e-book'
    },
    {
      type: 'Livro físico',
      title: 'Agro 4.0',
      description: 'Como a tecnologia está revolucionando o campo, em edição impressa.',
      image: 'imagens/livros/agro-4-0.jpg',
      imageAlt: 'Capa do livro físico Agro 4.0',
      imageWidth: 620,
      imageHeight: 902,
      url: 'https://hotmart.com/pt-br/marketplace/produtos/hagsxd-agro-4-0-qup9m/M104168155C',
      action: 'Conhecer o livro'
    }
  ];

  const style = document.createElement('style');
  style.textContent = `
    .sg-books{background:linear-gradient(145deg,#fff 0%,#faf7f0 100%);border:1px solid rgba(26,58,42,.12);border-top:4px solid #c8960c;border-radius:16px;padding:1.35rem;box-shadow:0 8px 28px rgba(26,58,42,.07)}
    .sg-books__eyebrow{display:block;color:#9b7206;font-size:.7rem;font-weight:800;letter-spacing:.11em;text-transform:uppercase;margin-bottom:.35rem}
    .sg-books__title{font-family:"Fraunces",serif;font-size:1.15rem;line-height:1.25;color:#1a3a2a;margin:0 0 .45rem}
    .sg-books__intro{color:#526056;font-size:.82rem;line-height:1.55;margin:0 0 1rem}
    .sg-books__list{display:grid;gap:.75rem}
    .sg-book{background:#fff;border:1px solid rgba(26,58,42,.1);border-radius:11px;padding:.9rem;display:grid;grid-template-columns:72px minmax(0,1fr);gap:.85rem;align-items:start}
    .sg-book__cover-link{display:block;border-radius:8px;overflow:hidden;box-shadow:0 5px 14px rgba(26,58,42,.16);transition:transform .2s,box-shadow .2s}
    .sg-book__cover-link:hover{transform:translateY(-2px) rotate(-1deg);box-shadow:0 8px 18px rgba(26,58,42,.22)}
    .sg-book__cover{display:block;width:100%!important;height:auto!important;object-fit:contain;margin:0!important;border-radius:0!important;box-shadow:none!important}
    .sg-book__content{min-width:0}
    .sg-book__type{color:#9b7206;font-size:.66rem;font-weight:800;text-transform:uppercase;letter-spacing:.08em}
    .sg-book__name{display:block;color:#17251c;font-size:.93rem;font-weight:750;line-height:1.3;margin:.18rem 0}
    .sg-book__desc{color:#526056;font-size:.77rem;line-height:1.45;margin:0 0 .7rem}
    .sg-book__link{display:block;background:#1a3a2a;color:#fff!important;text-align:center;text-decoration:none;font-size:.78rem;font-weight:700;border-radius:7px;padding:.62rem .7rem;transition:background .2s,transform .2s}
    .sg-book__link:hover{background:#2d5a3d;transform:translateY(-1px)}
    .sg-books--end{margin:3rem 0 1rem;padding:1.8rem}
    .sg-books--end .sg-books__title{font-size:1.45rem}
    .sg-books--end .sg-books__intro{font-size:.92rem}
    .sg-books--end .sg-books__list{grid-template-columns:repeat(2,minmax(0,1fr))}
    .sg-books--end .sg-book{padding:1.15rem}
    .sg-books--end .sg-book{grid-template-columns:110px minmax(0,1fr);gap:1.1rem}
    .sg-books--end .sg-book__name{font-size:1.05rem}
    .sg-books--end .sg-book__desc{font-size:.85rem}
    @media(max-width:700px){.sg-books--end .sg-books__list{grid-template-columns:1fr}.sg-books--end{padding:1.3rem}.sg-books--end .sg-book{grid-template-columns:88px minmax(0,1fr)}.sg-has-article .sg-books--sidebar{display:none}}
  `;
  document.head.appendChild(style);

  function productMarkup(product) {
    return `
      <div class="sg-book">
        <a class="sg-book__cover-link" href="${product.url}" target="_blank" rel="noopener noreferrer sponsored" aria-label="${product.action}">
          <img class="sg-book__cover" src="${product.image}" alt="${product.imageAlt}" width="${product.imageWidth}" height="${product.imageHeight}" loading="lazy"/>
        </a>
        <div class="sg-book__content">
          <span class="sg-book__type">${product.type}</span>
          <strong class="sg-book__name">${product.title}</strong>
          <p class="sg-book__desc">${product.description}</p>
          <a class="sg-book__link" href="${product.url}" target="_blank" rel="noopener noreferrer sponsored" data-product="${product.type.toLowerCase().replace(/\s+/g, '-')}">${product.action} →</a>
        </div>
      </div>`;
  }

  function createBooksBlock(placement) {
    const section = document.createElement('section');
    section.className = `sg-books sg-books--${placement}`;
    section.setAttribute('aria-label', 'Livros do autor');
    section.innerHTML = `
      <span class="sg-books__eyebrow">Aprofunde seus conhecimentos</span>
      <h2 class="sg-books__title">Agricultura digital, do conceito à prática</h2>
      <p class="sg-books__intro">Continue aprendendo com os livros de Melkezedeque Alves Lira.</p>
      <div class="sg-books__list">${products.map(productMarkup).join('')}</div>`;
    return section;
  }

  const sidebar = document.querySelector('.sidebar');
  if (sidebar) {
    sidebar.insertBefore(createBooksBlock('sidebar'), sidebar.firstChild);
  }

  const article = document.querySelector('article.art-body');
  if (article) {
    document.documentElement.classList.add('sg-has-article');
    article.appendChild(createBooksBlock('end'));
  }
})();
