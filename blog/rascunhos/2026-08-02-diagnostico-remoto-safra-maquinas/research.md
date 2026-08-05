# Pesquisa de pauta

Data principal de acesso: 2026-08-02

## Inventário editorial e rotação

Foram lidos `blog/artigos.json` e os `draft.json` em `blog/rascunhos/`.

| Categoria | Publicados | Rascunhos válidos não duplicados | Total considerado | Publicação mais recente |
| --- | ---: | ---: | ---: | --- |
| Agricultura de Precisão | 5 | 0 | 5 | 2026-07-29 |
| IoT, conectividade e telemetria | 4 | 0 | 4 | 2026-06-28 |
| Dados, software e inteligência artificial | 2 | 0 | 2 | 2026-06-27 |
| Máquinas e automação agrícola | 2 | 0 | 2 | 2026-06-15 |
| Gestão e transformação digital | 3 | 0 | 3 | 2026-07-30 |

### Observações de contagem

- Não houve rascunho válido adicional para contagem por categoria, porque os rascunhos de 2026-07-22, 2026-07-29 e 2026-07-30 duplicam conteúdos já publicados ou não trazem categoria utilizável no `draft.json`.
- Houve empate entre `Dados, software e inteligência artificial` e `Máquinas e automação agrícola`, ambas com total 2.
- O desempate foi pela categoria há mais tempo sem publicação. `Máquinas e automação agrícola` não recebe artigo novo desde 2026-06-15, enquanto `Dados, software e inteligência artificial` foi publicada em 2026-06-27.
- A categoria anterior usada no conteúdo mais recente foi `Gestão e transformação digital`, no artigo de 2026-07-30. Portanto não houve impedimento adicional por repetição imediata.

## Autoria

- A decisão de autoria foi revista nesta rodada para priorizar aderência técnica ao tema, e não alternância fixa.
- **Melkezedeque Alves Lira** foi escolhido porque o recorte desta pauta envolve mecanização, pós-venda conectado, diagnóstico embarcado, robótica e operação de máquinas agrícolas, áreas mais aderentes ao seu perfil de engenheiro agrícola com especializações em geoprocessamento, robótica e máquinas agrícolas.
- **Francyeli Aureliano Lira** passa a ser autora preferencial para temas centrados em agrocomputação, Big Data, inteligência artificial, computação em nuvem e arquitetura de dados.
- Em caso de empate real de aderência, a regra passa a ser escolher quem estiver há mais tempo sem assinar conteúdo novo.

## Candidatos avaliados na categoria escolhida

| Pauta | Novidade | Decisão afetada | Benefício prático | Risco de exagero | Impacto econômico | Aplicabilidade | Atualidade | Evidência | Aderência ao público | Total |
| --- | --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Reparo remoto na safra com foco nas montadoras que atendem o Brasil | John Deere, Case IH e New Holland já publicam no Brasil ofertas de suporte remoto, acesso ao monitor e leitura estruturada de falhas | Revisar contratos, suporte e critérios de compra antes da próxima safra | Traduz tecnologia embarcada em exigências contratuais e operacionais objetivas | Médio, se o texto prometer autonomia total de reparo | 5 | 5 | 5 | 5 | 5 | 25 |
| Visualização remota de tela para colhedoras | Fabricantes ampliaram o apoio remoto em tempo real no ciclo 2026 | Definir se a fazenda deve exigir suporte remoto formal nas negociações | Ajuda a reduzir triagem errada e deslocamento desnecessário | Médio, se a ferramenta for tratada como solução universal | 4 | 5 | 5 | 4 | 4 | 22 |
| Documentação automática e rastreamento de frotas mistas | Plataformas conectadas estão integrando máquinas de diferentes idades e marcas | Escolher plataforma e governança para operações com máquinas conectadas e não conectadas | Facilita gestão de terceiros, implementos antigos e múltiplas frentes | Médio, porque encosta mais em telemetria do que em mecanização | 4 | 4 | 5 | 4 | 4 | 21 |
| TIM e automação entre trator e implemento | A agenda de TIM e certificação continua avançando na base de interoperabilidade | Decidir quando vale exigir compatibilidade aberta em vez de solução fechada | Relevante para compras futuras e interoperabilidade | Médio para alto, porque a adoção prática ainda é desigual no público-alvo | 3 | 3 | 3 | 4 | 3 | 16 |

## Pauta escolhida

**Reparo remoto na safra com foco nas montadoras que atendem o Brasil**

### Motivos da escolha

- É a pauta mais forte em atualidade e em utilidade prática dentro da categoria menos representada.
- Conecta oferta comercial já publicada no Brasil, arquitetura técnica e decisão de compra ou contratação sem repetir temas já publicados pelo blog.
- Permite separar com clareza fato publicado, inferência e recomendação.
- É especialmente útil para operações extensas de Mato Grosso, onde a demora de diagnóstico pesa tanto quanto a peça.

## Pergunta decisória do artigo

O que a fazenda precisa exigir de máquina, plataforma e contrato de suporte das montadoras que já operam no Brasil para não depender só de deslocamento de oficina quando a pane eletrônica parar a frente em janela crítica?

## Tese editorial

O ganho mais imediato da nova onda de automação agrícola não está necessariamente em autonomia total. Está em encurtar o ciclo entre falha, leitura correta, suporte remoto, reparo eletrônico autorizado e retorno da máquina ao trabalho, com base no que John Deere, Case IH e New Holland já oferecem formalmente ao mercado brasileiro.

## Fontes principais e uso no texto

1. **John Deere Brasil - Centro de Soluções Conectadas**  
   URL: https://www.deere.com.br/pt/pe%C3%A7as-e-servi%C3%A7os/servi%C3%A7o-especializado-e-de-otimiza%C3%A7%C3%A3o/connected-support/  
   Acesso: 2026-08-02  
   Sustenta: Service ADVISOR Remoto, Expert Alerts e Acesso Remoto ao Monitor como ferramentas para maximizar o tempo de atividade.

2. **John Deere Brasil - página do trator 8R 410**  
   URL: https://www.deere.com.br/pt/tratores/s%C3%A9rie-8r-270cv-400cv/8r410/  
   Acesso: 2026-08-02  
   Sustenta: média declarada de 20% de redução no tempo de inatividade com Connected Support, diagnóstico remoto e reprogramação remota de software.

3. **Case IH Brasil - Portais Conectados**  
   URL: https://www.caseih.com/pt-br/brasil/produtos/tecnologia-de-precisao/agricultura-de-precisao/portais-conectados  
   Acesso: 2026-08-02  
   Sustenta: acesso remoto ao IntelliView 12, service tool remota, atualização remota e visualização de saúde da máquina e do motor.

4. **Case IH Brasil - Módulos de Telemetria**  
   URL: https://www.caseih.com/pt-br/brasil/produtos/tecnologia-de-precisao/tecnologias-embarcadas/modulos-de-telemetria  
   Acesso: 2026-08-02  
   Sustenta: coleta de dados a cada um minuto, visualização remota, assistência remota e atualização remota de software.

5. **New Holland Brasil - Conectividade e FieldOps**  
   URL: https://agriculture.newholland.com/pt-br/brasil/produtos/agricultura-de-precisao/conectividade-e-fieldops  
   Acesso: 2026-08-02  
   Sustenta: monitoramento em tempo real, acesso remoto à cabine, IntelliCentre com diagnósticos remotos e serviço proativo.

6. **New Holland Brasil - Monitores IntelliView**  
   URL: https://agriculture.newholland.com/pt-br/brasil/produtos/agricultura-de-precisao/monitores-intelliview  
   Acesso: 2026-08-02  
   Sustenta: visualização remota do monitor via FieldOps no IntelliView 12.

7. **Federal Trade Commission - FTC, States Secure Settlement with Deere & Company, Advancing Farmers’ Right to Repair**  
   URL: https://www.ftc.gov/news-events/news/press-releases/2026/07/ftc-states-secure-settlement-deere-company-advancing-farmers-right-repair  
   Publicado em: 2026-07-08  
   Acesso: 2026-08-02  
   Sustenta: leitura e limpeza de códigos, reprogramação, pareamento de peças e retomada após bloqueios ligados a emissões como núcleo do debate regulatório.

8. **Liang, Z. e Jiang, Q. - Sensors in Combine Harvesters for Process Monitoring and Control**  
   URL: https://www.mdpi.com/2077-0472/16/12/1315  
   Publicado em: 2026-06-14  
   Acesso: 2026-08-02  
   Sustenta: colhedoras evoluindo para plataformas distribuídas de supervisão, diagnóstico e controle adaptativo.

9. **The Application of AI Technology Across the Entire Technical Chain of Combine Harvesters: A Systematic Review**  
   URL: https://www.mdpi.com/2077-0472/16/9/935  
   Publicado em: 2026  
   Acesso: 2026-08-02  
   Sustenta: monitoramento remoto por CAN bus e 4G ou 5G como configuração comercial madura em colhedoras médias e grandes.

## Riscos editoriais monitorados

- Não transformar o acordo da FTC em recomendação jurídica direta para o contexto brasileiro.
- Não prometer que suporte remoto substitui oficina presencial.
- Não tratar qualquer recurso digital de cabine como ganho automático de uptime.
- Não perder o foco em montadoras com operação e comunicação oficiais no Brasil.

## Observação de layout do pacote

- Os artigos publicados não mantêm um único padrão estático para os blocos de livros, mas o modelo compartilhado do projeto hoje está concentrado em `blog/sales-widget.js`, acionado por `blog/blog-engine.js`.
- Como este rascunho fica em `blog/rascunhos/` e não pode depender desse carregamento automático sem ajuste de caminhos, os cards de livros foram montados localmente com o mesmo desenho visual do widget compartilhado.
- A CTA dos cards de livros foi mantida como `Comprar e-book` e `Comprar livro`, conforme orientação editorial desta rodada.
