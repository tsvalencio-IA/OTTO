# Athos: Guardião dos Portais

Jogo infantil 3D/AR do Athos para o Otto brincar no celular, com missões reais em
Three.js, quiz, fala local do Athos e AR nativo via `model-viewer`. Roda 100% estático,
sem backend, sem npm, sem build — pronto para o GitHub Pages.

## Como publicar no GitHub Pages

1. Suba todos os arquivos deste ZIP na raiz do repositório (ou de uma branch/pasta
   configurada como fonte do GitHub Pages).
2. Confirme que `athos.glb` ficou na raiz, junto de `index.html`.
3. Ative o GitHub Pages nas configurações do repositório, apontando para a branch/pasta.
4. Abra o link `https://SEU-USUARIO.github.io/SEU-REPOSITORIO/` pelo Chrome do Android
   (ou Safari do iPhone). A câmera e o AR real só funcionam em HTTPS.

## Como testar localmente

Como o jogo usa ES Modules (`import`), não pode ser aberto direto como arquivo
(`file://`). Rode um servidor local simples, por exemplo:

```bash
cd pasta-do-projeto
python3 -m http.server 8080
```

Depois abra `http://localhost:8080` no navegador do computador ou do celular
(na mesma rede Wi-Fi, trocando `localhost` pelo IP do computador).

## Estrutura dos arquivos

- `index.html` — Lobby, tela do jogo 3D, hotbar e todos os modais (quiz, falar,
  coleção, dificuldade, pausa).
- `style.css` — Visual voxel/blockcraft, HUD, hotbar fixa, responsivo mobile-first.
- `app.js` — Toda a lógica: Three.js, missões, mundos, quiz, fala local,
  localStorage. Um único arquivo modularizado internamente (veja
  `RELATORIO_CLAUDE.md` para a explicação de cada módulo).
- `athos.glb` — Modelo 3D do Athos (não foi alterado).
- `manifest.webmanifest` — PWA leve (ícone, tela cheia, tema).
- `icons/`, `moldes/` — Reaproveitados do projeto original.
- `.nojekyll` — Evita que o GitHub Pages tente processar a pasta com Jekyll.

Não há `sw.js` (service worker) nesta entrega: como o projeto já sofreu com cache
antigo travando versões novas, preferi não adicionar um novo service worker agora.
O `app.js` já cancela/desregistra qualquer service worker de versões anteriores ao
carregar, então instalações antigas do PWA vão se autolimpar.

## Modos do jogo

- **Jogar Missões**: modo principal, com objetivos reais, corações, pontos, tempo
  (a partir do nível Médio) e progressão de mundos.
- **Brincar Livre**: mesma engine 3D, sem corações, sem tempo, com todos os mundos
  liberados (inclusive o "Mundo Real" com a câmera do celular).
- **AR Nativo**: abre o visualizador de realidade aumentada do próprio aparelho
  (depende do navegador/celular).

## Limitações conhecidas

Veja a seção "Limitações conhecidas" em `RELATORIO_CLAUDE.md`.

---
Powered by thIAguinho Soluções Digitais.
