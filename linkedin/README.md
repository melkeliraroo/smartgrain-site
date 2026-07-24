# Newsletters do LinkedIn

Este diretório contém exclusivamente newsletters publicadas diretamente no LinkedIn.

## Fluxos separados

- `pessoal/`: newsletter pessoal de Melkezedeque Alves Lira.
- `smartgrain/`: newsletter profissional da Smart Grain.

Cada edição deve ser criada em:

```text
<fluxo>/rascunhos/AAAA-MM-DD-slug/
  newsletter.txt
  capa-newsletter.webp
```

O arquivo `newsletter.txt` reúne título, subtítulo, artigo, fontes e texto curto para divulgação no feed. A capa deve ser original, não conter texto embutido, marcas de terceiros ou logotipos, salvo solicitação explícita.

Newsletters não devem gerar HTML, SEO para o site, RSS, sitemap ou entrada em `blog/artigos.json`.

O conteúdo permanece como rascunho até aprovação humana explícita. Não publicar, agendar ou enviar ao LinkedIn durante a preparação.

## Blog da Smart Grain

O blog é um terceiro fluxo, independente das duas newsletters. Seus artigos continuam em `blog/` e seguem as convenções próprias de HTML, SEO, imagens públicas, índice, RSS e sitemap.

