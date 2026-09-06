/*!
 * SmartGrain — Leitor de Artigos
 * texto.js — preparo do texto para a voz: idioma, limpeza, frases.
 */
(function (global, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else global.SGTexto = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ---------- idioma ---------- */
  var MARCAS_PT = ['de', 'da', 'do', 'que', 'não', 'uma', 'para', 'com', 'como', 'foi', 'são', 'pelo', 'pela', 'dos', 'das', 'mais', 'seu', 'sua', 'entre', 'sobre', 'também', 'ção', 'ções', 'agrícola', 'produção', 'foram', 'este', 'esta'];
  var MARCAS_EN = ['the', 'of', 'and', 'was', 'were', 'with', 'that', 'this', 'from', 'have', 'has', 'been', 'are', 'which', 'their', 'these', 'yield', 'study', 'results', 'between', 'however', 'therefore'];

  function detectarIdioma(texto) {
    var t = ' ' + String(texto).toLowerCase().slice(0, 20000) + ' ';
    function pontuar(marcas) {
      var s = 0;
      for (var i = 0; i < marcas.length; i++) {
        var m = marcas[i].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        var re = new RegExp('[^\\p{L}]' + m + '[^\\p{L}]', 'gu');
        s += (t.match(re) || []).length;
      }
      return s;
    }
    var pt = pontuar(MARCAS_PT);
    var en = pontuar(MARCAS_EN);
    // acentuação típica do português desempata
    var acentos = (t.match(/[ãõçáéíóúâêô]/g) || []).length;
    pt += Math.min(acentos, 400) * 0.35;
    if (pt === 0 && en === 0) return { idioma: 'pt', confianca: 0 };
    var total = pt + en;
    return {
      idioma: pt >= en ? 'pt' : 'en',
      confianca: Math.abs(pt - en) / total
    };
  }

  /* ---------- limpeza antes de traduzir/falar ---------- */
  function limpar(texto, opcoes) {
    opcoes = opcoes || {};
    var t = ' ' + String(texto) + ' ';

    if (opcoes.citacoes !== false) {
      // [12] [1,2] [3-5] [12], (12)
      t = t.replace(/\[\s*\d+(\s*[–—,;-]\s*\d+)*\s*\]/g, ' ');
      // (Silva et al., 2020) (Silva & Souza, 2019; Lima, 2021) (SILVA, 2020)
      t = t.replace(/\((?:[^()]{0,120}?\d{4}[a-z]?)\)/g, function (m) {
        return /\b(et al|and|&|,)\b|\p{Lu}\p{L}+,\s*\d{4}/u.test(m) && /\d{4}/.test(m) ? ' ' : m;
      });
      t = t.replace(/\b(?:et al|e colaboradores)\.?,?\s*\(?\d{4}[a-z]?\)?/gi, ' ');
    }

    // endereços, DOI e e-mails não fazem sentido em áudio
    // preserva a pontuação final da frase ao tirar endereços
    t = t.replace(/https?:\/\/\S*[^\s.,;:)\]]/gi, ' link ')
         .replace(/\bwww\.\S*[^\s.,;:)\]]/gi, ' link ')
         .replace(/\bdoi\s*:?\s*\S*[^\s.,;:)\]]/gi, ' DOI ')
         .replace(/\b[\w.+-]+@[\w.-]+\.\w{2,}\b/g, ' e-mail ');

    // resíduos de diagramação
    t = t.replace(/­/g, '')          // hífen invisível
         .replace(/[•▪◦]/g, ' ')
         .replace(/\s*\|\s*/g, ' ')
         .replace(/\.{3,}/g, '. ');

    t = t.replace(/\s+/g, ' ')
         .replace(/\s+([,.;:!?%])/g, '$1')
         .replace(/\(\s*\)/g, ' ')
         .replace(/\s+/g, ' ')
         .trim();
    return t;
  }

  /* ---------- ajustes finais de pronúncia, no idioma da leitura ---------- */
  var TROCAS = {
    pt: [
      [/\bet\s+al\.?/gi, 'e colaboradores'],
      [/\bFigs?\./gi, 'Figura'],
      [/\bTabs?\./gi, 'Tabela'],
      [/\bEq\./gi, 'Equação'],
      [/\bp\.\s*ex\./gi, 'por exemplo'],
      [/\bi\.\s*e\./gi, 'ou seja'],
      [/\be\.\s*g\./gi, 'por exemplo'],
      [/\bvs\.?/gi, 'versus'],
      [/\bca\.\s/gi, 'aproximadamente '],
      [/\bn\.?\s*[º°]\s*/gi, 'número '],
      [/(\d)\s*%/g, '$1 por cento'],
      [/(\d)\s*°\s*C/g, '$1 graus Celsius'],
      [/\bkg\s*ha\s*-?\s*1\b/gi, 'quilos por hectare'],
      [/\bt\s*ha\s*-?\s*1\b/gi, 'toneladas por hectare'],
      [/\bmm\b/g, 'milímetros'],
      [/\bha\b/g, 'hectares']
    ],
    en: [
      [/\bet\s+al\.?/gi, 'and colleagues'],
      [/\bFigs?\./gi, 'Figure'],
      [/\bTabs?\./gi, 'Table'],
      [/\bEq\./gi, 'Equation'],
      [/\bi\.\s*e\./gi, 'that is'],
      [/\be\.\s*g\./gi, 'for example'],
      [/\bvs\.?/gi, 'versus'],
      [/\bca\.\s/gi, 'approximately '],
      [/(\d)\s*%/g, '$1 percent'],
      [/(\d)\s*°\s*C/g, '$1 degrees Celsius'],
      [/\bkg\s*ha\s*-?\s*1\b/gi, 'kilograms per hectare'],
      [/\bt\s*ha\s*-?\s*1\b/gi, 'tonnes per hectare'],
      [/\bmm\b/g, 'millimeters'],
      [/\bha\b/g, 'hectares']
    ]
  };

  function pronunciar(texto, idioma) {
    var regras = TROCAS[idioma] || TROCAS.pt;
    var t = ' ' + String(texto) + ' ';
    for (var i = 0; i < regras.length; i++) t = t.replace(regras[i][0], regras[i][1]);
    return t.replace(/\s+/g, ' ').replace(/\s+([,.;:!?])/g, '$1').trim();
  }

  /* ---------- divisão em frases ---------- */
  var ABREV = /(?:^|[\s(])(?:[A-ZÁÉÍÓÚÂÊÔÃÕÇ]|dr|dra|prof|profa|sr|sra|fig|figs|tab|tabs|eq|no|nº|vs|etc|al|cf|ed|eds|inc|ltd|jr|st|pp|p|ex|op|cit|approx|art|min|max|seg|hab|univ|dept|est|av|resp)\.$/i;

  function dividirFrases(texto) {
    var t = String(texto).trim();
    if (!t) return [];
    var frases = [];
    var atual = '';
    for (var i = 0; i < t.length; i++) {
      var c = t[i];
      atual += c;
      if (c !== '.' && c !== '!' && c !== '?' && c !== '…') continue;
      var prox = t[i + 1] || ' ';
      // "3.14", "v. 8", "2.1 Introdução"
      if (c === '.' && /\d/.test(t[i - 1] || '') && /\d/.test(prox)) continue;
      if (!/[\s"'”»)\]]/.test(prox)) continue;
      // pontuação de fechamento colada
      while (/["'”»)\]]/.test(t[i + 1] || '')) { atual += t[i + 1]; i++; }
      if (ABREV.test(atual)) continue;
      frases.push(atual.trim());
      atual = '';
    }
    if (atual.trim()) frases.push(atual.trim());
    return frases;
  }

  // Junta frases curtas em trechos de tamanho confortável para a síntese de voz
  // (trechos longos travam ou são cortados em alguns navegadores).
  function agruparTrechos(frases, maxChars) {
    var max = maxChars || 240;
    var out = [];
    var buf = '';
    frases.forEach(function (f) {
      if (f.length > max * 1.6) {
        if (buf) { out.push(buf); buf = ''; }
        // frase muito longa: quebra em vírgulas / ponto e vírgula
        var partes = f.split(/(?<=[,;:])\s+/);
        var p = '';
        partes.forEach(function (x) {
          if ((p + ' ' + x).trim().length > max && p) { out.push(p.trim()); p = x; }
          else p = (p ? p + ' ' : '') + x;
        });
        if (p.trim()) out.push(p.trim());
        return;
      }
      if ((buf + ' ' + f).trim().length > max && buf) { out.push(buf.trim()); buf = f; }
      else buf = (buf ? buf + ' ' : '') + f;
    });
    if (buf.trim()) out.push(buf.trim());
    return out;
  }

  return {
    detectarIdioma: detectarIdioma,
    limpar: limpar,
    pronunciar: pronunciar,
    dividirFrases: dividirFrases,
    agruparTrechos: agruparTrechos
  };
});
