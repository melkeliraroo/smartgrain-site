/*!
 * SmartGrain — Leitor de Artigos
 * extract.js — reconstrução de texto de PDF para leitura em voz alta.
 *
 * Converte a "sopa de fragmentos" que o PDF.js devolve em blocos de leitura
 * (títulos, parágrafos, legendas), tratando os casos típicos de artigo
 * científico: duas colunas, cabeçalho/rodapé repetido, número de página,
 * palavras quebradas por hífen no fim da linha e seção de referências.
 *
 * Funciona no navegador (window.SGExtract) e no Node (module.exports),
 * o que permite testar a extração fora do browser.
 */
(function (global, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else global.SGExtract = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var ZONA_TOPO = 0.075;    // faixa superior da página tratada como cabeçalho
  var ZONA_RODAPE = 0.075;  // faixa inferior tratada como rodapé

  var RE_REFERENCIAS = /^\s*(?:\d+\.?\s*)?(refer[eê]nc[ií]as?|referencias|bibliografia|literatura\s+citada|obras\s+citadas|references?|bibliography|works\s+cited|literature\s+cited)\b/i;
  var RE_LEGENDA = /^\s*(figura|figure|fig\.?|tabela|table|tab\.?|quadro|gr[áa]fico|chart|scheme|esquema)\s*\.?\s*\d+/i;
  var RE_SO_NUMERO = /^[\s\d\/|.\-–—ivxlcIVXLC]+$/;

  function mediana(v) {
    if (!v.length) return 0;
    var a = v.slice().sort(function (x, y) { return x - y; });
    var m = Math.floor(a.length / 2);
    return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
  }

  function normalizar(t) {
    return String(t).toLowerCase().replace(/\d+/g, '#').replace(/\s+/g, ' ').trim();
  }

  /* ---------- 1. itens de texto crus da página ---------- */
  function lerItens(content, alturaPagina) {
    var out = [];
    for (var i = 0; i < content.items.length; i++) {
      var it = content.items[i];
      if (!it.str || !it.str.trim()) continue;
      var t = it.transform;
      var a = t[0], b = t[1], d = t[3], e = t[4], f = t[5];
      // descarta texto rotacionado (marca d'água, nome do periódico na lateral)
      if (Math.abs(b) > Math.abs(a) * 0.4) continue;
      var tamanho = Math.hypot(b, d) || Math.abs(d) || 10;
      var largura = (typeof it.width === 'number' && it.width > 0) ? it.width : tamanho * 0.5 * it.str.length;
      out.push({
        str: it.str,
        x0: e,
        x1: e + largura,
        yTop: alturaPagina - f,
        tamanho: tamanho
      });
    }
    return out;
  }

  /* ---------- 2. detecção da calha entre colunas ----------
     Feita ANTES de montar as linhas: numa página de duas colunas, dois
     trechos na mesma altura pertencem a colunas diferentes e não podem
     ser lidos como uma única linha. A calha é a faixa vertical em branco
     no meio da página. */
  function detectarCalha(itens, larguraPagina) {
    if (itens.length < 40) return 0;
    var NB = 120;
    var bins = new Array(NB);
    for (var i = 0; i < NB; i++) bins[i] = 0;
    itens.forEach(function (it) {
      var a = Math.max(0, Math.floor(it.x0 / larguraPagina * NB));
      var b = Math.min(NB - 1, Math.ceil(it.x1 / larguraPagina * NB));
      for (var k = a; k <= b; k++) bins[k]++;
    });
    var ocupados = bins.filter(function (v) { return v > 0; });
    if (ocupados.length < 20) return 0;
    // uma calha real é bem mais vazia que a densidade típica do texto
    var limiar = Math.max(1, mediana(ocupados) * 0.3);

    // maior sequência contínua de faixas quase vazias na região central
    var ini = Math.floor(NB * 0.34), fim = Math.ceil(NB * 0.66);
    var melhorIni = -1, melhorFim = -1, corIni = -1;
    for (var j = ini; j <= fim; j++) {
      if (bins[j] <= limiar) {
        if (corIni < 0) corIni = j;
        if (melhorIni < 0 || (j - corIni) > (melhorFim - melhorIni)) { melhorIni = corIni; melhorFim = j; }
      } else corIni = -1;
    }
    if (melhorIni < 0 || (melhorFim - melhorIni + 1) < 2) return 0;

    var centro = (melhorIni + melhorFim + 1) / 2;
    var esq = 0, dir = 0;
    for (var m = 0; m < NB; m++) {
      if (m < melhorIni) esq += bins[m];
      else if (m > melhorFim) dir += bins[m];
    }
    var total = esq + dir;
    if (!total || esq < total * 0.25 || dir < total * 0.25) return 0;
    return centro / NB * larguraPagina;
  }

  /* ---------- 3. itens -> linhas ---------- */
  function agruparLinhas(itens, calha) {
    itens.sort(function (p, q) { return (p.yTop - q.yTop) || (p.x0 - q.x0); });
    var brutas = [];
    for (var i = 0; i < itens.length; i++) {
      var it = itens[i];
      var ult = brutas[brutas.length - 1];
      var tol = Math.max(1.6, it.tamanho * 0.45);
      if (ult && Math.abs(ult.yRef - it.yTop) <= tol) ult.itens.push(it);
      else brutas.push({ yRef: it.yTop, itens: [it] });
    }
    var linhas = [];
    for (var j = 0; j < brutas.length; j++) {
      var partes = calha ? dividirNaCalha(brutas[j], calha) : [brutas[j]];
      for (var k = 0; k < partes.length; k++) {
        var l = fecharLinha(partes[k]);
        if (l) linhas.push(l);
      }
    }
    return linhas;
  }

  // Uma linha só é cortada na calha se existir mesmo um vão ali. Título ou
  // figura que atravessa a página continua inteiro.
  function dividirNaCalha(bruta, calha) {
    var itens = bruta.itens.slice().sort(function (p, q) { return p.x0 - q.x0; });
    for (var i = 0; i < itens.length - 1; i++) {
      var a = itens[i], b = itens[i + 1];
      if (a.x1 <= calha + 1 && b.x0 >= calha - 1) {
        var vao = b.x0 - a.x1;
        if (vao >= Math.max(6, a.tamanho * 0.9)) {
          return [
            { yRef: bruta.yRef, itens: itens.slice(0, i + 1) },
            { yRef: bruta.yRef, itens: itens.slice(i + 1) }
          ];
        }
      }
    }
    return [bruta];
  }

  function fecharLinha(bruta) {
    var itens = bruta.itens.sort(function (p, q) { return p.x0 - q.x0; });
    var texto = '';
    var ant = null;
    var tamanhos = [];
    for (var i = 0; i < itens.length; i++) {
      var it = itens[i];
      tamanhos.push(it.tamanho);
      if (ant) {
        var vao = it.x0 - ant.x1;
        if (vao > ant.tamanho * 0.2 && !/\s$/.test(texto) && !/^\s/.test(it.str)) texto += ' ';
      }
      texto += it.str;
      ant = it;
    }
    texto = texto.replace(/\s+/g, ' ').trim();
    if (!texto) return null;
    return {
      texto: texto,
      x0: itens[0].x0,
      x1: itens[itens.length - 1].x1,
      yRef: bruta.yRef,
      tamanho: mediana(tamanhos)
    };
  }

  /* ---------- 4. ordem de leitura ---------- */
  function ordenarLinhas(linhas, calha) {
    var porY = function (a, b) { return (a.yRef - b.yRef) || (a.x0 - b.x0); };
    var ordenadas = linhas.slice().sort(porY);
    if (!calha) {
      medirColuna(ordenadas);
      return ordenadas;
    }
    var saida = [];
    var buffer = [];
    function despejar() {
      if (!buffer.length) return;
      var esq = buffer.filter(function (l) { return l.x1 <= calha + 1; }).sort(porY);
      var dir = buffer.filter(function (l) { return l.x1 > calha + 1; }).sort(porY);
      medirColuna(esq);
      medirColuna(dir);
      saida = saida.concat(esq, dir);
      buffer = [];
    }
    for (var i = 0; i < ordenadas.length; i++) {
      var l = ordenadas[i];
      var atravessa = l.x0 < calha - 1 && l.x1 > calha + 1;
      if (atravessa) { despejar(); medirColuna([l], ordenadas); saida.push(l); }
      else buffer.push(l);
    }
    despejar();
    return saida;
  }

  // limites da coluna: usados para saber se a linha terminou cedo (fim de
  // parágrafo) e se ela está centralizada (título)
  function medirColuna(alvo, contexto) {
    var base = contexto || alvo;
    if (!base.length || !alvo.length) return;
    var esquerdas = base.map(function (l) { return l.x0; }).sort(function (a, b) { return a - b; });
    var direitas = base.map(function (l) { return l.x1; }).sort(function (a, b) { return a - b; });
    var colEsq = esquerdas[Math.floor(esquerdas.length * 0.1)];
    var colDir = direitas[Math.floor(direitas.length * 0.9)];
    for (var i = 0; i < alvo.length; i++) {
      var l = alvo[i];
      l.margemEsq = colEsq;
      l.margemDir = colDir;
      var folgaE = l.x0 - colEsq, folgaD = colDir - l.x1;
      l.centralizada = folgaE > l.tamanho * 1.5 && folgaD > l.tamanho * 1.5 &&
        Math.abs(folgaE - folgaD) < Math.max(l.tamanho * 3, (colDir - colEsq) * 0.08);
    }
  }

  /* ---------- 5. cabeçalho / rodapé repetidos ---------- */
  function chavesBorda(texto) {
    var n = normalizar(texto);
    var ch = [n];
    if (n.length >= 20) ch.push('~' + n.slice(0, 20));  // pega o caso de o
    return ch;                                          // cabeçalho vir partido
  }                                                     // em uma página e inteiro em outra

  function marcarMobiliario(paginas) {
    var contagem = {};
    paginas.forEach(function (pg) {
      var vistos = {};
      pg.linhas.forEach(function (l) {
        if (!l.zonaBorda) return;
        chavesBorda(l.texto).forEach(function (k) {
          if (k.length < 3 || vistos[k]) return;
          vistos[k] = 1;
          contagem[k] = (contagem[k] || 0) + 1;
        });
      });
    });
    var limite = Math.max(2, Math.ceil(paginas.length * 0.35));
    paginas.forEach(function (pg) {
      pg.linhas.forEach(function (l) {
        if (!l.zonaBorda) return;
        if (RE_SO_NUMERO.test(l.texto) && l.texto.length < 12) { l.mobiliario = true; return; }
        var n = normalizar(l.texto);
        if (/^p[áa]gina\s*#|^page\s*#|^#\s*(de|of)\s*#$/.test(n)) { l.mobiliario = true; return; }
        if (paginas.length < 2) return;
        var repetida = chavesBorda(l.texto).some(function (k) { return contagem[k] >= limite; });
        if (repetida) l.mobiliario = true;
      });
    });
  }

  /* ---------- 6. linhas -> blocos ---------- */
  function ehQuebra(ant, cur, corpo) {
    if (!ant) return true;
    var dy = cur.yRef - ant.yRef;
    var lh = Math.max(ant.tamanho, cur.tamanho);
    // virada de página ou de coluna: o parágrafo continua se a linha anterior
    // foi até a margem e não fechou a frase
    if (cur.pagina !== ant.pagina || dy < -lh) {
      if (Math.abs(cur.tamanho - ant.tamanho) > lh * 0.14) return true;
      var terminou = /[.!?:;»”"']\s*$/.test(ant.texto);
      return terminou || ant.x1 < ant.margemDir - ant.tamanho * 2.2;
    }
    if (dy > lh * 1.9) return true;                              // espaço vertical grande
    if (Math.abs(cur.tamanho - ant.tamanho) > lh * 0.14) return true; // mudou o corpo da fonte
    if (ant.centralizada && cur.centralizada) return false;       // título centralizado em duas linhas
    if (corpo && ant.tamanho >= corpo * 1.06) return false;       // título/seção que ocupa mais de uma linha
    if (ant.x1 < ant.margemDir - ant.tamanho * 2.2) return true;  // linha curta = fim do parágrafo
    if (cur.x0 > ant.x0 + ant.tamanho * 0.9) return true;         // recuo de primeira linha
    if (/^\s*[•▪◦\-–—]\s+/.test(cur.texto)) return true;          // item de lista
    if (cur.texto.length < 90 && /^\(?\d+(\.\d+)*[.)]?\s+\p{Lu}/u.test(cur.texto)) return true; // "2.1 Material e Métodos"
    return false;
  }

  function juntarLinhas(linhas) {
    var texto = '';
    for (var i = 0; i < linhas.length; i++) {
      var t = linhas[i].texto;
      if (!texto) { texto = t; continue; }
      // palavra quebrada por hífen no fim da linha
      if (/[\p{Ll}\p{Lu}]-$/u.test(texto) && /^[\p{Ll}]/u.test(t)) texto = texto.slice(0, -1) + t;
      else texto += ' ' + t;
    }
    return texto.replace(/\s+/g, ' ').trim();
  }

  function corpoDaFonte(linhas) {
    var peso = {};
    linhas.forEach(function (l) {
      var k = (Math.round(l.tamanho * 2) / 2).toFixed(1);
      peso[k] = (peso[k] || 0) + l.texto.length;
    });
    var melhorK = 0, melhorV = -1;
    Object.keys(peso).forEach(function (k) {
      if (peso[k] > melhorV) { melhorV = peso[k]; melhorK = parseFloat(k); }
    });
    return melhorK || 10;
  }

  function classificar(bloco, corpo) {
    var t = bloco.texto;
    if (RE_LEGENDA.test(t)) return 'legenda';
    if (bloco.tamanho >= corpo * 1.06 && t.length < 220) return 'titulo';
    if (t.length < 90 && /^\(?\d+(\.\d+)*[.)]?\s+\p{Lu}/u.test(t)) return 'titulo';
    if (t.length < 60 && RE_REFERENCIAS.test(t)) return 'titulo';
    if (t.length < 70 && /^(abstract|resumo|introdu[çc][ãa]o|introduction|conclus|discuss|resultados?|results?|m[ée]todos?|methods?|material)/i.test(t)) return 'titulo';
    if (bloco.tamanho <= corpo * 0.86) return 'nota';
    return 'paragrafo';
  }

  /* ---------- 7. extração completa ---------- */
  async function extrairDocumento(pdf, aoProgredir) {
    var paginas = [];
    for (var n = 1; n <= pdf.numPages; n++) {
      var page = await pdf.getPage(n);
      var vp = page.getViewport({ scale: 1 });
      var content = await page.getTextContent();
      var itens = lerItens(content, vp.height);
      var calha = detectarCalha(itens, vp.width);
      var linhas = agruparLinhas(itens, calha);
      linhas.forEach(function (l) {
        l.pagina = n;
        l.zonaBorda = (l.yRef <= vp.height * ZONA_TOPO) || (l.yRef >= vp.height * (1 - ZONA_RODAPE));
      });
      paginas.push({ numero: n, linhas: ordenarLinhas(linhas, calha), duasColunas: !!calha });
      if (page.cleanup) page.cleanup();
      if (aoProgredir) aoProgredir(n, pdf.numPages);
    }

    marcarMobiliario(paginas);

    var fluxo = [];
    paginas.forEach(function (pg) {
      pg.linhas.forEach(function (l) { if (!l.mobiliario) fluxo.push(l); });
    });

    var corpo = corpoDaFonte(fluxo);

    var blocos = [];
    var atual = null;
    for (var i = 0; i < fluxo.length; i++) {
      var l = fluxo[i];
      var ant = i > 0 ? fluxo[i - 1] : null;
      if (!atual || ehQuebra(ant, l, corpo)) {
        atual = { linhas: [l], pagina: l.pagina };
        blocos.push(atual);
      } else {
        atual.linhas.push(l);
      }
    }

    var saida = [];
    var secao = 'corpo';
    blocos.forEach(function (b) {
      b.texto = juntarLinhas(b.linhas);
      b.tamanho = mediana(b.linhas.map(function (l) { return l.tamanho; }));
      if (!b.texto || b.texto.length < 3) return;
      if (RE_SO_NUMERO.test(b.texto) && b.texto.length < 8) return;
      var tipo = classificar(b, corpo);
      if (tipo === 'titulo' && RE_REFERENCIAS.test(b.texto)) secao = 'referencias';
      saida.push({
        id: saida.length,
        pagina: b.pagina,
        tipo: tipo,
        secao: secao,
        texto: b.texto
      });
    });

    var titulo = '';
    for (var k = 0; k < saida.length && k < 6; k++) {
      if (saida[k].pagina === 1 && saida[k].tipo === 'titulo' && saida[k].texto.length > 12) {
        titulo = saida[k].texto; break;
      }
    }

    var palavras = saida.reduce(function (acc, b) { return acc + b.texto.split(/\s+/).length; }, 0);

    return {
      blocos: saida,
      meta: {
        paginas: pdf.numPages,
        palavras: palavras,
        titulo: titulo,
        duasColunas: paginas.filter(function (p) { return p.duasColunas; }).length > paginas.length / 2,
        corpoFonte: corpo
      }
    };
  }

  return {
    extrairDocumento: extrairDocumento,
    // exportados para teste
    _agruparLinhas: agruparLinhas,
    _lerItens: lerItens,
    _detectarCalha: detectarCalha,
    _ordenarLinhas: ordenarLinhas,
    _juntarLinhas: juntarLinhas
  };
});
