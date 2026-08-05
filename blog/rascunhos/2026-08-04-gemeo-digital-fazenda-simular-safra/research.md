# Pesquisa de pauta

Data principal de acesso: 2026-08-04

## Rotação editorial e contagem por categoria

Foram lidos `blog/artigos.json` e todos os `draft.json` em `blog/rascunhos/`, excluindo os subpacotes `boletim-smartgrain` e `smartgrain-insights`. Para a rotação editorial, considerei como rascunho válido apenas o conteúdo ainda não publicado. Os seis rascunhos principais encontrados já têm slug presente em `blog/artigos.json` e, por isso, não aumentam a representatividade da categoria.

| Categoria | Publicados | Rascunhos válidos não publicados | Total único considerado | Publicação mais recente |
| --- | ---: | ---: | ---: | --- |
| Agricultura de Precisão | 5 | 0 | 5 | 2026-07-29 |
| IoT, conectividade e telemetria | 4 | 0 | 4 | 2026-06-28 |
| Dados, software e inteligência artificial | 2 | 0 | 2 | 2026-06-27 |
| Máquinas e automação agrícola | 3 | 0 | 3 | 2026-08-02 |
| Gestão e transformação digital | 3 | 0 | 3 | 2026-07-30 |

Categoria escolhida: **Dados, software e inteligência artificial**.

Desempate: não foi necessário. A categoria é a menos representada de forma isolada.

Categoria anterior da sequência: **Máquinas e automação agrícola**, usada no rascunho e no artigo publicado em 2026-08-02. A regra de não repetir a categoria anterior foi respeitada naturalmente.

## Rotação de autoria

O conteúdo mais recente do blog e dos rascunhos principais é `diagnostico-remoto-safra-maquinas`, assinado por **Melkezedeque Alves Lira** e publicado em 2026-08-02. Pela alternância pedida nesta automação, a autoria desta rodada passa para **Francyeli Aureliano Lira**, com a função editorial registrada como **Co-Fundadora e Especialista em Big Data aplicado ao agronegócio**.

## Candidatos avaliados na categoria escolhida

Janela prioritária: últimos 30 dias, ampliando o contexto para 90 dias quando o conceito exigiu base técnica anterior muito próxima.

| Pauta | Novidade | Decisão afetada | Benefício prático | Risco de exagero | Impacto econômico | Aplicabilidade | Atualidade | Evidência | Aderência ao público | Total |
| --- | --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Gêmeo digital da fazenda para simular a safra | Embrapa e revisões técnicas de junho e julho de 2026 aproximam o conceito do uso agrícola real | Testar, contratar ou adiar plataforma e integração | Ajuda a separar simulação operacional séria de promessa vazia | Vender a ideia como previsão infalível | 5 | 5 | 5 | 5 | 5 | 25 |
| Arquitetura mínima de dados antes de contratar IA | Revisão de julho de 2026 sobre IoT e Big Data reforça gargalos persistentes de integração e escalabilidade | Organizar ou adiar projeto de IA | Reduz gasto com software sem base de dados confiável | Ficar próximo demais do artigo já publicado sobre data lake | 5 | 5 | 4 | 5 | 5 | 24 |
| Dados confiáveis para rastreabilidade e mercados exigentes | Sinais regulatórios e de governança de dados seguem fortes em 2026 | Priorizar governança, integração e trilha de auditoria | Prepara exportação e relatórios | Pode migrar demais para gestão e compliance | 4 | 4 | 4 | 4 | 5 | 21 |
| IA explicável para mapas e recomendação agronômica | Cresce a discussão acadêmica sobre transparência dos modelos | Escolher fornecedor e critério de validação | Ajuda a evitar caixa-preta na tomada de decisão | Menor conexão imediata com a rotina operacional da fazenda média | 4 | 3 | 4 | 4 | 4 | 19 |

## Pauta escolhida

**Gêmeo digital da fazenda: o que precisa existir antes de simular a safra**

A pauta venceu porque reúne dois sinais recentes e independentes. O primeiro é institucional. A Embrapa passou a tratar IA, conectividade, sensores e dados como base concreta para novos sistemas no Cerrado e, em junho, a Embrapa Soja vinculou explicitamente o avanço da IA agrícola à chegada de gêmeos digitais e de simulações de cenários. O segundo é técnico. Revisões publicadas entre junho e julho de 2026 descrevem a transição de ferramentas isoladas de apoio à decisão para arquiteturas integradas que sincronizam dados de campo, modelos e operação.

## Pergunta decisória

O que uma fazenda precisa ter pronto antes de investir em gêmeo digital para simular a safra sem transformar o projeto em um painel caro e pouco confiável?

## Tese editorial

O gêmeo digital só faz sentido quando a fazenda fecha o ciclo entre dado confiável, integração, contexto operacional e validação em campo. Sem isso, a promessa de simulação vira reconciliação manual com aparência sofisticada.

## Diferenciação entre fato, inferência e recomendação

Como fato publicado, as fontes recentes sustentam que a agricultura está migrando de ferramentas isoladas para sistemas mais integrados, e que sensores, conectividade, dados e modelos são pilares desse avanço. Como inferência editorial, isso sugere que a demanda por gêmeos digitais vai crescer primeiro onde a rotina operacional já produz dados consistentes e comparáveis. Como recomendação prática, o artigo deve orientar o leitor a começar por um processo de alto custo e baixa tolerância a erro, como janela de plantio, pulverização ou colheita, em vez de tentar digitalizar toda a fazenda de uma vez.

## Fontes principais e escopo de evidência

1. **Embrapa Cerrados. Tecnologias emergentes podem contribuir para o desenvolvimento agrícola no Cerrado.**
   Data: 2026-07-04
   URL: https://www.embrapa.br/web/cerrados/busca-de-noticias/-/noticia/146811894/tecnologias-emergentes-podem-contribuir-para-o-desenvolvimento-agricola-no-cerrado
   Acesso: 2026-08-04
   Sustenta: os quatro pilares para a IA no agro, com ênfase em sensores, conectividade, dados e modelos.

2. **Embrapa Soja. Dos desafios às oportunidades de uso da inteligência artificial na agricultura tropical.**
   Data: 2026-06-11
   URL: https://www.embrapa.br/web/soja/busca-de-noticias/-/noticia/144963773/dos-desafios-as-oportunidades-de-uso-da-inteligencia-artificial-na-agricultura-tropical
   Acesso: 2026-08-04
   Sustenta: o sinal institucional de que gêmeos digitais e simulação de cenários estão entrando na conversa agrícola brasileira, com menção a exemplos em Mato Grosso.

3. **Agriculture. Digital Twins in Agriculture: A Review.**
   Data: 2026-06-10
   URL: https://www.mdpi.com/2077-0472/16/12/1286
   Acesso: 2026-08-04
   Sustenta: definição técnica do conceito, arquitetura geral e estágio de maturidade do tema.

4. **Sustainability. From Decision-Support Tools to Digital Twins: A Review of Farm Management and Agriculture.**
   Data: 2026-07-07
   URL: https://www.mdpi.com/2071-1050/18/13/6900
   Acesso: 2026-08-04
   Sustenta: a passagem de ferramentas isoladas para sistemas fechando o ciclo entre dados, modelo e decisão.

5. **Agronomy. Technical Limitations and Research Gaps of IoT and Big Data in Agriculture.**
   Data: 2026-07-16
   URL: https://www.mdpi.com/2073-4395/16/14/3193
   Acesso: 2026-08-04
   Sustenta: gargalos recorrentes de interoperabilidade, qualidade de dados, escala e combinação entre borda e nuvem.

6. **Smart Agricultural Technology. AI-Enabled Digital Twins in Agriculture: A Systematic Review and a Vision for Future Farming.**
   Data: 2026-05-13
   URL: https://www.sciencedirect.com/science/article/pii/S2772375525001079
   Acesso: 2026-08-04
   Sustenta: síntese técnica da aplicação de gêmeos digitais com IA, incluindo benefícios e barreiras.

## Registro das imagens originais

- Capa editorial
  Prompt: composição editorial em pôr do sol no Mato Grosso com gerente agrícola, especialista em dados, tablet e camadas visuais sugerindo mapas, clima, telemetria e produção.
  Arquivo: `imagens/cover.webp`
  Finalidade: hero do artigo e capa do pacote.
  Texto alternativo: gerente agrícola e especialista em dados observam uma área de produção ao pôr do sol enquanto um tablet e camadas visuais sugerem mapas, clima, telemetria e indicadores de uma fazenda conectada.

- Ilustração didática
  Prompt: fluxo visual do gêmeo digital unindo sensores, telemetria, clima, silos e registros operacionais a um modelo virtual da fazenda e às decisões de campo.
  Arquivo: `imagens/gemeo-digital-fazenda-fluxo.webp`
  Finalidade: explicar o ciclo técnico mais complexo do artigo.
  Texto alternativo: ilustração didática mostrando sensores, telemetria, clima, silos e registros operacionais alimentando um modelo virtual da fazenda, que devolve simulações e decisões para tratores e colhedoras.
