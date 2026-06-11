async function carregarArtigos() {

    const resposta = await fetch('artigos.json');
    const artigos = await resposta.json();

    const container = document.getElementById('articlesGrid');

    function renderizarArtigos(listaArtigos) {

    const container = document.getElementById('articlesGrid');

    container.innerHTML = '';

    listaArtigos.slice().reverse().forEach(artigo => {

        const card = document.createElement('article');

        card.className = 'blog-card';

        card.innerHTML = `
            <img src="${artigo.imagem}" alt="${artigo.titulo}">

            <div class="blog-content">

                <span class="categoria">${artigo.categoria}</span>

                <h2>${artigo.titulo}</h2>

                <p>${artigo.descricao}</p>

                <small>
                    ${artigo.data} • ${artigo.tempoLeitura}
                </small>

                <br><br>

                <a href="${artigo.url}">
                    Ler artigo
                </a>

            </div>
        `;

        container.appendChild(card);

    });

}
renderizarArtigos(artigos);
const filtros = document.querySelectorAll('.cat-btn');

filtros.forEach(botao => {

    botao.addEventListener('click', () => {

        filtros.forEach(b => b.classList.remove('active'));

        botao.classList.add('active');

        const categoria = botao.dataset.category;

        if (categoria === 'Todos') {

            renderizarArtigos(artigos);

        } else {

            const filtrados = artigos.filter(
                artigo => artigo.categoria === categoria
            );

            renderizarArtigos(filtrados);

        }

    });

});

    const popularContainer = document.getElementById('popularPosts');

    if (popularContainer) {

        popularContainer.innerHTML = '';

        artigos.slice().reverse().slice(0,5).forEach(artigo => {

            const item = document.createElement('div');

            item.className = 'popular-post';

            item.innerHTML = `
                <a href="${artigo.url}">
                    ${artigo.titulo}
                </a>
            `;

            popularContainer.appendChild(item);

        });

    }

}

carregarArtigos();