// Gera as versões para a Omnibees (SharpSpring Pages) de cada página: um arquivo com o conteúdo do <head> e
// outro com o conteúdo do <body>, para colar nas áreas "head" e "body" do editor. Troca os caminhos relativos
// Assets/ Fotos/ Fonte/ pelas URLs absolutas da Vercel. Não altera os arquivos-fonte.
// Uso (na raiz do repositório): node ferramentas/gerar-omnibees.js
const fs = require('fs'), path = require('path');
const DIR = path.join(__dirname, '..'), BASE = 'https://blackfriday-pratagy2026.vercel.app/';

// Páginas publicadas na Omnibees. Para incluir uma nova, basta acrescentar uma linha.
// head: tudo entre <head> e </head>. body: tudo entre <body> e </body>, ou a partir da linha que casar com
// bodyFrom (a landing começa no <div class="bf-watermark">, deixando de fora o comentário antes dele).
const PAGES = [
  { src: 'index.html',    head: 'head.html',          body: 'body.html',          bodyFrom: /<div class="bf-watermark"/ },
  { src: 'obrigado.html', head: 'obrigado-head.html', body: 'obrigado-body.html' },
];

// Só caminhos de verdade: logo depois de aspas ou "(" — url('Fonte/..'), src="Assets/..", data-src="Fotos/.."
const RE = /(["'(])(Assets|Fotos|Fonte)\//g;
const convert = s => { let n = 0; const out = s.replace(RE, (m, q, d) => { n++; return q + BASE + d + '/'; }); return { out, n }; };
const kb = s => (Buffer.byteLength(s) / 1024).toFixed(1) + ' KB', count = s => s.split('\n').length - 1;

// Trava: seletor com espaço antes de ":" (ex.: ".bf :focus-visible", ":where(.bf) :is(h1)"). O editor da Omnibees
// reformata o CSS e apaga esse espaço, o que muda o sentido do seletor (de "dentro de .bf" para "o próprio .bf").
// Espaço depois de vírgula ou "(" não conta (",\n:where(...)" e ":is(:hover, :focus)" continuam iguais).
const riskySelectors = html => {
  const out = [];
  for (const m of html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) {
    const css = m[1].replace(/\/\*[\s\S]*?\*\//g, '');
    for (const s of css.matchAll(/([^{};]+)\{/g)) {
      const sel = s[1].trim();
      if (!sel.startsWith('@') && /[^\s,(]\s+:/.test(sel)) out.push(sel.replace(/\s+/g, ' '));
    }
  }
  return out;
};

let problems = 0;
for (const p of PAGES) {
  const L = fs.readFileSync(path.join(DIR, p.src), 'utf8').split(/\r?\n/);
  const find = (re, from = 0) => { for (let i = from; i < L.length; i++) if (re.test(L[i])) return i; throw new Error(`${p.src}: não achei ${re}`); };
  const hOpen = find(/^<head>$/), hClose = find(/^<\/head>$/, hOpen), bOpen = find(/^<body>$/, hClose), bClose = find(/^<\/body>$/, bOpen);
  const bStart = p.bodyFrom ? find(p.bodyFrom, bOpen) : bOpen + 1;
  const head = convert(L.slice(hOpen + 1, hClose).join('\n') + '\n'), body = convert(L.slice(bStart, bClose).join('\n') + '\n');
  const before = problems;
  console.log(`\n${p.src}`);
  console.log(`  ${p.head.padEnd(19)} ${String(count(head.out)).padStart(4)} linhas  ${kb(head.out).padStart(8)}  (linhas ${hOpen + 2}–${hClose} da fonte, ${head.n} caminhos convertidos)`);
  console.log(`  ${p.body.padEnd(19)} ${String(count(body.out)).padStart(4)} linhas  ${kb(body.out).padStart(8)}  (linhas ${bStart + 1}–${bClose} da fonte, ${body.n} caminhos convertidos)`);
  // Conferências: menções a Assets/Fotos/Fonte que sobraram (devem ser só comentários) e qualquer src/href/url()
  // que ainda aponte para um arquivo relativo (quebraria na Omnibees, que não hospeda esses arquivos).
  const scan = (s, f) => s.split('\n').forEach((l, i) => {
    if (/(^|[^\/\w.-])(Assets|Fotos|Fonte)\//.test(l)) console.log(`    menção em comentário? ${f}:${i + 1}: ${l.trim().slice(0, 100)}`);
    const rel = [...l.matchAll(/\b(?:src|href|data-src)="([^"]*)"|url\(\s*['"]?([^'")]*)/g)].map(m => m[1] ?? m[2])
      .filter(u => u && !/^(https?:|\/\/|#|mailto:|tel:|data:)/.test(u));
    rel.forEach(u => { problems++; console.log(`    RELATIVO (vai quebrar): ${f}:${i + 1}: ${u}`); });
  });
  scan(head.out, p.head); scan(body.out, p.body);
  for (const [f, s] of [[p.head, head.out], [p.body, body.out]]) riskySelectors(s).forEach(sel => {
    problems++; console.log(`    ESPAÇO ANTES DE ":" (o formatador da Omnibees quebra): ${f}: ${sel}`);
  });
  const outside = [...L.slice(0, hOpen + 1), ...L.slice(hClose, bStart), ...L.slice(bClose)].filter(x => x.trim());
  console.log(`  fora dos arquivos: ${outside.join(' ')}`);
  // Só grava se a página passou nas conferências: arquivo com problema nunca chega a ser gerado
  if (problems === before) { fs.writeFileSync(path.join(DIR, p.head), head.out); fs.writeFileSync(path.join(DIR, p.body), body.out); }
  else console.log(`  NADA FOI GRAVADO para ${p.src}: ${p.head} e ${p.body} continuam como estavam.`);
}
console.log(problems ? `\n${problems} problema(s) acima: corrija a fonte antes de colar na Omnibees.` : '\nNenhum caminho relativo restante e nenhum seletor com espaço antes de ":".');
process.exitCode = problems ? 1 : 0;
