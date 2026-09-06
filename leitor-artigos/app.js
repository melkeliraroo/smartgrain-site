/*!
 * SmartGrain — Leitor de Artigos
 * app.js — interface, reprodução em voz e memória do documento.
 */
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var sintese = window.speechSynthesis;

  /* ================== estado ================== */
  var S = {
    doc: null,          // { id, nome, blocos, meta, origem }
    vista: [],          // blocos filtrados prontos para leitura
    bi: 0, ti: 0,       // bloco atual / trecho atual
    tocando: false,
    origem: 'pt',
    idioma: 'pt',       // idioma da leitura
    voz: null,
    velocidade: 1,
    modo: 'leitura',
    opcoes: { citacoes: true, legendas: true, notas: false, referencias: false },
    tradutor: { provedor: 'google', email: '', endpoint: '', chave: '' },
    charsTotal: 0,
    charsAntes: [],
    token: 0,
    fila: false,
    geracao: 0,
    guarda: null,
    manterVivo: null
  };

  var PREF = 'sg-leitor-pref';

  /* ================== armazenamento local ================== */
  var BD = (function () {
    var db = null;
    function abrir() {
      return new Promise(function (ok, falha) {
        if (db) return ok(db);
        if (!window.indexedDB) return falha(new Error('sem IndexedDB'));
        var req = indexedDB.open('sg-leitor', 1);
        req.onupgradeneeded = function (e) {
          var d = e.target.result;
          if (!d.objectStoreNames.contains('docs')) d.createObjectStore('docs', { keyPath: 'id' });
          if (!d.objectStoreNames.contains('trad')) d.createObjectStore('trad', { keyPath: 'id' });
        };
        req.onsuccess = function () { db = req.result; ok(db); };
        req.onerror = function () { falha(req.error); };
      });
    }
    function op(loja, modo, fn) {
      return abrir().then(function (d) {
        return new Promise(function (ok, falha) {
          var tx = d.transaction(loja, modo);
          var req = fn(tx.objectStore(loja));
          req.onsuccess = function () { ok(req.result); };
          req.onerror = function () { falha(req.error); };
        });
      });
    }
    return {
      salvar: function (loja, valor) { return op(loja, 'readwrite', function (s) { return s.put(valor); }); },
      ler: function (loja, id) { return op(loja, 'readonly', function (s) { return s.get(id); }); },
      todos: function (loja) { return op(loja, 'readonly', function (s) { return s.getAll(); }); },
      apagar: function (loja, id) { return op(loja, 'readwrite', function (s) { return s.delete(id); }); }
    };
  })();

  function lerPrefs() {
    try {
      var p = JSON.parse(localStorage.getItem(PREF) || '{}');
      if (p.idioma) S.idioma = p.idioma;
      if (p.velocidade) S.velocidade = p.velocidade;
      if (p.modo) S.modo = p.modo;
      if (p.opcoes) S.opcoes = Object.assign(S.opcoes, p.opcoes);
      if (p.tradutor) S.tradutor = Object.assign(S.tradutor, p.tradutor);
      S.vozNome = p.vozNome || '';
    } catch (e) { /* primeira visita */ }
  }
  function gravarPrefs() {
    try {
      localStorage.setItem(PREF, JSON.stringify({
        idioma: S.idioma, velocidade: S.velocidade, modo: S.modo,
        opcoes: S.opcoes, tradutor: S.tradutor,
        vozNome: S.voz ? S.voz.name : (S.vozNome || '')
      }));
    } catch (e) { /* modo privado */ }
  }

  /* ================== utilidades ================== */
  function fmtTempo(seg) {
    if (!isFinite(seg) || seg < 0) seg = 0;
    var h = Math.floor(seg / 3600), m = Math.floor((seg % 3600) / 60), s = Math.round(seg % 60);
    if (h) return h + ' h ' + (m < 10 ? '0' : '') + m + ' min';
    if (m) return m + ' min';
    return s + ' s';
  }
  function esc(t) {
    return String(t).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function avisar(el, texto, erro) {
    el.textContent = texto || '';
    el.classList.toggle('on', !!texto);
    el.classList.toggle('erro', !!erro);
  }

  /* ================== abertura do PDF ================== */
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'vendor/pdfjs/pdf.worker.min.js';

  async function abrirArquivo(file) {
    if (!file) return;
    if (!/\.pdf$/i.test(file.name) && file.type !== 'application/pdf') {
      alert('Por enquanto o leitor abre apenas arquivos PDF.');
      return;
    }
    pararTudo();
    $('carregando').classList.add('on');
    progressoExtracao(0, 'Abrindo o arquivo…');

    try {
      var buffer = await file.arrayBuffer();
      var tarefa = pdfjsLib.getDocument({ data: new Uint8Array(buffer), isEvalSupported: false });
      tarefa.onPassword = function (retomar, motivo) {
        var senha = prompt(motivo === 1 ? 'Este PDF tem senha. Digite a senha:' : 'Senha incorreta. Tente novamente:');
        if (senha === null) { tarefa.destroy(); throw new Error('cancelado'); }
        retomar(senha);
      };
      var pdf = await tarefa.promise;

      var resultado = await SGExtract.extrairDocumento(pdf, function (n, total) {
        progressoExtracao(n / total, 'Lendo página ' + n + ' de ' + total + '…');
      });

      if (!resultado.blocos.length) {
        $('carregando').classList.remove('on');
        alert('Não encontrei texto neste PDF. Provavelmente ele é uma imagem digitalizada — ' +
              'nesse caso é preciso passar um OCR no arquivo antes (por exemplo, no próprio Acrobat: ' +
              '"Reconhecer texto").');
        return;
      }

      var texto = resultado.blocos.map(function (b) { return b.texto; }).join('\n');
      var det = SGTexto.detectarIdioma(texto);

      var doc = {
        id: file.name + '|' + file.size + '|' + resultado.meta.paginas,
        nome: file.name,
        blocos: resultado.blocos,
        meta: resultado.meta,
        origem: det.idioma,
        criadoEm: Date.now(),
        posicao: { bi: 0, ti: 0 }
      };
      await guardarDoc(doc);
      carregarDoc(doc);
    } catch (e) {
      if (e && e.message === 'cancelado') { $('carregando').classList.remove('on'); return; }
      console.error(e);
      alert('Não consegui ler este PDF: ' + (e && e.message ? e.message : e));
    } finally {
      $('carregando').classList.remove('on');
    }
  }

  function progressoExtracao(fracao, rotulo) {
    $('barraCarregando').style.width = Math.round(fracao * 100) + '%';
    $('pctCarregando').textContent = Math.round(fracao * 100) + '%';
    $('rotuloCarregando').firstElementChild.textContent = rotulo;
  }

  async function guardarDoc(doc) {
    try {
      await BD.salvar('docs', doc);
      var todos = await BD.todos('docs');
      todos.sort(function (a, b) { return (b.criadoEm || 0) - (a.criadoEm || 0); });
      for (var i = 12; i < todos.length; i++) {
        await BD.apagar('docs', todos[i].id);
        await BD.apagar('trad', todos[i].id + '|pt');
        await BD.apagar('trad', todos[i].id + '|en');
      }
    } catch (e) { console.warn('sem armazenamento local', e); }
  }

  /* ================== montagem da leitura ================== */
  function carregarDoc(doc) {
    S.doc = doc;
    S.origem = doc.origem || 'pt';
    var pos = posGuardada(doc.id) || doc.posicao || {};
    S.bi = pos.bi || 0;
    S.ti = pos.ti || 0;

    $('painel').classList.add('on');
    $('player').classList.add('on');
    $('docTitulo').textContent = doc.meta.titulo || doc.nome;
    $('docMeta').textContent = doc.nome + ' · ' + doc.meta.paginas + ' pág. · ' +
      doc.meta.palavras.toLocaleString('pt-BR') + ' palavras' +
      (doc.meta.duasColunas ? ' · duas colunas' : '');
    $('idiomaDetectado').textContent = S.origem === 'pt' ? 'português' : 'inglês';
    montarVista();
    document.title = (doc.meta.titulo || doc.nome).slice(0, 60) + ' — Leitor SmartGrain';
    $('areaTexto').scrollIntoView({ block: 'start' });
  }

  function montarVista() {
    var o = S.opcoes;
    S.vista = S.doc.blocos.filter(function (b) {
      if (b.secao === 'referencias' && !o.referencias) return false;
      if (b.tipo === 'nota' && !o.notas) return false;
      if (b.tipo === 'legenda' && !o.legendas) return false;
      return true;
    }).map(function (b) {
      var limpo = SGTexto.limpar(b.texto, { citacoes: o.citacoes });
      return {
        id: b.id, tipo: b.tipo, secao: b.secao, pagina: b.pagina,
        original: b.texto, limpo: limpo,
        lido: null, trechos: null, estado: 'pendente', erro: ''
      };
    }).filter(function (v) { return v.limpo.length > 1; });

    S.charsAntes = [];
    S.charsTotal = 0;
    S.vista.forEach(function (v, i) {
      v.mostraPagina = (i === 0) || (S.vista[i - 1].pagina !== v.pagina);
      S.charsAntes.push(S.charsTotal);
      S.charsTotal += v.limpo.length;
    });

    if (S.bi >= S.vista.length) { S.bi = 0; S.ti = 0; }
    renderTudo();
    renderSumario();
    atualizarPlayer();
    prepararProximos();
  }

  function precisaTraduzir() { return S.idioma !== S.origem; }

  async function prepararBloco(i) {
    var v = S.vista[i];
    if (!v || v.estado === 'pronto') return v;
    if (v.estado === 'traduzindo') return v.promessa;

    if (!precisaTraduzir()) {
      v.lido = v.limpo;
      v.trechos = trechosDe(v.lido);
      v.estado = 'pronto';
      renderBloco(i);
      return v;
    }

    var idiomaPedido = S.idioma, origemPedida = S.origem;
    var cacheChave = S.doc.id + '|' + idiomaPedido;
    var atual = function () { return S.idioma === idiomaPedido && S.origem === origemPedida; };
    v.estado = 'traduzindo';
    renderBloco(i);
    v.promessa = (async function () {
      try {
        var guardado = await lerCache(cacheChave, v.id);
        var texto;
        if (guardado) texto = guardado;
        else {
          var r = await SGTraducao.traduzir(v.limpo, origemPedida, idiomaPedido, S.tradutor);
          texto = r.texto;
          gravarCache(cacheChave, v.id, texto);
        }
        if (!atual()) return v;   // o usuário trocou de idioma no meio do caminho
        v.lido = texto;
        v.trechos = trechosDe(texto);
        v.estado = 'pronto';
        avisar($('avisoTraducao'), '');
      } catch (e) {
        if (!atual()) return v;
        v.estado = 'erro';
        v.erro = e.message || String(e);
        v.lido = v.limpo;
        v.trechos = trechosDe(v.limpo);
        avisar($('avisoTraducao'),
          'A tradução falhou (' + v.erro + '). Verifique a conexão ou troque o serviço de tradução em "Serviço de tradução". ' +
          'Enquanto isso, o texto continua sendo lido no idioma original.', true);
      }
      renderBloco(i);
      return v;
    })();
    return v.promessa;
  }

  function trechosDe(texto) {
    var falado = SGTexto.pronunciar(texto, S.idioma);
    return SGTexto.agruparTrechos(SGTexto.dividirFrases(falado), 200);
  }

  var cacheMem = {};
  async function lerCache(chave, blocoId) {
    if (cacheMem[chave] && cacheMem[chave][blocoId] !== undefined) return cacheMem[chave][blocoId];
    try {
      var reg = await BD.ler('trad', chave);
      cacheMem[chave] = (reg && reg.mapa) || {};
      return cacheMem[chave][blocoId];
    } catch (e) { cacheMem[chave] = cacheMem[chave] || {}; return undefined; }
  }
  var gravacaoPendente = null;
  function gravarCache(chave, blocoId, texto) {
    cacheMem[chave] = cacheMem[chave] || {};
    cacheMem[chave][blocoId] = texto;
    clearTimeout(gravacaoPendente);
    gravacaoPendente = setTimeout(function () {
      BD.salvar('trad', { id: chave, mapa: cacheMem[chave] }).catch(function () {});
    }, 1200);
  }

  // traduz alguns blocos à frente para a leitura não engasgar.
  // A geração faz o laço recomeçar quando o idioma ou a posição mudam.
  async function prepararProximos() {
    S.geracao = (S.geracao || 0) + 1;
    if (S.fila) return;
    S.fila = true;
    try {
      var voltas = 0;
      while (voltas++ < 50) {
        var minha = S.geracao;
        for (var k = 0; k < 4; k++) {
          if (S.geracao !== minha) break;
          var i = S.bi + k;
          if (i >= S.vista.length) break;
          if (S.vista[i].estado === 'pendente') await prepararBloco(i);
        }
        if (S.geracao === minha) break;
      }
    } finally { S.fila = false; }
  }

  /* ================== renderização ================== */
  function renderTudo() {
    var alvo = $('texto');
    alvo.innerHTML = '';
    S.vista.forEach(function (v, i) {
      var p = document.createElement('p');
      p.className = classeBloco(v);
      p.dataset.i = i;
      alvo.appendChild(p);
      renderBloco(i);
    });
  }

  function classeBloco(v) {
    var c = ['b'];
    if (v.tipo === 'titulo') c.push('t');
    if (v.tipo === 'nota') c.push('n');
    if (v.tipo === 'legenda') c.push('l');
    if (v.secao === 'referencias') c.push('ref');
    return c.join(' ');
  }

  function renderBloco(i) {
    var v = S.vista[i];
    var p = $('texto').querySelector('[data-i="' + i + '"]');
    if (!v || !p) return;
    var html = v.mostraPagina ? '<span class="selo-pag" aria-hidden="true">p.' + v.pagina + '</span>' : '';

    var mostraOriginal = (S.modo === 'original') || (S.modo === 'bilingue');
    var mostraLido = (S.modo !== 'original');

    if (mostraLido) {
      if (v.estado === 'pronto' && v.trechos) {
        html += v.trechos.map(function (t, k) {
          return '<span class="tr" data-t="' + k + '">' + esc(t) + '</span>';
        }).join(' ');
      } else if (v.estado === 'traduzindo') {
        html += '<span class="traduzindo">traduzindo…</span> ' + esc(v.limpo);
      } else {
        html += esc(v.limpo);
      }
    }
    if (mostraOriginal && (S.modo === 'original' || precisaTraduzir())) {
      html += (S.modo === 'original' ? esc(v.original) : '<span class="orig">' + esc(v.original) + '</span>');
    }
    p.innerHTML = html;
    p.className = classeBloco(v);
    if (i === S.bi) marcarAtual();
  }

  function renderSumario() {
    var alvo = $('sumario');
    alvo.innerHTML = '';
    var achou = false;
    S.vista.forEach(function (v, i) {
      if (v.tipo !== 'titulo') return;
      achou = true;
      var b = document.createElement('button');
      b.type = 'button';
      b.dataset.i = i;
      b.textContent = v.limpo.slice(0, 70);
      b.addEventListener('click', function () { irPara(i, 0, S.tocando); });
      alvo.appendChild(b);
    });
    if (!achou) alvo.innerHTML = '<p class="dica">Este PDF não tem títulos de seção reconhecíveis.</p>';
  }

  function marcarAtual() {
    var area = $('texto');
    var anterior = area.querySelectorAll('.tocando');
    for (var i = 0; i < anterior.length; i++) anterior[i].classList.remove('tocando');
    var p = area.querySelector('[data-i="' + S.bi + '"]');
    if (!p) return;
    p.classList.add('tocando');
    var t = p.querySelector('[data-t="' + S.ti + '"]');
    if (t) t.classList.add('tocando');
    var botoes = $('sumario').querySelectorAll('button');
    var atual = null;
    for (var k = 0; k < botoes.length; k++) {
      botoes[k].classList.remove('atual');
      if (parseInt(botoes[k].dataset.i, 10) <= S.bi) atual = botoes[k];
    }
    if (atual) atual.classList.add('atual');
  }

  function rolarAteAtual() {
    var p = $('texto').querySelector('[data-i="' + S.bi + '"]');
    if (!p) return;
    var r = p.getBoundingClientRect();
    var folga = 130;
    if (r.top < folga || r.bottom > window.innerHeight - 120) {
      window.scrollTo({ top: window.scrollY + r.top - folga, behavior: 'smooth' });
    }
  }

  /* ================== reprodução ================== */
  function vozParaIdioma() {
    var vozes = sintese.getVoices() || [];
    return vozes.filter(function (v) { return (v.lang || '').toLowerCase().indexOf(S.idioma) === 0; });
  }

  function carregarVozes() {
    var sel = $('selVoz');
    var lista = vozParaIdioma();
    sel.innerHTML = '';
    if (!lista.length) {
      sel.innerHTML = '<option>nenhuma voz instalada</option>';
      avisar($('avisoVoz'),
        'Seu navegador não tem voz em ' + (S.idioma === 'pt' ? 'português' : 'inglês') + '. ' +
        'No Android, instale/ative em Configurações › Idiomas › Saída de texto para voz. ' +
        'No Windows, em Configurações › Hora e idioma › Voz. Chrome e Edge costumam ter as melhores vozes.', true);
      S.voz = null;
      return;
    }
    avisar($('avisoVoz'), '');
    // preferências: voz salva > pt-BR/en-US > primeira da lista
    var preferida = null;
    lista.forEach(function (v) {
      var op = document.createElement('option');
      op.value = v.name; op.textContent = v.name + ' (' + v.lang + ')';
      sel.appendChild(op);
      if (S.vozNome && v.name === S.vozNome) preferida = v;
    });
    if (!preferida) {
      var alvo = S.idioma === 'pt' ? 'pt-br' : 'en-us';
      preferida = lista.filter(function (v) { return (v.lang || '').toLowerCase().replace('_', '-') === alvo; })[0] || lista[0];
    }
    S.voz = preferida;
    sel.value = preferida.name;
  }

  function falarAtual() {
    var v = S.vista[S.bi];
    if (!v || !v.trechos || !v.trechos[S.ti]) return;
    var texto = v.trechos[S.ti];
    var u = new SpeechSynthesisUtterance(texto);
    u.lang = S.idioma === 'pt' ? 'pt-BR' : 'en-US';
    if (S.voz) u.voice = S.voz;
    u.rate = S.velocidade;
    u.pitch = 1;
    var meu = ++S.token;
    var seguiu = false;
    function seguir() {
      if (seguiu || meu !== S.token) return;
      seguiu = true;
      clearTimeout(S.guarda);
      if (S.tocando) avancar(true);
    }
    u.onend = seguir;
    u.onerror = function (e) {
      if (e && (e.error === 'interrupted' || e.error === 'canceled')) return;
      seguir();
    };
    // alguns navegadores não disparam onend; o relógio garante a continuidade
    var estimado = (texto.length / (14 * S.velocidade)) * 1000 + 2600;
    clearTimeout(S.guarda);
    S.guarda = setTimeout(seguir, estimado);

    sintese.speak(u);
    marcarAtual();
    rolarAteAtual();
    atualizarPlayer();
  }

  async function avancar(automatico) {
    var v = S.vista[S.bi];
    if (v && v.trechos && S.ti + 1 < v.trechos.length) S.ti++;
    else if (S.bi + 1 < S.vista.length) { S.bi++; S.ti = 0; }
    else { pararTudo(); atualizarPlayer(); return; }

    salvarPosicao();
    prepararProximos();
    if (S.vista[S.bi].estado !== 'pronto') {
      atualizarPlayer();
      await prepararBloco(S.bi);
      if (!S.tocando && automatico) return;
    }
    if (S.tocando) falarAtual(); else { marcarAtual(); atualizarPlayer(); }
  }

  function retroceder() {
    if (S.ti > 0) S.ti--;
    else if (S.bi > 0) {
      S.bi--;
      var v = S.vista[S.bi];
      S.ti = v && v.trechos ? Math.max(0, v.trechos.length - 1) : 0;
    }
    salvarPosicao();
    if (S.tocando) { sintese.cancel(); falarAtual(); } else { marcarAtual(); atualizarPlayer(); }
  }

  function pularBloco(passo) {
    var alvo = Math.min(S.vista.length - 1, Math.max(0, S.bi + passo));
    irPara(alvo, 0, S.tocando);
  }

  async function irPara(bi, ti, tocar) {
    if (!S.vista.length) return;
    S.bi = Math.min(S.vista.length - 1, Math.max(0, bi));
    S.ti = ti || 0;
    salvarPosicao();
    marcarAtual();
    atualizarPlayer();
    prepararProximos();
    if (tocar) {
      sintese.cancel();
      S.tocando = true;
      if (S.vista[S.bi].estado !== 'pronto') await prepararBloco(S.bi);
      iconePlay(true);
      falarAtual();
    } else {
      rolarAteAtual();
    }
  }

  async function tocar() {
    if (!S.vista.length) return;
    if (sintese.paused && S.tocando) { sintese.resume(); return; }
    S.tocando = true;
    iconePlay(true);
    manterVivo(true);
    if (S.vista[S.bi].estado !== 'pronto') {
      atualizarPlayer();
      await prepararBloco(S.bi);
    }
    if (!S.tocando) return;
    sintese.cancel();
    falarAtual();
  }

  function pausar() {
    S.tocando = false;
    S.token++;
    clearTimeout(S.guarda);
    sintese.cancel();
    iconePlay(false);
    manterVivo(false);
    atualizarPlayer();
  }

  function pararTudo() {
    S.tocando = false;
    S.token++;
    clearTimeout(S.guarda);
    try { sintese.cancel(); } catch (e) {}
    iconePlay(false);
    manterVivo(false);
  }

  function iconePlay(tocando) {
    $('iconePlay').innerHTML = tocando
      ? '<path d="M6 5h4v14H6zm8 0h4v14h-4z"/>'
      : '<path d="M8 5v14l11-7z"/>';
    $('btnPlay').setAttribute('aria-label', tocando ? 'Pausar' : 'Tocar');
  }

  /* Áudio silencioso: mantém a leitura viva com a tela apagada em parte dos
     celulares e habilita os controles na tela de bloqueio. */
  var SILENCIO = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAgD4AAAB9AAACABAAZGF0YQAAAAA=';
  function manterVivo(ligar) {
    try {
      if (ligar) {
        if (!S.manterVivo) {
          S.manterVivo = new Audio(SILENCIO);
          S.manterVivo.loop = true;
          S.manterVivo.volume = 0.001;
        }
        var p = S.manterVivo.play();
        if (p && p.catch) p.catch(function () {});
        if ('mediaSession' in navigator) {
          navigator.mediaSession.metadata = new MediaMetadata({
            title: (S.doc && (S.doc.meta.titulo || S.doc.nome)) || 'Artigo',
            artist: S.idioma === 'pt' ? 'Leitura em português' : 'Reading in English',
            album: 'SmartGrain — Leitor de Artigos'
          });
          navigator.mediaSession.setActionHandler('play', tocar);
          navigator.mediaSession.setActionHandler('pause', pausar);
          navigator.mediaSession.setActionHandler('previoustrack', function () { pularBloco(-1); });
          navigator.mediaSession.setActionHandler('nexttrack', function () { pularBloco(1); });
        }
      } else if (S.manterVivo) {
        S.manterVivo.pause();
      }
    } catch (e) { /* recurso opcional */ }
  }

  // a posição vai também para o localStorage, que é síncrono: se o aparelho
  // desligar ou a aba fechar no segundo seguinte, a marcação não se perde
  function chavePos(id) { return 'sg-leitor-pos:' + id; }
  function posGuardada(id) {
    try { return JSON.parse(localStorage.getItem(chavePos(id)) || 'null'); } catch (e) { return null; }
  }
  function salvarPosicao() {
    if (!S.doc) return;
    S.doc.posicao = { bi: S.bi, ti: S.ti };
    S.doc.criadoEm = Date.now();
    try { localStorage.setItem(chavePos(S.doc.id), JSON.stringify(S.doc.posicao)); } catch (e) {}
    clearTimeout(salvarPosicao.t);
    salvarPosicao.t = setTimeout(function () { BD.salvar('docs', S.doc).catch(function () {}); }, 800);
  }

  function atualizarPlayer() {
    var v = S.vista[S.bi];
    var lidos = (S.charsAntes[S.bi] || 0);
    if (v && v.trechos && v.trechos.length) {
      lidos += v.limpo.length * (S.ti / v.trechos.length);
    }
    var frac = S.charsTotal ? Math.min(1, lidos / S.charsTotal) : 0;
    $('barraPlayerFill').style.width = (frac * 100).toFixed(1) + '%';
    $('barraPlayer').setAttribute('aria-valuenow', Math.round(frac * 100));

    var restante = (S.charsTotal - lidos) / (14 * S.velocidade);
    $('tituloTocando').textContent = S.doc ? (S.doc.meta.titulo || S.doc.nome) : '—';
    var estado = '';
    if (v && v.estado === 'traduzindo') estado = 'traduzindo… · ';
    $('posicaoTocando').textContent = estado + 'parágrafo ' + (S.bi + 1) + ' de ' + S.vista.length +
      ' · pág. ' + (v ? v.pagina : '—') + ' · faltam ' + fmtTempo(restante);

    $('btnAnterior').disabled = $('btnBlocoAnt').disabled = (S.bi === 0 && S.ti === 0);
    $('btnProximo').disabled = $('btnBlocoProx').disabled = (S.bi >= S.vista.length - 1 &&
      v && v.trechos && S.ti >= v.trechos.length - 1);
  }

  /* ================== biblioteca ================== */
  async function listarRecentes() {
    var alvo = $('listaRecentes');
    try {
      var todos = await BD.todos('docs');
      todos.sort(function (a, b) { return (b.criadoEm || 0) - (a.criadoEm || 0); });
      if (!todos.length) { $('biblioteca').classList.remove('on'); return; }
      alvo.innerHTML = '';
      todos.slice(0, 8).forEach(function (d) {
        var div = document.createElement('div');
        div.className = 'recente';
        var abrir = document.createElement('button');
        abrir.type = 'button';
        var p = posGuardada(d.id) || d.posicao || {};
        var pos = p.bi ? ' · parágrafo ' + (p.bi + 1) : '';
        abrir.innerHTML = '<span class="nome">' + esc(d.meta.titulo || d.nome) + '</span>' +
          '<span class="info">' + d.meta.paginas + ' pág.' + pos + '</span>';
        abrir.addEventListener('click', function () { pararTudo(); carregarDoc(d); });
        var apagar = document.createElement('button');
        apagar.type = 'button';
        apagar.className = 'apagar';
        apagar.title = 'Remover da lista';
        apagar.setAttribute('aria-label', 'Remover ' + (d.meta.titulo || d.nome));
        apagar.textContent = '✕';
        apagar.addEventListener('click', async function () {
          await BD.apagar('docs', d.id);
          await BD.apagar('trad', d.id + '|pt').catch(function () {});
          await BD.apagar('trad', d.id + '|en').catch(function () {});
          try { localStorage.removeItem(chavePos(d.id)); } catch (e) {}
          if (S.doc && S.doc.id === d.id) fecharDoc();
          listarRecentes();
        });
        div.appendChild(abrir);
        div.appendChild(apagar);
        alvo.appendChild(div);
      });
      $('biblioteca').classList.add('on');
    } catch (e) { /* sem armazenamento */ }
  }

  function fecharDoc() {
    pararTudo();
    S.doc = null;
    S.vista = [];
    $('painel').classList.remove('on');
    $('player').classList.remove('on');
    document.title = 'Leitor de Artigos — SmartGrain';
    listarRecentes();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function baixarTxt() {
    if (!S.doc) return;
    var linhas = S.vista.map(function (v) {
      if (S.modo === 'original') return v.original;
      if (S.modo === 'bilingue' && precisaTraduzir()) return (v.lido || v.limpo) + '\n[original] ' + v.original;
      return v.lido || v.limpo;
    });
    var cab = (S.doc.meta.titulo || S.doc.nome) + '\n' + S.doc.nome +
      '\nLeitura em ' + (S.idioma === 'pt' ? 'português' : 'inglês') +
      '\nExtraído com o Leitor de Artigos da SmartGrain\n\n';
    var blob = new Blob([cab + linhas.join('\n\n')], { type: 'text/plain;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = S.doc.nome.replace(/\.pdf$/i, '') + (precisaTraduzir() ? '-' + S.idioma : '') + '.txt';
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }

  /* ================== ligações da interface ================== */
  function trocarIdioma(novo) {
    if (S.idioma === novo) return;
    var tocava = S.tocando;
    pararTudo();
    S.idioma = novo;
    $('chipPT').setAttribute('aria-pressed', String(novo === 'pt'));
    $('chipEN').setAttribute('aria-pressed', String(novo === 'en'));
    carregarVozes();
    gravarPrefs();
    if (S.doc) {
      S.vista.forEach(function (v) { v.estado = 'pendente'; v.lido = null; v.trechos = null; });
      S.ti = 0;
      renderTudo();
      atualizarPlayer();
      prepararProximos().then(function () { if (tocava) tocar(); });
    }
  }

  function ligar() {
    lerPrefs();

    // entrada de arquivo
    $('solta').addEventListener('click', function () { $('arquivo').click(); });
    $('solta').addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); $('arquivo').click(); }
    });
    $('arquivo').addEventListener('change', function (e) {
      if (e.target.files && e.target.files[0]) abrirArquivo(e.target.files[0]);
      e.target.value = '';
    });
    ['dragenter', 'dragover'].forEach(function (ev) {
      $('solta').addEventListener(ev, function (e) { e.preventDefault(); $('solta').classList.add('ativa'); });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      $('solta').addEventListener(ev, function (e) { e.preventDefault(); $('solta').classList.remove('ativa'); });
    });
    $('solta').addEventListener('drop', function (e) {
      if (e.dataTransfer && e.dataTransfer.files[0]) abrirArquivo(e.dataTransfer.files[0]);
    });
    window.addEventListener('dragover', function (e) { e.preventDefault(); });
    window.addEventListener('drop', function (e) { e.preventDefault(); });

    // idioma
    $('chipPT').addEventListener('click', function () { trocarIdioma('pt'); });
    $('chipEN').addEventListener('click', function () { trocarIdioma('en'); });
    $('chipPT').setAttribute('aria-pressed', String(S.idioma === 'pt'));
    $('chipEN').setAttribute('aria-pressed', String(S.idioma === 'en'));
    $('btnTrocarOrigem').addEventListener('click', function () {
      if (!S.doc) return;
      S.origem = S.origem === 'pt' ? 'en' : 'pt';
      S.doc.origem = S.origem;
      $('idiomaDetectado').textContent = S.origem === 'pt' ? 'português' : 'inglês';
      BD.salvar('docs', S.doc).catch(function () {});
      var tocava = S.tocando;
      pararTudo();
      S.vista.forEach(function (v) { v.estado = 'pendente'; v.lido = null; v.trechos = null; });
      renderTudo();
      prepararProximos().then(function () { if (tocava) tocar(); });
    });

    // voz e velocidade
    $('selVoz').addEventListener('change', function (e) {
      var vozes = sintese.getVoices() || [];
      S.voz = vozes.filter(function (v) { return v.name === e.target.value; })[0] || null;
      S.vozNome = e.target.value;
      gravarPrefs();
      if (S.tocando) { sintese.cancel(); falarAtual(); }
    });
    function mudarVelocidade(valor) {
      S.velocidade = parseFloat(valor);
      var rot = S.velocidade.toFixed(1).replace('.', ',') + '×';
      $('velocidadeVal').textContent = rot;
      $('velocidadePlayerVal').textContent = rot;
      $('velocidade').value = S.velocidade;
      $('velocidadePlayer').value = S.velocidade;
      gravarPrefs();
      atualizarPlayer();
      if (S.tocando) { sintese.cancel(); falarAtual(); }
    }
    $('velocidade').addEventListener('change', function (e) { mudarVelocidade(e.target.value); });
    $('velocidadePlayer').addEventListener('change', function (e) { mudarVelocidade(e.target.value); });
    mudarVelocidade(S.velocidade);

    // filtros e exibição
    [['optCitacoes', 'citacoes'], ['optLegendas', 'legendas'], ['optNotas', 'notas'], ['optReferencias', 'referencias']]
      .forEach(function (par) {
        var el = $(par[0]);
        el.checked = !!S.opcoes[par[1]];
        el.addEventListener('change', function () {
          S.opcoes[par[1]] = el.checked;
          gravarPrefs();
          if (!S.doc) return;
          var tocava = S.tocando;
          pararTudo();
          montarVista();
          if (tocava) tocar();
        });
      });
    $('modoVista').value = S.modo;
    $('modoVista').addEventListener('change', function (e) {
      S.modo = e.target.value;
      gravarPrefs();
      renderTudo();
    });

    // tradutor
    $('selProvedor').value = S.tradutor.provedor;
    $('inpEmail').value = S.tradutor.email || '';
    $('inpEndpoint').value = S.tradutor.endpoint || '';
    $('inpChave').value = S.tradutor.chave || '';
    function ajustarCfgTradutor() {
      $('cfgMyMemory').classList.toggle('oculto', S.tradutor.provedor !== 'mymemory');
      $('cfgLibre').classList.toggle('oculto', S.tradutor.provedor !== 'libre');
    }
    $('selProvedor').addEventListener('change', function (e) {
      S.tradutor.provedor = e.target.value; ajustarCfgTradutor(); gravarPrefs();
    });
    ['inpEmail:email', 'inpEndpoint:endpoint', 'inpChave:chave'].forEach(function (par) {
      var p = par.split(':');
      $(p[0]).addEventListener('change', function (e) { S.tradutor[p[1]] = e.target.value.trim(); gravarPrefs(); });
    });
    ajustarCfgTradutor();
    $('btnTestarTraducao').addEventListener('click', async function () {
      $('statusTraducao').textContent = 'testando…';
      try {
        var r = await SGTraducao.testar(S.tradutor);
        $('statusTraducao').textContent = 'ok (' + (SGTraducao.provedores[r.provedor] || {}).nome + '): ' + r.texto;
      } catch (e) {
        $('statusTraducao').textContent = 'falhou: ' + e.message;
      }
    });

    // player
    $('btnPlay').addEventListener('click', function () { S.tocando ? pausar() : tocar(); });
    $('btnProximo').addEventListener('click', function () { avancar(false); });
    $('btnAnterior').addEventListener('click', retroceder);
    $('btnBlocoProx').addEventListener('click', function () { pularBloco(1); });
    $('btnBlocoAnt').addEventListener('click', function () { pularBloco(-1); });
    $('barraPlayer').addEventListener('click', function (e) {
      if (!S.vista.length) return;
      var r = this.getBoundingClientRect();
      var frac = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
      var alvoChars = frac * S.charsTotal;
      var bi = 0;
      for (var i = 0; i < S.vista.length; i++) { if (S.charsAntes[i] <= alvoChars) bi = i; else break; }
      irPara(bi, 0, S.tocando);
    });

    // clique no texto
    $('texto').addEventListener('click', function (e) {
      var span = e.target.closest ? e.target.closest('.tr') : null;
      var p = e.target.closest ? e.target.closest('.b') : null;
      if (!p) return;
      irPara(parseInt(p.dataset.i, 10), span ? parseInt(span.dataset.t, 10) : 0, true);
    });

    // no celular os ajustes começam recolhidos para o texto ficar logo abaixo
    var ajustes = $('btnAjustes');
    function estadoAjustes(aberto) {
      $('controles').classList.toggle('fechado', !aberto);
      ajustes.setAttribute('aria-expanded', String(aberto));
    }
    ajustes.addEventListener('click', function () {
      estadoAjustes(ajustes.getAttribute('aria-expanded') !== 'true');
    });
    estadoAjustes(window.innerWidth > 980);

    $('btnBaixarTxt').addEventListener('click', baixarTxt);
    $('btnFechar').addEventListener('click', fecharDoc);

    // teclado
    document.addEventListener('keydown', function (e) {
      if (!S.doc) return;
      var alvo = e.target.tagName;
      if (alvo === 'INPUT' || alvo === 'SELECT' || alvo === 'TEXTAREA') return;
      // num botão com foco o próprio navegador já dispara o clique
      if (e.code === 'Space' && alvo === 'BUTTON') return;
      if (e.code === 'Space') { e.preventDefault(); S.tocando ? pausar() : tocar(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); e.shiftKey ? pularBloco(1) : avancar(false); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); e.shiftKey ? pularBloco(-1) : retroceder(); }
    });

    // vozes
    carregarVozes();
    if (typeof sintese.onvoiceschanged !== 'undefined') {
      sintese.onvoiceschanged = carregarVozes;
    }

    // Chrome interrompe falas longas: cutucar a fila mantém a leitura andando
    setInterval(function () {
      if (S.tocando && sintese.speaking && !sintese.paused) {
        try { sintese.pause(); sintese.resume(); } catch (e) {}
      }
    }, 9000);

    window.addEventListener('beforeunload', function () { try { sintese.cancel(); } catch (e) {} });

    listarRecentes();

    if ('serviceWorker' in navigator && location.protocol === 'https:') {
      navigator.serviceWorker.register('sw.js').catch(function () {});
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ligar);
  else ligar();
})();
