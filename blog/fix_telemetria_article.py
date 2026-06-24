from pathlib import Path
import json

html_path = Path('telemetria-nao-e-rastreamento.html')
json_path = Path('artigos.json')
text = html_path.read_text(encoding='utf-8')

replacements = [
    (
        '    "headline": "NDVI na soja: como interpretar os mapas e tomar decisões por zona de manejo",\n'
        '    "description": "Aprenda a interpretar corretamente os valores NDVI, definir zonas de manejo e transformar mapas em decisões práticas que aumentam a produtividade da soja.",\n'
        '    "author": [\n'
        '      {"@type":"Person","name":"Melkezedeque Alves Lira","jobTitle":"Co-Fundador e Diretor Técnico"},\n'
        '      {"@type":"Person","name":"Francyeli Aureliano Lira","jobTitle":"Co-Fundadora e Especialista em Agricultura Digital"}\n'
        '    ],\n'
        '    "publisher": {"@type":"Organization","name":"SmartGrain Consultoria Agrícola"},\n'
        '    "datePublished": "2026-06-09",\n'
        '    "articleSection": "NDVI & Agricultura de Precisão",\n'
        '    "keywords": "NDVI, soja, zona de manejo, agricultura de precisão, drone, satélite",\n'
        '    "inLanguage": "pt-BR"\n'
        '  }',
        '    "headline": "Telemetria não é rastreamento: o erro que faz muitos produtores perderem dinheiro",\n'
        '    "description": "Descubra por que telemetria completa vai além da localização e como ela reduz custos, melhora a eficiência e evita desperdícios em campo.",\n'
        '    "author": [\n'
        '      {"@type":"Person","name":"Francyeli Aureliano Lira","jobTitle":"Co-Fundadora e Especialista em Agricultura de Precisão"}\n'
        '    ],\n'
        '    "publisher": {"@type":"Organization","name":"SmartGrain Consultoria Agrícola"},\n'
        '    "datePublished": "2026-06-23",\n'
        '    "articleSection": "Telemetria Agrícola",\n'
        '    "keywords": "telemetria, rastreamento, consumo de combustível, manutenção preventiva, eficiência operacional",\n'
        '    "inLanguage": "pt-BR"\n'
        '  }'
    ),
    (
        '<span>NDVI & Precisão</span>',
        '<span>Telemetria Agrícola</span>'
    ),
    (
        '<div class="art-cat-badge">🛰️ NDVI & Agricultura de Precisão</div>',
        '<div class="art-cat-badge">🛰️ Telemetria Agrícola</div>'
    ),
    (
        '<h1 class="art-hero-title">NDVI na soja: como interpretar os mapas<br/><em>e tomar decisões por zona de manejo</em></h1>',
        '<h1 class="art-hero-title">Telemetria não é rastreamento:<br/><em>o erro que faz muitos produtores perderem dinheiro</em></h1>'
    ),
    (
        '<p class="art-hero-impact">O NDVI funciona como um <strong style="color:var(--dous);">raio-X da lavoura</strong> — mas a grande questão não é obter os mapas, e sim interpretá-los corretamente e transformá-los em decisões práticas que aumentam a produtividade e reduzam custos operacionais.</p>',
        '<p class="art-hero-impact">A telemetria completa vai muito além de saber onde está a máquina. Ela identifica consumo de combustível, tempo ocioso, desempenho do operador e risco de paradas — e é aí que está o verdadeiro valor para a gestão agrícola.</p>'
    ),
    (
        '<div class="meta-item">📅 9 de junho de 2026</div>',
        '<div class="meta-item">📅 23 de junho de 2026</div>'
    ),
    (
        '<div class="meta-item">⏱️ 12 min de leitura</div>',
        '<div class="meta-item">⏱️ 9 min de leitura</div>'
    ),
    (
        '<div class="meta-item">🛰️ NDVI & Precisão</div>',
        '<div class="meta-item">🛰️ Telemetria Agrícola</div>'
    ),
    (
        'https://www.linkedin.com/sharing/share-offsite/?url=https://smartgrain.com.br/blog/ndvi-na-soja-zonas-de-manejo',
        'https://www.linkedin.com/sharing/share-offsite/?url=https://smartgrain.com.br/blog/telemetria-nao-e-rastreamento'
    ),
    (
        'https://wa.me/?text=Leia+este+artigo+da+SmartGrain+sobre+NDVI+na+soja%3A+https://smartgrain.com.br/blog/ndvi-na-soja-zonas-de-manejo',
        'https://wa.me/?text=Leia+este+artigo+da+SmartGrain+sobre+Telemetria+n%C3%A3o+%C3%A9+rastreamento%3A+https://smartgrain.com.br/blog/telemetria-nao-e-rastreamento'
    ),
    (
        'telemetria-soja-interpretar-mapas-zonas-manejo',
        'telemetria-nao-e-rastreamento'
    ),
    (
        'Li o artigo sobre NDVI na soja e gostaria de conversar sobre agricultura de precisão.',
        'Li o artigo sobre telemetria e gostaria de conversar sobre agricultura de precisão.'
    ),
    (
        'Diagnóstico NDVI',
        'Diagnóstico de Telemetria'
    ),
    (
        'Identifique as zonas de manejo da sua lavoura com base em série histórica de satélite.',
        'Monitore a frota e a eficiência operacional com telemetria de máquinas e dados em tempo real.'
    ),
    (
        'https://wa.me/5566992291794?text=Ol%C3%A1!+Li+o+artigo+sobre+NDVI+na+soja+no+blog+da+SmartGrain.',
        'https://wa.me/5566992291794?text=Ol%C3%A1!+Li+o+artigo+sobre+telemetria+no+blog+da+SmartGrain.'
    ),
]

for old, new in replacements:
    text = text.replace(old, new)

old_article = text.split('<article class="art-body">', 1)[1].split('</article>', 1)[0]
new_article = '''
  <article class="art-body">

    <p>Telemetria não é apenas rastreamento. O erro mais comum entre produtores e equipes de campo é tratar telemetria como sinônimo de localização. Se a solução só mostra onde a máquina está, ela entrega apenas uma pequena parte da informação.</p>

    <div class="stat-grid">
      <div class="stat-card"><div class="stat-num">1</div><div class="stat-label">Localização é só o primeiro dado</div></div>
      <div class="stat-card"><div class="stat-num">3</div><div class="stat-label">Grupos de dados críticos: consumo, tempo, desempenho</div></div>
      <div class="stat-card"><div class="stat-num">−25%</div><div class="stat-label">economia potencial com telemetria completa</div></div>
    </div>

    <h2>Por que telemetria não é rastreamento</h2>
    <p>Rastreamento responde à pergunta "onde está a máquina?". A telemetria deve responder "como a máquina está trabalhando?". Localizar um trator em campo não corrige a falta de planejamento de manutenção, nem reduz o consumo excessivo de diesel ou o tempo ocioso.</p>

    <h2>O real valor da telemetria agrícola</h2>
    <p>A telemetria completa captura dados operacionais que, juntos, qualificam a produtividade e os custos reais da máquina. Entre os principais atributos estão:</p>
    <ul>
      <li><strong>Consumo de combustível</strong> por hora de operação e por tarefa.</li>
      <li><strong>Tempo de ociosidade</strong> dentro da janela de trabalho.</li>
      <li><strong>Velocidade média</strong> e padrão de deslocamento em cada talhão.</li>
      <li><strong>Horas de motor ligado</strong> vs. horas de trabalho efetivo.</li>
      <li><strong>Alertas de manutenção</strong> e falhas potenciais antes da parada.</li>
    </ul>

    <div class="pullquote">
      <p>"Telemetria não é uma ferramenta de localização, é um sensor de decisão para reduzir custos e aumentar a eficiência."</p>
    </div>

    <h2>Como a telemetria reduz desperdício</h2>
    <p>Quando o sistema informa apenas a posição, fica impossível responder rapidamente a problemas como:</p>
    <ul>
      <li>máquinas paradas em campo sem ser servidas;</li>
      <li>operações fora do cronograma;</li>
      <li>consumo de combustível acima do esperado;</li>
      <li>diferenças de desempenho entre operadores;</li>
      <li>falhas que poderiam ser evitadas com manutenção preventiva.</li>
    </ul>
    <p>Essas variáveis são as que realmente pesam no custo por hectare e no resultado da safra.</p>

    <div class="svg-block">
      <svg viewBox="0 0 720 220" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block;border-radius:12px;">
  <rect width="720" height="220" fill="#0d2218" rx="12"/>
  <text x="36" y="34" fill="rgba(255,255,255,0.6)" font-size="11" font-family="sans-serif" font-weight="bold" letter-spacing="2">TELEMETRIA AGRÍCOLA — DADOS QUE IMPORTAM</text>
  <rect x="40" y="60" width="192" height="80" rx="12" fill="#1a3a32" stroke="#5aaa28" stroke-width="1.5"/>
  <text x="136" y="88" fill="#5aaa28" font-size="16" font-family="sans-serif" font-weight="bold" text-anchor="middle">Consumo</text>
  <text x="136" y="108" fill="rgba(255,255,255,0.7)" font-size="10" font-family="sans-serif" text-anchor="middle">litros / hora</text>
  <rect x="264" y="60" width="192" height="80" rx="12" fill="#1a3a32" stroke="#e8a020" stroke-width="1.5"/>
  <text x="360" y="88" fill="#e8a020" font-size="16" font-family="sans-serif" font-weight="bold" text-anchor="middle">Tempo</text>
  <text x="360" y="108" fill="rgba(255,255,255,0.7)" font-size="10" font-family="sans-serif" text-anchor="middle">horas trabalhadas</text>
  <rect x="488" y="60" width="192" height="80" rx="12" fill="#1a3a32" stroke="#doul" stroke-width="1.5"/>
  <text x="584" y="88" fill="#doul" font-size="16" font-family="sans-serif" font-weight="bold" text-anchor="middle">Manutenção</text>
  <text x="584" y="108" fill="rgba(255,255,255,0.7)" font-size="10" font-family="sans-serif" text-anchor="middle">alertas e falhas</text>
  <line x1="58" y1="160" x2="662" y2="160" stroke="rgba(255,255,255,0.1)" stroke-width="2"/>
  <text x="58" y="180" fill="rgba(255,255,255,0.5)" font-size="9" font-family="sans-serif">localização</text>
  <text x="220" y="180" fill="rgba(255,255,255,0.5)" font-size="9" font-family="sans-serif">operador</text>
  <text x="382" y="180" fill="rgba(255,255,255,0.5)" font-size="9" font-family="sans-serif">eficiência</text>
  <text x="544" y="180" fill="rgba(255,255,255,0.5)" font-size="9" font-family="sans-serif">custos</text>
</svg>
      <div class="svg-caption">Telemetria foca no desempenho real da máquina: consumo, horas úteis, desempenho de operador e saúde do equipamento.</div>
    </div>

    <h2>Quais perguntas a telemetria deve responder</h2>
    <ul>
      <li>Quanta diesel a máquina consumiu quando estava efetivamente trabalhando?</li>
      <li>Quanto tempo ela ficou parada sem executar tarefa?</li>
      <li>Há diferença de produtividade entre operadores no mesmo dispositivo?</li>
      <li>Qual equipamento exige manutenção antes que a parada ocorra?</li>
      <li>O fluxo de trabalho está alinhado com janelas operacionais e com a logística do talhão?</li>
    </ul>

    <p>Responder essas perguntas transforma a telemetria em um sistema de gestão e não apenas em um mapa.</p>

    <h2>Como usar telemetria de forma inteligente</h2>
    <p>Os dados precisam ser integrados à operação. Um bom projeto de telemetria deve oferecer:</p>
    <ul>
      <li><strong>dashboards claros</strong> para consumo, tempo ocioso e desempenho;</li>
      <li><strong>relatórios semanais</strong> por talhão e por máquina;</li>
      <li><strong>alertas de manutenção preventiva</strong> antes que a máquina pare;</li>
      <li><strong>comparativo entre turnos</strong> e entre operadores;</li>
      <li><strong>indicadores por tipo de tarefa</strong> (soja, pulverização, preparo de solo).</li>
    </ul>

    <div class="callout-box">
      <h3>🔎 O que um produtor deve exigir da telemetria</h3>
      <ul>
        <li>Dados de consumo por hora e por hectare.</li>
        <li>Relatórios de horas efetivas vs. horas de motor ligado.</li>
        <li>Alertas de manutenção antes da falha.</li>
        <li>Análise de desempenho por operador e por máquina.</li>
        <li>Integração com o planejamento de colheita e operação.</li>
      </ul>
    </div>

    <h2>Benefícios práticos para a fazenda</h2>
    <p>Quando a telemetria é usada de verdade, o produtor consegue reduzir o custo operacional e evitar desperdícios:</p>
    <ul>
      <li>menos horas de máquina rodando sem trabalho;</li>
      <li>menos combustível desperdiçado;</li>
      <li>menor risco de parada não planejada;</li>
      <li>melhor alocação de máquinas e operadores;</li>
      <li>decisões mais rápidas com base em dados reais.</li>
    </ul>

    <div class="stat-grid">
      <div class="stat-card"><div class="stat-num">+18%</div><div class="stat-label">melhoria média de eficiência operacional</div></div>
      <div class="stat-card"><div class="stat-num">−22%</div><div class="stat-label">redução média de horas ociosas</div></div>
      <div class="stat-card"><div class="stat-num">+12%</div><div class="stat-label">aumento de confiabilidade da frota</div></div>
    </div>

    <h2>Comece pela telemetria completa</h2>
    <p>Se a telemetria do seu campo só mostra um ponto no mapa, está na hora de evoluir. A telemetria completa entende o que a máquina faz, como ela faz e quanto isso custa.</p>
    <p>No nível certo, a telemetria deixa de ser um recurso de rastreamento e se torna um instrumento de gestão para reduzir custos, evitar perdas e melhorar o resultado da safra.</p>

    <div style="background:var(--vd);border-radius:20px;padding:3rem;margin:3rem 0;position:relative;overflow:hidden;border:1px solid rgba(200,150,12,.25);">
      <div style="position:absolute;inset:0;background:radial-gradient(ellipse 60% 70% at 90% 50%,rgba(200,150,12,.1) 0%,transparent 70%);pointer-events:none;"></div>
      <div style="position:relative;z-index:1;">
        <div style="display:inline-flex;align-items:center;gap:.4rem;background:rgba(200,150,12,.15);border:1px solid rgba(200,150,12,.35);color:var(--dous);font-size:.72rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;padding:.3rem .9rem;border-radius:50px;margin-bottom:1.2rem;">SmartGrain · Telemetria Inteligente</div>
        <h3 style="font-family:Fraunces,serif;font-weight:800;font-size:1.7rem;color:#fff;line-height:1.2;margin-bottom:1rem;margin-top:0;">Sua frota fala. Você está ouvindo?</h3>
        <p style="font-size:1rem;color:rgba(255,255,255,.7);line-height:1.8;max-width:640px;margin-bottom:1rem;">A SmartGrain ajuda a transformar dados de telemetria em decisões práticas: monitoramento de combustível, tempo ocioso, desempenho de operadores e diagnóstico de manutenção.</p>
        <div style="display:flex;gap:1rem;flex-wrap:wrap;align-items:center;margin-top:1.8rem;">
          <a href="../index.html#contato" style="background:var(--dou);color:var(--vd);font-weight:700;font-size:1rem;padding:1rem 2.2rem;border-radius:10px;text-decoration:none;display:inline-flex;align-items:center;gap:.5rem;transition:background .2s,transform .2s;" onmouseover="this.style.background='var(--doul)';this.style.transform='translateY(-2px)'" onmouseout="this.style.background='var(--dou)';this.style.transform='translateY(0)'"><span>Solicitar diagnóstico de telemetria →</span></a>
          <a href="https://wa.me/5566992291794?text=Ol%C3%A1!+Li+o+artigo+sobre+telemetria+no+blog+da+SmartGrain+e+gostaria+de+saber+mais." target="_blank" style="background:rgba(37,211,102,.15);color:#25D366;font-weight:600;font-size:.95rem;padding:1rem 1.8rem;border-radius:10px;text-decoration:none;border:1px solid rgba(37,211,102,.3);display:inline-flex;align-items:center;gap:.5rem;transition:background .2s;" onmouseover="this.style.background='rgba(37,211,102,.25)'" onmouseout="this.style.background='rgba(37,211,102,.15)'"><span>💬 WhatsApp</span></a>
        </div>
      </div>
    </div>

    <div class="art-nav">
      <div id="artNavPrev"></div>
      <div id="artNavNext"></div>
    </div>

    <div class="art-tags">
      <span class="art-tag">Telemetria</span><span class="art-tag">Rastreamento</span>
      <span class="art-tag">Eficiência Operacional</span><span class="art-tag">Consumo de Combustível</span>
      <span class="art-tag">Manutenção Preventiva</span><span class="art-tag">Gestão de Máquinas</span>
      <span class="art-tag">Produtividade</span><span class="art-tag">Custo por Hectare</span>
    </div>

    <div class="referencias">
      <h2>📚 Referências</h2>
      <div class="ref-list">
        <div class="ref-item"><div class="ref-num">1</div><span><strong>Embrapa / Agricultura de Precisão</strong> — Telemetria integrada para gestão de máquinas agrícolas. <em>embrapa.br</em></span></div>
        <div class="ref-item"><div class="ref-num">2</div><span><strong>CNA Brasil</strong> — Redução de custos operacionais com telemetria na agricultura. <em>cnabrasil.org</em></span></div>
        <div class="ref-item"><div class="ref-num">3</div><span><strong>SmartGrain Consultoria</strong> — Estudos de caso em telemetria agrícola. <em>smartgrain.com.br</em></span></div>
        <div class="ref-item"><div class="ref-num">4</div><span><strong>INPE</strong> — Monitoramento da frota e dados operacionais em campo. <em>inpe.br</em></span></div>
        <div class="ref-item"><div class="ref-num">5</div><span><strong>ABIMAQ</strong> — Boletim sobre eficiência e manutenção preditiva em máquinas agrícolas. <em>abimaq.org.br</em></span></div>
        <div class="ref-item"><div class="ref-num">6</div><span><strong>Fazendas conectadas</strong> — Telemetria como ferramenta de gestão e redução de desperdícios. <em>fazendasconectadas.com.br</em></span></div>
      </div>
    </div>

  </article>
'''

if old_article:
    text = text.replace(old_article, new_article)
else:
    raise SystemExit('Could not find original article block to replace')

html_path.write_text(text, encoding='utf-8')

# Update artigos.json
js = json.loads(json_path.read_text(encoding='utf-8'))
entry = {
    "titulo": "Telemetria não é rastreamento: o erro que faz muitos produtores perderem dinheiro",
    "descricao": "Entenda por que usar telemetria apenas para localização é um erro e como a telemetria completa reduz custos, melhora eficiência e evita perdas na lavoura.",
    "categoria": "Telemetria",
    "data": "2026-06-23",
    "tempoLeitura": "9 min",
    "imagem": "imagens/telemetria.png",
    "url": "telemetria-nao-e-rastreamento.html"
}
if not any(item.get('url') == entry['url'] for item in js):
    js.insert(1, entry)
    json_path.write_text(json.dumps(js, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print('Updated artigos.json with new entry')
else:
    print('Entry already exists in artigos.json')
print('Updated HTML article file')
