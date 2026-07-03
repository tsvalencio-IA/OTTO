# Athos V13 — Brincar Livre limpo + mapa lateral

Esta versão corrige dois pontos informados no teste da V12:

1. **Brincar Livre não tampa mais a tela**
   - A explicação grande superior foi removida do modo Brincar Livre.
   - O HUD fica compacto, mostrando apenas placar/vidas.
   - A orientação aparece só como toast rápido.

2. **Cenários agora têm continuação lateral**
   - O limite lateral foi ampliado no Brincar Livre.
   - A câmera do Three.js agora acompanha o Athos como side-scroller.
   - O chão 3D foi ampliado.
   - Foram adicionados blocos/decorações distribuídos para esquerda e direita em todos os mundos.
   - O portal fica mais à frente/lado, dando sensação de exploração.

## Mantido

- `athos.glb`
- Athos 3D real
- `model-viewer`
- AR Nativo
- Three.js
- câmera real
- quiz
- chat/fala
- pontos, vidas e medalhas
- controle estilo videogame

## Como testar

1. Suba o ZIP no GitHub Pages.
2. Abra no celular.
3. Entre em **Brincar Livre**.
4. Confirme que a explicação superior não tampa mais a tela.
5. Use Esquerda/Direita várias vezes.
6. Troque os mundos: Câmera Real, Vulcão, Floresta, Castelo e Espaço.
7. Confirme que a câmera acompanha o Athos e o cenário continua lateralmente.
8. Entre em **Jogar Missões** e confirme que o banner de missão ainda aparece só no modo missão.

## Observação

Esta versão ainda não transforma as fases em um jogo de plataforma completo com colisão avançada. Ela restaura e melhora a experiência 3D/AR, limpa o Brincar Livre e cria a base correta de exploração lateral sem remover renders reais.
