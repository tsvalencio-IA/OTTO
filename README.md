# Athos: Guardião dos Portais V41 — Game Feel / Jogabilidade

Esta versão parte da V40 válida e mexe somente na camada de jogabilidade/sensação de controle.

## Regra desta versão

Não foram alterados layout dos botões, dock mobile, IDs, data-actions, data-move, data-world, AR, model-viewer, athos.glb, Quiz/Falar no lobby, render/câmera V40 ou estrutura HTML dos controles.

## Melhorias aplicadas

- joystick com deadzone radial real, curva progressiva e retorno limpo ao centro;
- input suavizado, com liberação rápida para o Athos parar ao soltar;
- aceleração e desaceleração separadas para chão e ar;
- correção de botão Y/Abaixar para não disputar `data-hold` com `data-action`;
- botões de movimento com `setPointerCapture` para reduzir controle preso;
- parada horizontal segura quando não há joystick, teclado ou botão direcional ativo;
- pulo arcade sem teleporte brusco, com impulso para frente/lado por velocidade;
- coyote time calibrado;
- jump buffer preservado e calibrado;
- cooldown curto contra duplo pulo acidental;
- snap de plataforma ao cair perto do topo da caixa;
- amortecimento horizontal leve na aterrissagem;
- API de teste expõe `getGameFeel()` e estado de input.

## Como subir

Suba todos os arquivos deste ZIP na raiz do repositório `OTTO`, mantendo as pastas `icons/`, `assets/` e `moldes/`.

## Teste

Use `F12_TESTE_ATHOS_V41_GAME_FEEL.js` no Console do navegador após o deploy.

Teste manual principal:

1. Entrar em Jogar Fases 3D.
2. Não tocar em nada: Athos precisa ficar parado.
3. Segurar joystick para o fundo e soltar: precisa parar sem escorregar.
4. Apertar A perto da borda/caixa: pulo precisa responder.
5. Segurar A pouco antes de tocar na plataforma: jump buffer/coyote deve ajudar.
6. Segurar Y e soltar: Athos precisa abaixar e voltar sem travar.
7. Abrir/fechar modal, trocar mundo e voltar: não pode andar sozinho.

## O que NÃO foi mexido

- `athos.glb`;
- AR Nativo;
- Brincar Livre AR;
- Three.js/model-viewer;
- dock mobile e controles V39;
- Quiz/Falar somente no lobby;
- render/câmera V40;
- lógica de fases, inimigos, poder e progresso.
