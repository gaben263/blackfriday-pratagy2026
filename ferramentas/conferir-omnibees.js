// Confere uma página publicada na Omnibees contra os arquivos gerados do repositório. Rode depois de cada publicação.
//   1. CSS: compara, regra a regra e do jeito que o navegador entende, o nosso <style> publicado com o do head gerado.
//      Diferença só de espaços/quebras de linha não conta; seletor que mudou de sentido conta (foi o que quebrou os títulos
//      quando o editor da Omnibees apagou o espaço em ":where(.bf) :is(h1, h2, h3)").
//   2. JS: compara o nosso <script> publicado com o do body gerado, ignorando espaços e comentários.
//   3. Tela: abre a página e confere se os títulos (h1–h3 dentro de .bf) estão na Fibra One e fora do cinza do tema.
// Uso (na raiz do repositório): node ferramentas/conferir-omnibees.js <url-publicada> [landing|obrigado]
// Requer Node 22+ e Google Chrome ou Microsoft Edge instalado (ou o caminho do navegador na variável CHROME).
const fs = require('fs'), path = require('path'), os = require('os'), { spawn } = require('child_process');
const DIR = path.join(__dirname, '..');
const PAGES = { landing: { head: 'head.html', body: 'body.html' }, obrigado: { head: 'obrigado-head.html', body: 'obrigado-body.html' } };
const url = process.argv[2];
if (!url) { console.log('Uso: node ferramentas/conferir-omnibees.js <url-publicada> [landing|obrigado]'); process.exit(2); }
if (typeof WebSocket === 'undefined') { console.log('Precisa do Node 22 ou mais novo.'); process.exit(2); }

const CHROMES = [process.env.CHROME, 'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium'].filter(Boolean);
const chromePath = CHROMES.find(p => fs.existsSync(p));
if (!chromePath) { console.log('Não achei o Chrome nem o Edge. Informe o caminho na variável CHROME.'); process.exit(2); }

// O nosso <style> é o que tem o bloco de fontes; o nosso <script> é o do loop de animação da landing
const ourStyle = s => { const i = s.indexOf('FONTES — Fibra One'); if (i < 0) return null; return s.slice(s.lastIndexOf('<style', i), s.indexOf('</style>', i)).replace(/^<style[^>]*>/, ''); };
const ourScript = s => { const i = s.indexOf('const scrollY = () =>'); if (i < 0) return null; return s.slice(s.lastIndexOf('<script', i), s.indexOf('</script>', i)).replace(/^<script[^>]*>/, ''); };
const normJs = s => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"\\])\/\/[^\n]*/g, '$1').replace(/\s+/g, '');
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const get = async u => { const r = await fetch(u, { headers: { 'User-Agent': 'Mozilla/5.0 conferir-omnibees' } }); return { html: await r.text(), gen: r.headers.get('x-goog-generation') }; };
  let { html, gen } = await get(url);
  // A Omnibees redireciona endereços antigos com <meta http-equiv="refresh">: segue até a página de verdade
  for (let i = 0; i < 3; i++) {
    const m = html.length < 3000 && html.match(/http-equiv=["']refresh["'][^>]*url=([^"'>]+)/i);
    if (!m) break;
    console.log(`(este endereço redireciona para ${m[1].trim()})`);
    ({ html, gen } = await get(new URL(m[1].trim(), url)));
  }
  const kind = process.argv[3] || (html.includes('ty-check') ? 'obrigado' : 'landing');
  if (!PAGES[kind]) { console.log('Página desconhecida: ' + kind + ' (use landing ou obrigado)'); process.exit(2); }
  const head = fs.readFileSync(path.join(DIR, PAGES[kind].head), 'utf8'), body = fs.readFileSync(path.join(DIR, PAGES[kind].body), 'utf8');
  console.log(`Conferindo ${url}\n  contra ${PAGES[kind].head} + ${PAGES[kind].body} (página: ${kind})`);
  // Horário em que a versão no ar foi salva: a Omnibees guarda as páginas no Google Cloud Storage, e o cabeçalho
  // x-goog-generation traz esse momento em microssegundos. Se for anterior à sua publicação, a nova ainda não entrou.
  if (gen && /^\d{13,}$/.test(gen)) {
    const t = new Date(Number(gen.slice(0, 13))), min = Math.round((Date.now() - t) / 60000);
    const quando = t.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const ha = min < 1 ? 'menos de 1 minuto' : min < 120 ? `${min} min` : min < 2880 ? `${Math.round(min / 60)} h` : `${Math.round(min / 1440)} dias`;
    console.log(`  versão no ar salva em ${quando} (horário de Brasília), há ${ha}`);
  } else console.log('  (o servidor não informou o horário da publicação: sem cabeçalho x-goog-generation)');
  console.log('');
  let falhas = 0;
  const pubCss = ourStyle(html), locCss = ourStyle(head);
  if (!pubCss) { console.log('✗ CSS: o nosso <style> não foi encontrado na página publicada (o head foi colado?)'); falhas++; }

  // Chrome sem janela, controlado pelo protocolo de depuração
  const port = 9300 + Math.floor(Math.random() * 500), prof = fs.mkdtempSync(path.join(os.tmpdir(), 'conferir-omnibees-'));
  const chrome = spawn(chromePath, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${prof}`, '--no-first-run', '--hide-scrollbars', 'about:blank'], { stdio: 'ignore' });
  const done = code => { try { chrome.kill(); } catch {} setTimeout(() => { try { fs.rmSync(prof, { recursive: true, force: true }); } catch {} process.exit(code); }, 300); };
  try {
    let wsUrl; for (let i = 0; i < 80 && !wsUrl; i++) { try { const j = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json(); const p = j.find(t => t.type === 'page'); if (p) wsUrl = p.webSocketDebuggerUrl; } catch {} if (!wsUrl) await sleep(250); }
    if (!wsUrl) throw new Error('o navegador não abriu');
    const ws = new WebSocket(wsUrl); await new Promise(r => (ws.onopen = r));
    let id = 0; const pend = new Map(), handlers = [];
    ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m.result || { error: m.error }); pend.delete(m.id); } else handlers.forEach(h => h(m)); };
    const send = (method, params = {}) => new Promise(r => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
    const ev = async x => { const r = await send('Runtime.evaluate', { expression: x, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception ? r.exceptionDetails.exception.description : r.exceptionDetails.text); return r.result.value; };
    await send('Page.enable'); await send('Runtime.enable');

    // 1. CSS, regra a regra
    if (pubCss) {
      const rules = await ev(`(() => { const flat = (list, ctx, out) => { for (const r of list) {
          if (r.cssRules && !r.selectorText) flat(r.cssRules, ctx + (r.conditionText || r.name || r.cssText.split('{')[0]).trim().replace(/\\s+/g, ' ') + ' » ', out);
          else out.push(ctx + (r.selectorText || r.cssText.split('{')[0].trim()) + ' { ' + (r.style ? r.style.cssText.replace(/\\s+/g, '') : '') + ' }'); } return out; };
        const get = t => { const s = new CSSStyleSheet(); s.replaceSync(t); return flat(s.cssRules, '', []); };
        return { loc: get(${JSON.stringify(locCss)}), pub: get(${JSON.stringify(pubCss)}) }; })()`);
      const P = new Set(rules.pub), L = new Set(rules.loc);
      const soLoc = rules.loc.filter(r => !P.has(r)), soPub = rules.pub.filter(r => !L.has(r));
      if (!soLoc.length && !soPub.length) console.log(`✓ CSS: as ${rules.loc.length} regras publicadas são iguais às do ${PAGES[kind].head}`);
      else {
        falhas++; console.log(`✗ CSS: ${soLoc.length} regra(s) do ${PAGES[kind].head} não estão iguais na página publicada:`);
        soLoc.forEach(r => console.log('    esperado : ' + r.slice(0, 200)));
        soPub.forEach(r => console.log('    publicado: ' + r.slice(0, 200)));
      }
    }

    // 2. JS
    const locJs = ourScript(body);
    if (locJs) {
      const pubJs = ourScript(html);
      if (!pubJs) { falhas++; console.log('✗ JS: o nosso <script> não foi encontrado na página publicada (o body foi colado?)'); }
      else if (normJs(pubJs) === normJs(locJs)) console.log(`✓ JS: igual ao do ${PAGES[kind].body} (ignorando espaços e comentários)`);
      else { falhas++; console.log(`✗ JS: diferente do ${PAGES[kind].body}. Cole o body de novo, sem formatar.`); }
    }

    // 3. Tela: títulos na fonte e na cor certas
    const errs = []; handlers.push(m => { if (m.method === 'Runtime.exceptionThrown') errs.push(m.params.exceptionDetails.exception ? m.params.exceptionDetails.exception.description.split('\n')[0] : m.params.exceptionDetails.text); });
    await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
    const loaded = new Promise(r => { const h = m => { if (m.method === 'Page.loadEventFired') { handlers.splice(handlers.indexOf(h), 1); r(); } }; handlers.push(h); });
    await send('Page.navigate', { url: url + (url.includes('?') ? '&' : '?') + 'conferir=' + Date.now() }); await loaded; await sleep(4000);
    const titles = await ev(`[...document.querySelectorAll('.bf h1, .bf h2, .bf h3')].map(h => { const c = getComputedStyle(h);
      return { t: (h.textContent.trim() || h.className).replace(/\\s+/g, ' ').slice(0, 40), font: c.fontFamily.split(',')[0].replace(/"/g, ''), color: c.color, weight: c.fontWeight }; })`);
    const bad = titles.filter(t => t.font !== 'Fibra One' || t.color === 'rgb(41, 41, 41)');
    if (!titles.length) { falhas++; console.log('✗ Tela: nenhum título encontrado dentro de .bf'); }
    else if (!bad.length) console.log(`✓ Tela: ${titles.length} títulos na Fibra One, fora do cinza do tema`);
    else { falhas++; console.log(`✗ Tela: ${bad.length} de ${titles.length} títulos com fonte ou cor do tema:`); bad.forEach(t => console.log(`    "${t.t}" → ${t.font} ${t.weight}, ${t.color}`)); }
    if (errs.length) { falhas++; console.log('✗ Erros de JavaScript na página: ' + [...new Set(errs)].join(' | ')); }
    else console.log('✓ Nenhum erro de JavaScript na página');

    console.log(falhas ? `\n${falhas} problema(s). Corrija e publique de novo.` : '\nTudo certo: a página publicada está igual aos arquivos do repositório.');
    ws.close(); done(falhas ? 1 : 0);
  } catch (e) { console.log('ERRO: ' + e.message); done(2); }
})();
