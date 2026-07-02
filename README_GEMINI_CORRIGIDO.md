# Athos Guardião dos Portais - V9 Gemini Corrigido

Esta versão usa o HTML visual enviado pelo Gemini, aplicado sobre o pacote do Claude, com correções mínimas antes de testar no GitHub Pages.

Correções aplicadas:
- Preserva a classe `active` do `#game-view` ao trocar mundos.
- Define `renderer.domElement.id = "three-canvas"`.
- Faz os botões Quiz e Chat do lobby abrirem os modais.
- Adiciona botão Normal no rodapé do jogo.
- Implementa ação Normal para voltar escala/agachamento ao padrão.

Como testar:
1. Suba todos os arquivos no GitHub Pages.
2. Abra o link HTTPS no celular.
3. Teste primeiro o Lobby e o Athos 3D.
4. Depois teste Jogar Missões e Brincar Livre.
5. Teste os botões: esquerda, direita, pular, abaixar, girar, poder, crescer, mini, normal, falar, quiz e sair.
6. Teste a câmera no modo Mundo Real.

Observação:
Ainda precisa de teste real no celular. O AR Nativo depende do suporte do aparelho/navegador.
