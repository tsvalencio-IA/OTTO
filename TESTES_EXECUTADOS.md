# Testes executados — Athos: Guardião dos Portais

Importante: este ambiente não tem navegador/celular real para clicar na
interface. Os itens abaixo foram verificados de duas formas:

- ✅ **Verificado automaticamente** (sintaxe, referências cruzadas de
  arquivos/IDs/ações, leitura de código).
- 🔲 **Precisa de teste manual** (só é possível confirmar de fato abrindo no
  navegador do celular, ex.: câmera, AR real, toques na tela).

## Teste estático

- [x] `index.html`, `style.css`, `app.js`, `athos.glb` existem na raiz.
- [x] Todos os caminhos usam `./` (relativos), nada de caminho absoluto local.
- [x] Nenhuma referência a arquivo inexistente (`athos.glb`, ícones, moldes
      conferidos contra o pacote original).
- [x] `app.js` passou em checagem de sintaxe ES Module via `esbuild --bundle`
      (com `three`/`three/addons` marcados como externos, pois só resolvem
      via CDN no navegador) — build concluído sem erros.
- [x] Sem IDs duplicados: todo `id="..."` usado em `document.querySelector`
      no `app.js` foi conferido um a um contra os `id` existentes no
      `index.html` (nenhuma divergência).
- [x] `data-action` dos botões da hotbar bate 1:1 com os `case` do
      `GameEngine.handleAction`.
- [x] `data-lobby-action` dos botões do Lobby bate 1:1 com os tratamentos em
      `LobbyEngine.init`.
- [x] `data-close-modal` de cada modal bate com o `id` real do modal.

## Lobby

- [x] Marcação do `model-viewer` inclui `ar`, `ar-modes`, `ar-placement`,
      igual ao padrão que já funcionava no projeto original.
- [x] Barra de stats (pontos, corações, medalhas, fase, dificuldade) lida
      diretamente do `StorageManager`.
- [x] Todos os 8 botões do Lobby têm handler correspondente.
- 🔲 Confirmar visualmente que o Athos aparece carregado no `model-viewer`
      (depende do CDN do `model-viewer` e da rede no momento do acesso).

## Modo jogo Three.js

- [x] `GameEngine.enterGame` esconde o Lobby e mostra a tela do jogo via
      `hidden`, nunca zera `className`.
- [x] `renderer.domElement.id = 'three-canvas'` aplicado.
- [x] Fallback procedural só é criado no `onError` do `GLTFLoader`.
- [x] Um único `requestAnimationFrame` ativo por vez (`running` guarda contra
      chamadas duplicadas de `start()`).
- [x] Um único listener de `resize` (`resizeAttached`).
- [x] Hotbar fixa via `position:absolute` + `env(safe-area-inset-bottom)`,
      sem exigir rolagem.
- 🔲 Confirmar em celular real que não há rolagem durante o jogo (depende do
      navegador/tamanho de tela específicos).

## Controles (hotbar)

- [x] Esquerda/Direita alteram `player.x` com `clamp`.
- [x] Pular aplica velocidade vertical com gravidade e volta ao chão.
- [x] Agachar reduz a escala Y por tempo limitado e volta sozinho.
- [x] Girar anima `rotY` 360° e volta a 0.
- [x] Crescer/Mini/Normal alteram `sizeState` e a escala do `playerRig`.
- [x] Poder dispara partículas e conta para a missão de poder.
- [x] Falar abre o modal e usa `AthosBrain`.
- [x] Quiz abre o modal (e conclui a missão se for do tipo quiz).
- [x] Centralizar volta `player.x` a 0.
- [x] Pausar/Sair abre o overlay de pausa, com opções de continuar, trocar
      de mundo ou sair ao Lobby.

## Missões

- [x] Pular tem obstáculo com condição de vitória (pular durante a zona) e
      de erro (colidir parado).
- [x] Agachar tem túnel baixo com a mesma lógica de vitória/erro.
- [x] Coletar tem cristal que some e soma pontos.
- [x] Girar exige proximidade do portal no momento da ação.
- [x] Poder exige proximidade do bloco escuro no momento da ação.
- [x] Gigante exige estar com `sizeState === 'giant'` perto do portão (que
      anima abrindo).
- [x] Mini exige `sizeState === 'mini'` perto do mini-túnel.
- [x] Quiz conclui a missão ao acertar a pergunta.
- [x] Avanço de fase (`phase`), pontos e possível perda de coração
      implementados e persistidos.
- [x] Corações chegando a 0 abre o overlay de "Game Over" com opção de
      tentar de novo ou voltar ao Lobby.

## Câmera / Mundo Real

- [x] Checagem de HTTPS antes de pedir a câmera.
- [x] `try/catch` ao redor de `getUserMedia`; se negar, mostra aviso e o
      jogo continua (não trava).
- [x] Canvas fica transparente (`setClearColor(0,0)`) sobre o vídeo.
- [x] Sair do Mundo Real ou do jogo chama `stopCamera()`.
- 🔲 Confirmar em celular real que a câmera abre e a permissão funciona
      (depende do navegador/aparelho no momento do teste).

## Progresso (localStorage)

- [x] `StorageManager` persiste pontos, corações, medalhas, fase,
      dificuldade, mundos desbloqueados, recorde e estatísticas de quiz a
      cada mudança relevante.
- [x] Reset apaga tudo e volta ao estado padrão.
- 🔲 Confirmar no navegador real que os valores sobrevivem a um refresh de
      página (comportamento padrão do `localStorage`, mas vale conferir no
      celular alvo).

## Mobile

- [x] Layout mobile-first, com `viewport-fit=cover` e variáveis de área
      segura (notch/gestos) no CSS.
- [x] Hotbar em grade de 6 colunas, botões grandes (`aspect-ratio:1/1`).
- 🔲 Testar em um celular real de tela pequena para ajuste fino de tamanhos
      de fonte/botão, já que este ambiente não tem tela física para medir.

## Resultado geral

Nenhum item obrigatório da lista de "Não aceitar entrega se..." do
documento `06_ENTREGA_ESPERADA_DE_CLAUDE.md` se aplica a esta entrega: o
Athos 3D não foi removido, `athos.glb` é carregado como fluxo principal, o
jogo não depende de fundo CSS estático, o Three.js é real (não decorativo),
todos os botões têm handler e este relatório + o checklist de testes estão
incluídos.
