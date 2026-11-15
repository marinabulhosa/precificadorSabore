
const $ = s => document.querySelector(s), R = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }), N = v => parseFloat(String(v).replace(',', '.')) || 0;
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const F = { g: 1, kg: 1000, ml: 1, L: 1000, un: 1 }, D = { g: 'w', kg: 'w', ml: 'v', L: 'v', un: 'c' }, U = Object.keys(F);
const mk = () => ({ n: '', p: '', q: '', qu: 'kg', u: '', uu: 'g' });
const S = { mat: [mk()], emb: [mk()], name: '', yield: '1', tab: 's', opt: null, st: [{ op: 'mul', v: '2,8' }, { op: 'emb', v: '' }], g: { a: '10', b: '20', c: '5', d: '100', e: 'f' }, h: { h: '', v: '', f: '10', l: '50' }, m: { m: '30', t: '6' }, x: { a1: '', a2: '', b1: '', b2: '', c1: '', c2: '' } };
const get = p => p.split('.').reduce((o, k) => o[k], S);
const setP = (p, v) => { const a = p.split('.'); let o = S; while (a.length > 1) o = o[a.shift()]; o[a[0]] = v };
const cost = r => { const p = N(r.p), q = N(r.q), u = N(r.u); if (!p || !q || !u) return 0; if (D[r.qu] != D[r.uu]) return NaN; return p / (q * F[r.qu]) * u * F[r.uu] };
const tot = l => S[l].reduce((a, r) => a + (cost(r) || 0), 0);
const sel = (p, v) => `<select data-p="${p}">${U.map(x => `<option${v == x ? ' selected' : ''}>${x}</option>`).join('')}</select>`;
const inp = (p, x = '') => `<input inputmode="decimal" data-p="${p}" value="${esc(get(p))}"${x}>`;
function rows(l) {
    $('#' + l).innerHTML = S[l].map((r, i) => {
        const b = `${l}.${i}.`; return `<div class="row"><input class="nm" data-p="${b}n" value="${esc(r.n)}" placeholder="${l == 'mat' ? 'Ingrediente (ex.: Nescau)' : 'Embalagem ou extra (ex.: celofane)'}">
<label>Paguei (R$)${inp(b + 'p')}</label>
<label>Quantidade comprada<span class="u">${inp(b + 'q')}${sel(b + 'qu', r.qu)}</span></label>
<label>Quantidade usada<span class="u">${inp(b + 'u')}${sel(b + 'uu', r.uu)}</span></label>
<div class="cs"><span>Custo usado: <b id="c-${l}-${i}"></b></span><button class="x" data-del="${l}:${i}" aria-label="Remover linha">×</button></div></div>`
    }).join(''); paintC()
}
function paintC() { ['mat', 'emb'].forEach(l => S[l].forEach((r, i) => { const c = cost(r), e = $(`#c-${l}-${i}`); if (e) e.textContent = isNaN(c) ? 'unidades não combinam' : R.format(c) })) }
const O = { f: ['Já tenho minha fórmula', 'Monte seus passos e eu automatizo a conta.'], g: ['Quero ajuda, não sei por onde começar', 'Responda quatro perguntas simples.'], h: ['Cobrar pela minha hora de trabalho', 'Para quem produz sob encomenda.'], m: ['Definir pela margem de lucro', 'Comum em comércio e revenda.'] };
const OPS = [['mul', 'Multiplicar por'], ['pct', 'Somar porcentagem de'], ['add', 'Somar valor fixo (R$)'], ['emb', 'Somar embalagens e extras'], ['div', 'Dividir por (unidades)']];
const fld = (t, p, s = '') => `<label>${t}<span class="u">${inp(p)}${s ? `<span style="align-self:center">${s}</span>` : ''}</span></label>`;
const HV = { a: () => { const a = N(S.x.a1), b = N(S.x.a2); return b > 0 && a >= b ? (a - b) / b * 100 : null }, b: () => { const m = tot('mat') * (1 + N(S.g.a) / 100), t = N(S.x.b1) * N(S.x.b2); return m > 0 && t > 0 ? t / m * 100 : null }, c: () => { const a = N(S.x.c1), b = N(S.x.c2); return a > 0 && b > 0 ? a / b * 100 : null } };
function paintH() { ['a', 'b', 'c'].forEach(k => { const e = $('#hr-' + k); if (!e) return; const v = HV[k](); e.textContent = v == null ? (k == 'b' && !tot('mat') ? 'Preencha antes os ingredientes, lá em cima.' : 'Preencha os campos para ver o resultado.') : 'Resultado: ' + v.toFixed(1).replace('.', ',') + '%' }); const f = $('#fat'); if (f) { const g = S.g; f.textContent = '× ' + [g.a, g.b, g.c, g.d].reduce((a, y) => a * (1 + N(y) / 100), 1).toFixed(3).replace('.', ',') } }
const BL = (t, a, b, f, h) => `<div class="hp"><h3>${t}</h3><p><b>O que é:</b> ${a}</p><p><b>Como calcular:</b> ${b}</p>${f}${h}</div>`;
const dt = (k, i) => `<details><summary>Me ajude a calcular</summary><div class="g2">${i}</div><p class="hr" id="hr-${k}"></p><button class="ad" data-use="${k}">Usar este valor</button></details>`;
function guia() {
    return `<p class="sub">Seu preço sai do custo dos ingredientes aumentado em quatro etapas. Em cada uma eu explico o que é, como descobrir o valor e, se quiser, calculo para você. Os números já preenchidos são os da Saborê.</p>`
        + BL('1. Perdas e desperdício', 'tudo que você compra e não chega ao cliente: massa que fica na tigela, sobras ao cortar, doce que não deu certo.', 'pese tudo que entrou na receita e depois o que virou produto. Perda % = (entrou − virou produto) ÷ virou produto × 100. Ex.: entraram 1000 g e saíram 900 g: 100 ÷ 900 = 11%. Ainda não mediu? Comece com 10%.', fld('Sua porcentagem', 'g.a', '%'), dt('a', fld('Peso que entrou', 'x.a1', 'g') + fld('Peso que virou produto', 'x.a2', 'g')))
        + BL('2. Mão de obra', 'o valor do seu tempo. Você também precisa receber pelas horas que passa fazendo o produto.', 'descubra quanto vale sua hora: quanto quer ganhar por mês ÷ horas que trabalha por mês (ex.: R$ 2.000 ÷ 160 h = R$ 12,50). Multiplique pelas horas gastas no produto e divida pelo custo dos ingredientes. Ex.: 2 h × R$ 12,50 = R$ 25; com R$ 100 de ingredientes, a mão de obra é 25%.', fld('Sua porcentagem', 'g.b', '%'), dt('b', fld('Horas gastas neste produto', 'x.b1', 'h') + fld('Valor da sua hora', 'x.b2', 'R$')))
        + BL('3. Luz, gás e outros custos', 'as contas que a produção gera: luz, gás, água, internet e o que mais ajudar a fazer o produto.', 'some o que gasta por mês com essas contas e divida pelo que gasta por mês em ingredientes. Ex.: R$ 150 de contas ÷ R$ 3.000 de ingredientes = 5%. É uma estimativa, e funciona bem.', fld('Sua porcentagem', 'g.c', '%'), dt('c', fld('Contas do mês (luz, gás, água)', 'x.c1', 'R$') + fld('Ingredientes comprados no mês', 'x.c2', 'R$')))
        + BL('4. Lucro', 'o que sobra para você e para o negócio crescer depois de pagar tudo.', 'é uma escolha sua. Lucro de 100% é vender pelo dobro do custo; 50% é vender por 1,5 vez o custo. Compare com o preço de quem vende algo parecido e ajuste.', fld('Sua porcentagem', 'g.d', '%'), `<div class="u" style="flex-wrap:wrap;margin-top:6px"><button class="ad" data-set="d:50">50% · 1,5× o custo</button><button class="ad" data-set="d:100">100% · o dobro</button><button class="ad" data-set="d:150">150% · 2,5×</button></div>`)
        + `<div class="fx">Seu fator de multiplicação: <span id="fat"></span><br><small>O custo dos ingredientes é multiplicado por esse número.</small></div>`
}
function opt() {
    $('#opts').innerHTML = Object.keys(O).map(k => `<button class="opt${S.opt == k ? ' on' : ''}" data-opt="${k}"><b>${O[k][0]}</b><span>${O[k][1]}</span></button>`).join('');
    let h = '';
    if (S.opt == 'f') h = `<p class="sub">O cálculo começa pelo total de ingredientes e materiais. Cada passo usa o resultado do anterior.</p>` + S.st.map((s, i) => `<div class="stp"><select data-p="st.${i}.op" data-r="1">${OPS.map(([k, t]) => `<option value="${k}"${s.op == k ? ' selected' : ''}>${t}</option>`).join('')}</select>${s.op == 'emb' ? '' : inp(`st.${i}.v`)}<button class="x" data-ds="${i}" aria-label="Remover passo">×</button></div>`).join('') + `<button class="ad" data-as="1">+ adicionar passo</button>`;
    if (S.opt == 'g') h = guia() + `<label style="margin-top:12px">Onde somar as embalagens e extras?<select data-p="g.e"><option value="f"${S.g.e == 'f' ? ' selected' : ''}>somadas no final</option><option value="d"${S.g.e == 'd' ? ' selected' : ''}>dentro da multiplicação</option></select></label>`;
    if (S.opt == 'h') h = `<div class="g2">${fld('Horas gastas no produto', 'h.h', 'h')}${fld('Valor da sua hora', 'h.v', 'R$')}${fld('Custos fixos (luz, gás, aluguel)', 'h.f', '%')}${fld('Lucro', 'h.l', '%')}</div>`;
    if (S.opt == 'm') h = `<p class="sub">O preço é o custo dividido por (1 − margem − taxas).</p><div class="g2">${fld('Margem de lucro desejada', 'm.m', '%')}${fld('Impostos e taxas sobre a venda', 'm.t', '%')}</div>`;
    $('#pn').innerHTML = h
}
function calc() {
    const m = tot('mat'), e = tot('emb'); let L = [], p = 0, w = '';
    if (S.tab == 's') { L = [['Ingredientes', m], ['× 2,80', m * 2.8], ['+ Embalagens e extras', m * 2.8 + e]]; p = m * 2.8 + e }
    else if (S.opt == 'f') { let c = m; L = [['Ingredientes e materiais', m]]; S.st.forEach(s => { const v = N(s.v); if (s.op == 'mul') c *= v; else if (s.op == 'pct') c *= 1 + v / 100; else if (s.op == 'add') c += v; else if (s.op == 'emb') c += e; else if (s.op == 'div' && v) c /= v; else return; L.push([({ mul: '× ' + s.v, pct: '+ ' + s.v + '%', add: '+ ' + R.format(v), emb: '+ Embalagens e extras', div: '÷ ' + s.v })[s.op], c]) }); p = c }
    else if (S.opt == 'g') { const g = S.g, f = [g.a, g.b, g.c, g.d].reduce((a, x) => a * (1 + N(x) / 100), 1), fs = f.toFixed(3).replace('.', ','); if (g.e == 'd') { p = (m + e) * f; L = [['Materiais + embalagens', m + e], ['× ' + fs, p]] } else { L = [['Ingredientes', m], ['× ' + fs, m * f], ['+ Embalagens e extras', m * f + e]]; p = m * f + e } }
    else if (S.opt == 'h') { const h = S.h, b = m + e, t = b + N(h.h) * N(h.v), f = t * (1 + N(h.f) / 100); p = f * (1 + N(h.l) / 100); L = [['Materiais + embalagens', b], ['+ Mão de obra', t], ['+ Custos fixos', f], ['+ Lucro', p]] }
    else if (S.opt == 'm') { const d = 1 - (N(S.m.m) + N(S.m.t)) / 100; if (d <= .05) w = 'Margem e taxas somam quase 100%. Diminua os percentuais.'; else { p = (m + e) / d; L = [['Custo do produto', m + e], ['÷ (1 − margem − taxas)', p]] } }
    else w = 'Escolha um dos caminhos acima para ver o preço.';
    if ([...S.mat, ...S.emb].some(r => isNaN(cost(r)))) w = 'Alguma linha tem unidades que não combinam (ex.: comprou em kg e usou em ml).';
    return { L, p, w }
}
function res() { paintH(); const { L, p, w } = calc(), y = N(S.yield); $('#res').innerHTML = `<h3>${esc(S.name || 'Seu produto')}</h3><ul>${L.map(([a, b]) => `<li><span>${esc(a)}</span><b>${R.format(b)}</b></li>`).join('')}</ul><div class="tot"><span>Preço de venda</span><b>${R.format(p)}</b></div>${y > 1 && p ? `<div class="pu">Por unidade (${y}): <b>${R.format(p / y)}</b></div>` : ''}${w ? `<p class="warn">${w}</p>` : ''}` }
function tab() { document.querySelectorAll('[data-tab]').forEach(b => b.classList.toggle('on', b.dataset.tab == S.tab)); $('#tS').classList.toggle('hide', S.tab != 's'); $('#tC').classList.toggle('hide', S.tab != 'c') }
document.addEventListener('input', e => { const t = e.target, p = t.dataset.p; if (!p) return; setP(p, t.value); if (t.dataset.r) { opt() } paintC(); res() });
document.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return; const d = b.dataset;
    if (d.tab) { S.tab = d.tab; tab() }
    else if (d.add) { S[d.add].push(mk()); rows(d.add) }
    else if (d.del) { const [l, i] = d.del.split(':'); S[l].splice(+i, 1); if (!S[l].length) S[l].push(mk()); rows(l) }
    else if (d.opt) { S.opt = d.opt; opt() }
    else if (d.as) { S.st.push({ op: 'pct', v: '' }); opt() }
    else if (d.use) { const v = HV[d.use](); if (v != null) S.g[d.use] = (Math.round(v * 10) / 10).toString().replace('.', ','); opt() }
    else if (d.set) { const [k, v] = d.set.split(':'); S.g[k] = v; opt() }
    else if (d.ds !== undefined) { S.st.splice(+d.ds, 1); opt() }
    else return; res()
});
rows('mat'); rows('emb'); opt(); tab(); res();
