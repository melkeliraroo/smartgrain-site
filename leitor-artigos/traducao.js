/*!
 * SmartGrain — Leitor de Artigos
 * traducao.js — tradução PT <-> EN direto do navegador.
 *
 * Nenhum servidor próprio: o texto vai do navegador para o serviço de
 * tradução escolhido. Há mais de um provedor porque serviços públicos
 * gratuitos impõem limites; se um falhar, o próximo assume.
 */
(function (global, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else global.SGTraducao = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var LIMITE = { google: 1400, mymemory: 460, libre: 4000 };

  function esperar(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  // divide respeitando frases; só corta no meio se a frase for gigante
  function fatiar(texto, max) {
    var partes = String(texto).split(/(?<=[.!?…])\s+/);
    var out = [];
    var buf = '';
    partes.forEach(function (p) {
      while (p.length > max) {
        var corte = p.lastIndexOf(' ', max);
        if (corte < max * 0.5) corte = max;
        if (buf) { out.push(buf); buf = ''; }
        out.push(p.slice(0, corte));
        p = p.slice(corte).trim();
      }
      if ((buf + ' ' + p).trim().length > max && buf) { out.push(buf.trim()); buf = p; }
      else buf = (buf ? buf + ' ' : '') + p;
    });
    if (buf.trim()) out.push(buf.trim());
    return out.filter(function (x) { return x.length; });
  }

  async function comTempo(url, opcoes, ms) {
    var ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var t = setTimeout(function () { if (ctrl) ctrl.abort(); }, ms || 12000);
    try {
      return await fetch(url, Object.assign({ signal: ctrl ? ctrl.signal : undefined }, opcoes || {}));
    } finally { clearTimeout(t); }
  }

  var PROVEDORES = {
    google: {
      nome: 'Google (público)',
      limite: LIMITE.google,
      traduzir: async function (trecho, de, para) {
        var url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=' +
          de + '&tl=' + para + '&dt=t&q=' + encodeURIComponent(trecho);
        var r = await comTempo(url);
        if (!r.ok) throw new Error('HTTP ' + r.status);
        var j = await r.json();
        if (!j || !j[0]) throw new Error('resposta inesperada');
        return j[0].map(function (x) { return x && x[0] ? x[0] : ''; }).join('');
      }
    },
    mymemory: {
      nome: 'MyMemory',
      limite: LIMITE.mymemory,
      traduzir: async function (trecho, de, para, cfg) {
        var par = (de === 'pt' ? 'pt-BR' : 'en-US') + '|' + (para === 'pt' ? 'pt-BR' : 'en-US');
        var url = 'https://api.mymemory.translated.net/get?q=' + encodeURIComponent(trecho) +
          '&langpair=' + encodeURIComponent(par) +
          (cfg && cfg.email ? '&de=' + encodeURIComponent(cfg.email) : '');
        var r = await comTempo(url);
        if (!r.ok) throw new Error('HTTP ' + r.status);
        var j = await r.json();
        var t = j && j.responseData && j.responseData.translatedText;
        if (!t) throw new Error('resposta vazia');
        if (/MYMEMORY WARNING|QUOTA/i.test(t)) throw new Error('cota diária esgotada');
        return t;
      }
    },
    libre: {
      nome: 'LibreTranslate (seu servidor)',
      limite: LIMITE.libre,
      traduzir: async function (trecho, de, para, cfg) {
        if (!cfg || !cfg.endpoint) throw new Error('endereço do LibreTranslate não configurado');
        var corpo = { q: trecho, source: de, target: para, format: 'text' };
        if (cfg.chave) corpo.api_key = cfg.chave;
        var r = await comTempo(cfg.endpoint.replace(/\/+$/, '') + '/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(corpo)
        });
        if (!r.ok) throw new Error('HTTP ' + r.status);
        var j = await r.json();
        if (!j || !j.translatedText) throw new Error('resposta vazia');
        return j.translatedText;
      }
    }
  };

  function ordemDeTentativa(preferido) {
    var todos = ['google', 'mymemory', 'libre'];
    var lista = [preferido].concat(todos.filter(function (p) { return p !== preferido; }));
    return lista.filter(function (p) { return PROVEDORES[p]; });
  }

  /**
   * Traduz um texto. Devolve { texto, provedor }.
   * cfg: { provedor, email, endpoint, chave, apenasPreferido }
   */
  async function traduzir(texto, de, para, cfg) {
    cfg = cfg || {};
    var limpo = String(texto || '').trim();
    if (!limpo) return { texto: '', provedor: null };
    if (de === para) return { texto: limpo, provedor: null };

    var tentativas = cfg.apenasPreferido ? [cfg.provedor || 'google'] : ordemDeTentativa(cfg.provedor || 'google');
    var ultimoErro = null;

    for (var i = 0; i < tentativas.length; i++) {
      var chave = tentativas[i];
      var prov = PROVEDORES[chave];
      if (chave === 'libre' && !cfg.endpoint) continue;
      try {
        var pedacos = fatiar(limpo, prov.limite);
        var saida = [];
        for (var k = 0; k < pedacos.length; k++) {
          var t = await tentarComRepeticao(prov, pedacos[k], de, para, cfg);
          saida.push(t);
          if (k < pedacos.length - 1) await esperar(120);
        }
        return { texto: saida.join(' ').replace(/\s+/g, ' ').trim(), provedor: chave };
      } catch (e) {
        ultimoErro = e;
      }
    }
    throw new Error('Não foi possível traduzir' + (ultimoErro ? ': ' + ultimoErro.message : '') + '.');
  }

  async function tentarComRepeticao(prov, trecho, de, para, cfg) {
    var espera = 600;
    for (var tentativa = 0; tentativa < 2; tentativa++) {
      try {
        return await prov.traduzir(trecho, de, para, cfg);
      } catch (e) {
        if (tentativa === 1) throw e;
        await esperar(espera);
        espera *= 2;
      }
    }
  }

  async function testar(cfg) {
    var r = await traduzir('A colheita da soja começou.', 'pt', 'en', cfg);
    return r;
  }

  return {
    traduzir: traduzir,
    testar: testar,
    provedores: PROVEDORES,
    _fatiar: fatiar
  };
});
