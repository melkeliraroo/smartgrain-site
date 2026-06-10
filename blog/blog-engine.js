async function carregarArtigos() {

    const resposta = await fetch('artigos.json');
    const artigos = await resposta.json();

    const container = document.getElementById('artigos-container');

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
