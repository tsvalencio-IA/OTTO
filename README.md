# Athos AR do Otto

Sistema simples para brincar com o personagem Athos em 3D e realidade aumentada no celular, pronto para GitHub Pages.

## Como subir no GitHub Pages

1. Extraia este ZIP.
2. Envie todos os arquivos para um repositório no GitHub.
3. Mantenha o arquivo `athos.glb` na mesma pasta do `index.html`.
4. No GitHub, abra **Settings > Pages**.
5. Em **Build and deployment**, escolha **Deploy from a branch**.
6. Selecione a branch `main` e a pasta `/root`.
7. Abra o link HTTPS gerado pelo GitHub Pages no celular.

## Arquivos principais

- `index.html` — tela principal do Athos AR.
- `style.css` — visual do sistema.
- `app.js` — botões, fala, missões, tamanho, AR e controles.
- `athos.glb` — modelo 3D do Athos.
- `manifest.webmanifest` — instalação como app/PWA.
- `sw.js` — cache básico do app.
- `moldes/` — imagens dos moldes para imprimir.

## Observações importantes

- No Android, o AR funciona melhor pelo Chrome atualizado, com suporte a ARCore/Google Play Services for AR.
- No iPhone, para AR nativo via Quick Look, normalmente é necessário também gerar e colocar um arquivo `athos.usdz` na pasta do projeto. Sem isso, o iPhone pode abrir só o 3D normal.
- Se trocar o modelo 3D no futuro, substitua o arquivo `athos.glb` e mantenha exatamente esse nome.
- Se o modelo ficar muito grande ou pequeno, use o controle de tamanho dentro do sistema.

## Rodapé

Powered by thIAguinho Soluções Digitais
