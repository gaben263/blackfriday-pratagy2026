# Black Friday Pratagy 2026 — Landing page da Lista VIP

Página de captação da Black Friday 2026 do Pratagy Beach Resort. O visitante se cadastra no formulário da
SharpSpring e entra na lista VIP, que recebe a oferta de novembro antes de todo mundo.

- **Produção (Vercel):** https://blackfriday-pratagy2026.vercel.app
- **Página na Omnibees / SharpSpring Pages:** http://blackfriday.pratagy.com.br.pages.services/bfp-26-lp-captao/

## Arquivos

| Arquivo | O que é |
|---|---|
| `index.html` | **Fonte da página.** HTML, CSS e JS num arquivo só. Toda alteração começa aqui. |
| `head.html` / `body.html` | Gerados a partir do `index.html` para colar na Omnibees. Não edite à mão. |
| `obrigado.html` | Página de agradecimento, para onde a SharpSpring redireciona após o cadastro (`/obrigado.html`). |
| `SharpSpring-CSS-formulario.css` | CSS personalizado do formulário, colado no editor da SharpSpring. Não é carregado pela página. |
| `Assets/`, `Fotos/`, `Fonte/` | Imagens (.webp) e fontes Fibra One. A versão da Omnibees carrega tudo daqui, pela Vercel. |
| `ferramentas/gerar-omnibees.js` | Script que gera o `head.html` e o `body.html`. |

## Deploy na Vercel

O repositório está ligado à Vercel pela integração com o GitHub. **Cada push na `main` publica
sozinho em produção**, em cerca de 1 minuto. Não há build nem `vercel.json`: os arquivos são servidos
como estão.

Como a versão da Omnibees busca imagens e fontes na Vercel, a Vercel precisa continuar no ar
(e no mesmo endereço) enquanto a página da Omnibees estiver publicada.

## Publicar na Omnibees

O editor da Omnibees (SharpSpring Pages) tem áreas separadas para o conteúdo do `<head>` e do `<body>`.

1. Regenere os arquivos (veja abaixo), se o `index.html` mudou.
2. Copie **todo** o conteúdo de `head.html` para a área do **head**. Ele vai do `<meta charset>` ao `</style>`.
3. Copie **todo** o conteúdo de `body.html` para a área do **body**. Ele vai do `<div class="bf-watermark">`
   ao `</script>`.
4. Publique e confira a página, no desktop e no celular.

Os dois arquivos já trazem os caminhos absolutos da Vercel (`https://blackfriday-pratagy2026.vercel.app/Assets/...`).

Nas configurações da página na Omnibees, confira também:
- **Título:** "Lista VIP Black Friday 2026 | Pratagy Resort". A plataforma põe o próprio `<title>` antes do nosso, e o navegador usa o primeiro.
- **og:site_name:** o nome usado quando o link é compartilhado.

### CSS da plataforma

A SharpSpring Pages carrega um tema próprio (Foundry + Bootstrap) antes do nosso CSS. Esse tema estiliza
as tags HTML diretamente: `section` com padding e `overflow: hidden`, títulos cinza, `rem` com base de 10px,
cor nos links em `:hover`. O `index.html` tem um bloco **"Blindagem contra o CSS da plataforma"** que
devolve o padrão do navegador dentro de `.bf`. Na Vercel esse bloco não muda nada.

Ao criar coisas novas na página:
- dê cor explícita, ou `inherit` pela blindagem, a títulos e links;
- use `px` em vez de `rem`;
- se aparecer uma tag nova (`ul`, `li`, `input`, `table`...), inclua-a na blindagem, porque o tema também estiliza essas tags.

## Regenerar `head.html` e `body.html`

**Toda vez que o `index.html` mudar**, rode na raiz do repositório (requer Node.js):

```
node ferramentas/gerar-omnibees.js
```

O script:
- lê o `index.html`, que ele não altera;
- regrava `head.html` e `body.html`;
- troca `Assets/`, `Fotos/` e `Fonte/` pelas URLs da Vercel;
- lista as menções relativas que sobraram. Hoje são só 4, dentro de comentários.

Depois, faça o commit dos três arquivos juntos, dê push, espere o deploy da Vercel e cole os arquivos
novos na Omnibees.

## Formulário (SharpSpring)

- O formulário "BFP 26 - Formulário de Captação" é injetado como iframe pelo `form.js` da SharpSpring,
  dentro de `#sharpspring-form`. O CSS da página não alcança os campos: o visual deles está no
  `SharpSpring-CSS-formulario.css`, colado no editor da SharpSpring.
- A página reserva a altura do formulário (`--ss-h`) para não pular durante o carregamento. Se o CSS do
  formulário mudar, as alturas precisam ser medidas de novo.
- Plano B: se o formulário não aparecer em até 3 s (bloqueador, rede lenta), o card mostra um botão
  para o grupo VIP no WhatsApp.
