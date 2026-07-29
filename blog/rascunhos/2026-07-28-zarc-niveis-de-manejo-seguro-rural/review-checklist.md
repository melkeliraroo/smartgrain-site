# Checklist de revisão

## Editorial

- [x] Tema atual, com mudança operacional e regulatória verificável em 2026.
- [x] Texto em português do Brasil com foco em produtor e gerente agrícola.
- [x] Estrutura inclui contexto, problema, funcionamento, aplicação, recursos, riscos, indicadores e checklist de decisão.
- [x] Promessa editorial evita garantia de resultado agronômico, securitário ou financeiro.
- [x] Conclusão orienta preparação de dados e talhões-piloto, não adesão automática.

## Técnico

- [x] Alegações centrais apoiadas por fontes identificadas em `research.md` e na seção de referências do HTML.
- [x] Separação entre fato publicado, recomendação prática e inferência operacional.
- [x] Alertas incluídos para dependência de qualidade da análise de solo, histórico de manejo, georreferenciamento, operador credenciado e regras do PSR.
- [x] Recorte prioriza soja e milho segunda safra nas regiões cobertas pelo piloto 2026/27.
- [x] Validação manual concluída: estrutura do pacote, JSONs válidos e capa local em WEBP.
- [x] Card de livros incluído com capas reais e links diretos de compra.
- [x] Bloco "Leia também" atualizado com capas reais dos artigos relacionados, sem placeholders SVG.
- [ ] Validado com `python scripts/validate_draft.py <diretorio>`: **bloqueado**, o script existente valida pacote de newsletter do LinkedIn, não o formato HTML de `blog/rascunhos`.

## Legal e uso de imagem

- [x] Capa gerada como imagem original por IA e registrada em `image-licenses.json`.
- [x] Nenhuma imagem externa foi incorporada ao pacote.
- [x] `draft.json` registra `status` como `published`, `approved` como `true` e datas de aprovação/publicação em 2026-07-29.
- [x] Artigo integrado a `blog/artigos.json`, `blog/rss.xml` e `sitemap.xml` em 2026-07-29.

## Pontos para aprovação humana

- [ ] Confirmar se a pauta sobre ZARC-NM é a prioridade editorial da semana frente a temas mais operacionais de máquina e aplicação.
- [ ] Revisar o uso comercial do CTA antes de qualquer publicação.
- [ ] Validar o tom sobre seguro rural e subvenção com a equipe responsável por eventuais parcerias comerciais ou institucionais.
- [ ] Decidir se a Smart Grain quer manter a nomenclatura exata "ZARC-NM" no título ou simplificar para leitores menos técnicos.

- [x] Publicação autorizada pelo usuário em 29 de julho de 2026.
