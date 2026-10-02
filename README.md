# Black Friday Pratagy 2026 — Landing page da Lista VIP

Página de captação da Black Friday 2026 do Pratagy Beach Resort. O visitante se cadastra no formulário da
SharpSpring e entra na lista VIP, que recebe a oferta de novembro antes de todo mundo.

- **Produção (Vercel):** https://blackfriday-pratagy2026.vercel.app (obrigado: `/obrigado.html`)
- **Landing na Omnibees / SharpSpring Pages (oficial):** https://blackfriday.pratagy.com.br/listavip2026/
  (o endereço antigo, `http://blackfriday.pratagy.com.br.pages.services/bfp-26-lp-captao/`, só redireciona para este)
- **Obrigado na Omnibees (oficial):** https://blackfriday.pratagy.com.br/listavip2026/cadastro-concluido.html
  (é para esta URL, sem o `?ts=`, que o formulário da SharpSpring deve redirecionar)

O endereço antigo não é uma cópia da página: a Omnibees criou ali um aviso de redirecionamento
(`<meta http-equiv="refresh">`) quando a página mudou de endereço. Ele não tem o nosso código e não precisa ser
atualizado. **Recomendação: manter.** Quem tiver o link antigo (mensagens, anúncios, QR codes) continua chegando
à página certa. Só remova esse redirecionamento se tiver certeza de que o link antigo não circula mais.

## Arquivos

| Arquivo | O que é |
|---|---|
| `index.html` | **Fonte da página.** HTML, CSS e JS num arquivo só. Toda alteração começa aqui. |
| `head.html` / `body.html` | Gerados a partir do `index.html` para colar na Omnibees. Não edite à mão. |
| `obrigado.html` | **Fonte da página de agradecimento**, para onde a SharpSpring redireciona após o cadastro. Não tem JavaScript. |
| `obrigado-head.html` / `obrigado-body.html` | Gerados a partir do `obrigado.html` para colar na Omnibees. Não edite à mão. |
| `SharpSpring-CSS-formulario.css` | CSS personalizado do formulário, colado no editor da SharpSpring. Não é carregado pela página. |
| `Assets/`, `Fotos/`, `Fonte/` | Imagens (.webp) e fontes Fibra One. A versão da Omnibees carrega tudo daqui, pela Vercel. |
| `ferramentas/gerar-omnibees.js` | Script que gera os arquivos da Omnibees de todas as páginas. |
| `ferramentas/conferir-omnibees.js` | Script que confere uma página publicada na Omnibees contra os arquivos gerados. |

## Deploy na Vercel

O repositório está ligado à Vercel pela integração com o GitHub. **Cada push na `main` publica
sozinho em produção**, em cerca de 1 minuto. Não há build nem `vercel.json`: os arquivos são servidos
como estão.

Como a versão da Omnibees busca imagens e fontes na Vercel, a Vercel precisa continuar no ar
(e no mesmo endereço) enquanto a página da Omnibees estiver publicada.

## Publicar a landing na Omnibees

O editor da Omnibees (SharpSpring Pages) tem áreas separadas para o conteúdo do `<head>` e do `<body>`.

1. Regenere os arquivos (veja abaixo), se o `index.html` mudou.
2. Copie **todo** o conteúdo de `head.html` para a área do **head**. Ele vai do `<meta charset>` ao `</style>`.
3. Copie **todo** o conteúdo de `body.html` para a área do **body**. Ele vai do `<div class="bf-watermark">`
   ao `</script>`.
4. Publique e rode a conferência (veja "Conferir a página publicada"). Depois, olhe a página no desktop e no celular.

Os dois arquivos já trazem os caminhos absolutos da Vercel (`https://blackfriday-pratagy2026.vercel.app/Assets/...`).

Nas configurações da página na Omnibees, confira também:
- **Título:** "Lista VIP Black Friday 2026 | Pratagy Resort". A plataforma põe o próprio `<title>` antes do nosso, e o navegador usa o primeiro.
- **og:site_name:** o nome usado quando o link é compartilhado.

## Publicar a página de obrigado na Omnibees

Mesmo processo da landing, numa página separada da Omnibees:

1. Regenere os arquivos (veja abaixo), se o `obrigado.html` mudou.
2. Copie **todo** o conteúdo de `obrigado-head.html` para a área do **head**. Ele vai do `<meta charset>` ao `</style>`.
   A página não tem JavaScript.
3. Copie **todo** o conteúdo de `obrigado-body.html` para a área do **body**. Ele vai do `<main class="bf">` ao `</main>`.
4. Publique e rode a conferência (veja "Conferir a página publicada"). Depois, olhe a página: check com pulso verde,
   título dourado, botões SITE e GRUPO VIP, redes sociais e rodapé.
5. Nas configurações da página, defina o título "Cadastro Concluído | Black Friday Pratagy 2026" e, se houver a opção,
   deixe a página fora dos buscadores (noindex). O nosso `<meta name="robots">` já pede isso.
6. **Depois de publicar, atualize o redirecionamento da SharpSpring** para a URL pública da página de obrigado na
   Omnibees, `https://blackfriday.pratagy.com.br/listavip2026/cadastro-concluido.html`, e não para a da Vercel.
   Fica em **SharpSpring → Forms → BFP 26 → Configurações → Página de Obrigado**.
   Depois, faça um cadastro de teste e confira se o redirecionamento abre a página certa.

O link "Voltar para a página inicial" aponta para a landing oficial na Omnibees
(`https://blackfriday.pratagy.com.br/listavip2026/`). Se a URL da landing mudar, atualize esse link no
`obrigado.html` e gere os arquivos de novo.

## CSS da plataforma

A SharpSpring Pages carrega um tema próprio (Foundry + Bootstrap) antes do nosso CSS. Esse tema estiliza
as tags HTML diretamente:
- `section` e `footer` com padding e `overflow: hidden`;
- títulos cinza #292929 em Open Sans;
- `rem` com base de 10px;
- margem em `p` e `ul`;
- peso 600 e transição em todo link;
- cor azul nos links em `:hover` e `:focus`.

O `index.html` e o `obrigado.html` têm um bloco **"Blindagem contra o CSS da plataforma"** que devolve o
padrão do navegador dentro de `.bf`. Na Vercel esse bloco não muda nada.

Ao criar coisas novas numa das páginas:
- dê cor explícita, ou `inherit` pela blindagem, a títulos e links, inclusive em `:hover`, `:focus` e `:visited`;
- use `px` em vez de `rem`;
- se aparecer uma tag nova (`input`, `table`, `ol`...), inclua-a na blindagem, porque o tema também estiliza essas tags;
- **nunca deixe espaço antes de `:` num seletor**.

O editor da Omnibees reformata o código colado (uma propriedade por linha) e, nisso, apaga o espaço antes de `:`.
Em seletores como `.bf :focus-visible` ou `:where(.bf) :is(h1)`, esse espaço significa "dentro de". Sem ele, o
seletor passa a pegar só o próprio `.bf`, e a regra deixa de funcionar. Foi o que deixou os títulos cinza.
- Para isso, escreva `.bf *:focus-visible`, ou repita a tag: `:where(.bf) h1, :where(.bf) h2`.
- O gerador recusa esse padrão: ele avisa e não grava os arquivos.

## Regenerar os arquivos da Omnibees

**Toda vez que o `index.html` ou o `obrigado.html` mudar**, rode na raiz do repositório (requer Node.js):

```
node ferramentas/gerar-omnibees.js
```

O script:
- lê as páginas-fonte, que ele não altera;
- regrava `head.html` e `body.html` (a partir do `index.html`);
- regrava `obrigado-head.html` e `obrigado-body.html` (a partir do `obrigado.html`);
- troca `Assets/`, `Fotos/` e `Fonte/` pelas URLs da Vercel;
- mostra linhas e tamanho de cada arquivo;
- lista as menções que sobraram em comentários;
- se ainda houver algum `src`, `href` ou `url()` relativo, ou algum seletor com espaço antes de `:`, avisa,
  **não grava** os arquivos daquela página e termina com erro.

Para publicar uma página nova na Omnibees, acrescente uma linha na lista `PAGES`, no topo do script.

Depois, faça o commit da fonte e dos arquivos gerados juntos, dê push, espere o deploy da Vercel e cole os
arquivos novos na Omnibees.

## Conferir a página publicada

Depois de colar e publicar na Omnibees, rode na raiz do repositório (requer Node.js 22+ e Chrome ou Edge):

```
node ferramentas/conferir-omnibees.js https://blackfriday.pratagy.com.br/listavip2026/
node ferramentas/conferir-omnibees.js <url-da-página-de-obrigado> obrigado
```

O script confere três coisas:
- **CSS:** compara, regra por regra, o CSS publicado com o do arquivo gerado, do jeito que o navegador entende.
  Quebras de linha e espaços que a Omnibees acrescenta não contam; um seletor que mudou de sentido conta.
- **JavaScript:** compara o JS publicado com o do `body.html`, ignorando espaços e comentários.
- **Tela:** abre a página e confere se os títulos estão na Fibra One e fora do cinza do tema.

Ele também segue o redirecionamento de endereços antigos. Termina com "Tudo certo" (código 0) ou lista o que
está diferente (código 1). O navegador pode ser indicado na variável `CHROME`.

### Cache da Omnibees (1 hora)

A Omnibees entrega as páginas com `Cache-Control: public, max-age=3600`. Isso autoriza o **navegador** de quem já
visitou a página a reaproveitar a cópia guardada por até 1 hora. O servidor em si não fica com a versão antiga:
a página fica guardada no Google Cloud Storage, e cada requisição já recebe a versão salva mais recente.

Consequências:
- **A conferência não sofre com o cache.** O script baixa a página direto do servidor e abre um navegador sem
  histórico, então ele sempre vê a versão publicada mais recente. Se ele mostrar o código antigo, a publicação ainda
  não terminou ou não foi salva. Confira no editor e rode de novo depois de alguns minutos.
- **No seu navegador**, a versão antiga pode aparecer por até 1 hora. Para ver a nova na hora, use uma das opções:
  - recarregamento forçado: `Ctrl+Shift+R`, ou `Cmd+Shift+R` no Mac;
  - uma janela anônima;
  - um parâmetro qualquer no fim da URL, como `?v=2`. O `?ts=` dos links de pré-visualização da Omnibees faz
    exatamente isso. Como o navegador trata URL com parâmetro como outro endereço, ele baixa de novo.
- **Para os visitantes não há como forçar** a atualização. Quem abriu a página na última hora pode continuar vendo
  a versão anterior até o cache do navegador vencer. Por isso, publique correções o quanto antes e espere até
  1 hora antes de concluir que "ainda tem gente vendo o erro".

Para saber **quando** a versão no ar foi salva, veja o cabeçalho `x-goog-generation`. Ele traz o horário da gravação
em microssegundos desde 1970:

```
curl -sI https://blackfriday.pratagy.com.br/listavip2026/ | grep -i x-goog-generation
```

Os 10 primeiros dígitos são os segundos. Converta com `date -u -d @<10 dígitos>`, ou num conversor de
"Unix timestamp".

## Formulário (SharpSpring)

- O formulário "BFP 26 - Formulário de Captação" é injetado como iframe pelo `form.js` da SharpSpring,
  dentro de `#sharpspring-form`. O CSS da página não alcança os campos: o visual deles está no
  `SharpSpring-CSS-formulario.css`, colado no editor da SharpSpring.
- A página reserva a altura do formulário (`--ss-h`) para não pular durante o carregamento. Se o CSS do
  formulário mudar, as alturas precisam ser medidas de novo.
- Plano B: se o formulário não aparecer em até 3 s (bloqueador, rede lenta), o card mostra um botão
  para o grupo VIP no WhatsApp.
