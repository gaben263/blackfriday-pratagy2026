// Gera head.html e body.html a partir do index.html, para colar nas abas "head" e "body" do editor da Omnibees.
// Troca os caminhos relativos Assets/ Fotos/ Fonte/ pelas URLs absolutas da Vercel. Não altera o index.html.
// Uso (na raiz do repositório): node ferramentas/gerar-omnibees.js
const fs = require('fs'), path = require('path');
const DIR = path.join(__dirname, '..'), BASE = 'https://blackfriday-pratagy2026.vercel.app/';
const src = fs.readFileSync(path.join(DIR, 'index.html'), 'utf8'), L = src.split(/\r?\n/);
const idx = (re, from = 0) => { for (let i = from; i < L.length; i++) if (re.test(L[i])) return i; throw new Error('não achei ' + re); };
// head.html: do <meta charset> até o </style>; body.html: do <div class="bf-watermark"> até o último </script>
const hStart = idx(/^<meta charset="utf-8">/), hEnd = idx(/^<\/style>$/, hStart), headClose = idx(/^<\/head>$/, hEnd);
const bOpen = idx(/^<body>/, headClose), bStart = idx(/<div class="bf-watermark"/, bOpen), bClose = idx(/^<\/body>$/, bStart), bEnd = bClose - 1;
if (!/^<\/script>$/.test(L[bEnd])) throw new Error('o body não termina em </script>');
if (headClose !== hEnd + 1) throw new Error('há conteúdo entre </style> e </head>, que ficaria de fora do head.html');
// só caminhos de verdade: logo depois de aspas ou "(" — url('Fonte/..'), src="Assets/..", data-src="Fotos/.."
const RE = /(["'(])(Assets|Fotos|Fonte)\//g;
const conv = s => { let n = 0; const out = s.replace(RE, (m, q, d) => { n++; return q + BASE + d + '/'; }); return { out, n }; };
const head = conv(L.slice(hStart, hEnd + 1).join('\n') + '\n'), body = conv(L.slice(bStart, bEnd + 1).join('\n') + '\n');
fs.writeFileSync(path.join(DIR, 'head.html'), head.out);
fs.writeFileSync(path.join(DIR, 'body.html'), body.out);
const kb = s => (Buffer.byteLength(s) / 1024).toFixed(1) + ' KB', lines = s => s.split('\n').length - 1;
console.log(`head.html: ${lines(head.out)} linhas, ${kb(head.out)} (linhas ${hStart + 1}–${hEnd + 1} do index.html, ${head.n} caminhos convertidos)`);
console.log(`body.html: ${lines(body.out)} linhas, ${kb(body.out)} (linhas ${bStart + 1}–${bEnd + 1} do index.html, ${body.n} caminhos convertidos)`);
// o que sobrou de relativo (qualquer contexto): deve ser só texto de comentário
const left = (s, f) => s.split('\n').map((l, i) => [i + 1, l]).filter(([, l]) => /(^|[^\/\w.-])(Assets|Fotos|Fonte)\//.test(l)).map(([n, l]) => `  ${f}:${n}: ${l.trim().slice(0, 110)}`);
const rest = [...left(head.out, 'head.html'), ...left(body.out, 'body.html')];
console.log('menções relativas restantes (conferir se são só comentários):', rest.length ? '\n' + rest.join('\n') : 'nenhuma');
