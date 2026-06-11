async function carregarArtigos() {

    const resposta = await fetch('artigos.json');
    const artigos = await resposta.json();

    const popularContainer = document.getElementById('popularPosts');

if (popularContainer) {

    popularContainer.innerHTML = '';

    artigos.slice(0, 5).forEach(artigo => {

        const item = document.createElement('div');

        item.className = 'popular-post';

        item.innerHTML = `
            <a href="${artigo.url}" style="text-decoration:none;color:inherit;">
                <strong>${artigo.titulo}</strong>
            </a>
        `;

        popularContainer.appendChild(item);

    });

}

    const container = document.getElementById('articlesGrid');

    artigos.reverse().forEach(artigo => {

        const card = document.createElement('article');

        card.className = 'blog-card';

        card.innerHTML = `
            <img src="${artigo.imagem}" alt="${artigo.titulo}">

            <div class="blog-content">

                <span class="categoria">
                    ${artigo.categoria}
                </span>

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

carregarArtigos();
