# Athos: Guardião dos Portais V35 — Render Premium

**Powered by thIAguinho Soluções Digitais**

Esta versão foi feita para corrigir o problema apontado: a V34 passou nos testes técnicos, mas o visual ficou pobre/simplificado. A V35 preserva a base funcional e melhora o render sem remover AR, 3D ou mecânicas.

## O que foi mantido

- `athos.glb` intacto.
- `model-viewer` e AR Nativo.
- Brincar Livre / AR por câmera.
- Three.js com jogo 3D.
- Joystick, setas de profundidade e botões A/B/Y/X/N.
- Quiz com 80+ perguntas.
- Falar com Athos.
- Cristais, inimigos, portais, fases, checkpoints, medalhas e progresso.

## O que foi melhorado visualmente

- Iluminação com tone mapping ACES.
- Luz ambiente, hemisférica, luz principal e luz de recorte.
- Céu/atmosfera por mundo.
- Chão com tiles voxel por faixa, não só plano liso.
- Marcadores de profundidade e arcos laterais.
- Árvores/castelo/vulcão/espaço/arena com set pieces mais ricos.
- Portais com glow, disco interno, torus animado e point light.
- Cristais com glow e luz própria.
- Lava com emissão e brilho.
- Inimigos com olhos, asas, espinhos, braços/coroa conforme tipo.
- Interface com acabamento mais premium e menos “demo cinza”.

## Como subir

Suba todos os arquivos e pastas para a raiz do repositório `OTTO`, mantendo:

```text
index.html
app.js
style.css
athos.glb
manifest.webmanifest
sw.js
.nojekyll
icons/
assets/
moldes/
```

## Teste

Depois do GitHub Pages atualizar, abra o jogo, pressione F12 > Console e rode `F12_TESTE_ATHOS_V35_RENDER_PREMIUM.js`.

## Observação honesta

Esta versão corrige o foco visual/render. O teste técnico não mede beleza; por isso a validação visual precisa ser feita abrindo a fase no navegador/celular.
