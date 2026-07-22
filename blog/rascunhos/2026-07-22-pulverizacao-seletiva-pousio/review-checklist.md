# Checklist de revisão

## Editorial

- [x] Tema atual e ainda não coberto diretamente no blog.
- [x] Texto em português do Brasil com foco em produtor e gerente agrícola.
- [x] Estrutura inclui contexto, problema, funcionamento, aplicação, recursos, riscos, indicadores e checklist de decisão.
- [x] Promessa editorial evita garantia de resultado agronômico ou financeiro.
- [x] Conclusão orienta piloto e validação, não compra automática.

## Técnico

- [x] Alegações centrais apoiadas por fontes identificadas em `research.md` e na seção de referências do HTML.
- [x] Separação entre fato publicado, recomendação prática e inferência operacional.
- [x] Alertas incluídos para dependência de infestação, clima, palhada, maquinário, suporte e treinamento.
- [x] Recorte prioriza pousio e dessecação para reduzir extrapolação indevida.
- [ ] Validado com `python scripts/validate_draft.py <diretorio>`: **bloqueado**, script não existe no repositório atual.

## Legal e uso de imagem

- [x] Capa planejada como imagem original gerada por IA.
- [x] Nenhuma imagem externa com licença não verificada foi incorporada ao pacote.
- [x] `image-licenses.json` registra origem da capa e texto alternativo.
- [x] Rascunho marcado como não aprovado em `draft.json`.

## Pontos para aprovação humana

- [ ] Confirmar se o recorte “pousio e dessecação” é o melhor para a linha editorial desta semana.
- [ ] Revisar CTA comercial e tom de serviço antes de qualquer publicação.
- [ ] Validar se o uso de referências internacionais está equilibrado o suficiente para o público-alvo no Mato Grosso.
- [ ] Rodar ou providenciar o validador oficial do projeto, hoje ausente em `scripts/validate_draft.py`.
