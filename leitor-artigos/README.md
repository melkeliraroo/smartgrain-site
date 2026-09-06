# Leitor de Artigos — SmartGrain

Aplicativo web que lê artigos científicos em PDF **em voz alta, na íntegra**, com
tradução opcional entre **português e inglês**. Nasceu de uma necessidade prática:
aproveitar o tempo de deslocamento até a fazenda para ouvir artigo, e não só ler.

Endereço: `https://smartgrain.com.br/leitor-artigos/`

## O que ele faz

- Abre um PDF do computador ou do celular (arrastando ou escolhendo o arquivo).
- Reconstrói o texto na ordem certa de leitura, inclusive em **artigos de duas colunas**.
- Descarta cabeçalho, rodapé e número de página repetidos; junta palavras quebradas
  por hífen no fim da linha; identifica títulos, legendas e a lista de referências.
- Lê tudo em voz alta, do começo ao fim — **sem resumir**.
- Traduz PT ⇄ EN parágrafo a parágrafo, conforme a leitura avança.
- Guarda onde você parou, e a tradução já feita, para continuar depois.
- Funciona offline (a tradução, essa, precisa de internet).

## Como funciona por dentro

| Arquivo | Papel |
|---|---|
| `extract.js` | PDF → blocos de leitura. Detecta a calha entre colunas pelo histograma de ocupação horizontal da página, monta as linhas dentro de cada coluna, ordena a leitura por faixas (texto que atravessa a página, depois coluna esquerda, depois direita) e agrupa linhas em parágrafos. |
| `texto.js` | Idioma do artigo, limpeza para áudio (citações, endereços, DOI), abreviaturas faladas por extenso (`et al.` → "e colaboradores", `kg ha-1` → "quilos por hectare") e divisão em frases. |
| `traducao.js` | Tradução em trechos, com repetição e troca automática de provedor. |
| `app.js` | Interface, reprodução, memória do documento (IndexedDB) e preferências. |
| `sw.js` | Cache do aplicativo para uso offline. |
| `vendor/pdfjs/` | PDF.js 3.11.174 (Apache-2.0), servido do próprio site — sem CDN. |

Não há servidor: o PDF é lido dentro do navegador e o áudio sai da síntese de voz do
próprio sistema (Web Speech API). O único dado que sai do aparelho é o texto enviado
ao serviço de tradução, e só quando a tradução é pedida.

## Serviços de tradução

Configuráveis em "Serviço de tradução":

1. **Google (público)** — padrão, sem cadastro. É um endereço público e pode limitar
   o uso em textos muito longos.
2. **MyMemory** — cota diária; informar um e-mail amplia a cota.
3. **LibreTranslate** — para quem quiser rodar o próprio servidor de tradução e não
   depender de terceiros. Basta informar o endereço e, se houver, a chave.

Se o serviço escolhido falhar, o aplicativo tenta o próximo e, em último caso, segue
lendo no idioma original avisando na tela.

## Limitações conhecidas

- **PDF digitalizado (imagem) não tem texto** — é preciso passar OCR antes.
- A qualidade da voz é a do sistema. No Android, Chrome com as vozes do Google costuma
  dar o melhor resultado; no Windows, Edge. Vozes se instalam nas configurações do
  aparelho, não no aplicativo.
- No iPhone, a leitura pausa quando a tela bloqueia — limitação do próprio iOS.
- Fórmulas, tabelas e equações não têm boa leitura em áudio; o texto corrido, sim.

## Desenvolvimento

É um site estático. Para testar localmente, sirva a pasta por HTTP (não abra o
arquivo direto, porque o *service worker* e o *worker* do PDF.js exigem `http://`):

```bash
python3 -m http.server 8000
# depois abra http://localhost:8000/leitor-artigos/
```

O extrator roda também no Node, o que permite conferir a extração de um PDF fora do
navegador:

```js
const pdfjs = require('pdfjs-dist/legacy/build/pdf.js');
const SGExtract = require('./extract.js');
const pdf = await pdfjs.getDocument({ data }).promise;
const { blocos, meta } = await SGExtract.extrairDocumento(pdf);
```
