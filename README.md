# Athos: Guardião dos Portais V37 — Auditoria Total

Powered by thIAguinho Soluções Digitais

Esta versão foi feita após a reclamação de que a V36 ainda escorregava sozinha no modo AR/3D e que os controles não estavam confiáveis. A V37 não é uma versão de visual novo: é uma versão de auditoria total de fluxo, telas, botões, inputs e estado interno.

## Correções principais da V37

- Zera totalmente joystick, setas, teclado, crouch e estados visuais ao entrar no jogo, sair, abrir/fechar modal, trocar mundo, perder foco da página e sair do jogo.
- Zera `joy.x`, `joy.z`, `joy.pointerId` e o botão visual do joystick; isso corrige o boneco andando/escorregando sozinho.
- Zera velocidade horizontal `p.vx` e `p.vz` quando é troca de modo/mundo/modal/saída.
- Aceleração e desaceleração do Athos foram ajustadas: sem input, o personagem para rapidamente em vez de continuar deslizando.
- Botões de movimento agora ficam só com `data-move`; eles não competem com `data-action`.
- AR Nativo, Brincar Livre AR, 3D, `athos.glb`, model-viewer, Three.js, quiz e fases foram mantidos.
- Fullscreen/lock de orientação não é mais forçado, porque isso atrapalhava layout e toque em alguns Androids.
- Layout mobile recebeu camada final: controles fixos embaixo, mundo compacto, objetivo sem bloquear e tutorial escondido durante gameplay.

## Não removido

- `athos.glb`
- `model-viewer`
- AR Nativo
- Brincar Livre / AR por câmera
- Three.js
- Joystick
- Botões A/B/Y/X/N/R/I/Quiz/Falar/Pausa/Sair
- Quiz 80+
- Falar com Athos
- Portais, fases, inimigos, cristais, medalhas e progresso local

## Como subir

Suba o conteúdo deste ZIP na raiz do repositório `OTTO`, mantendo:

```text
index.html
app.js
style.css
athos.glb
manifest.webmanifest
sw.js
.nojekyll
404.html
icons/
moldes/
```

## Teste manual obrigatório

1. Abrir o jogo no celular.
2. Entrar em Jogar Fases 3D.
3. Sem tocar em nada, confirmar que Athos fica parado.
4. Usar joystick para frente, trás, esquerda, direita e diagonal.
5. Soltar o joystick e confirmar que Athos para.
6. Apertar A parado e andando.
7. Apertar B parado e andando.
8. Abrir Quiz e fechar; depois confirmar que Athos não anda sozinho.
9. Abrir Falar com Athos e fechar; depois confirmar que Athos não anda sozinho.
10. Trocar para Campo/Vulcão/Floresta/Real; depois confirmar que Athos não anda sozinho.
11. Testar Brincar Livre AR/câmera.
12. Testar AR Nativo.

Script técnico: `F12_TESTE_ATHOS_V37_AUDITORIA_TOTAL.js`.
