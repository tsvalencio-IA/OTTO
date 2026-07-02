# Athos: Guardião dos Portais — V10 Controle Preciso

Esta versão corrige o problema de missões marcando erro quando a criança segue a instrução.

## O que mudou

- Novo controle inferior estilo Nintendo: direcional à esquerda, botões A/B/X/Y à direita e utilitários no centro.
- A missão agora mostra exatamente o próximo botão esperado.
- O botão correto fica destacado/piscando.
- No modo Fácil, ação errada não tira vida; apenas orienta o Otto sobre o botão correto.
- No modo Difícil, erro tira coração.
- Missões passaram a ser sequenciais, não sorteadas aleatoriamente, para evitar instrução confusa.
- Mundo da missão fica travado no modo missão para não quebrar a lógica.
- Botões revisados: esquerda, direita, pular, abaixar, girar, poder, mini, normal, gigante, falar, quiz e sair.
- Three.js inicia apenas uma vez e mantém `athos.glb` como personagem principal.
- AR nativo com `model-viewer` continua no lobby.

## Como testar

1. Suba tudo no GitHub Pages.
2. Abra no celular pelo link HTTPS.
3. Toque em **Jogar missões**.
4. Siga somente o botão destacado na tela.
5. Teste os botões: direcional, A, B, X, Y, Mini, Normal, Gigante, Falar, Quiz e Sair.
6. Depois teste **Brincar livre** para trocar mundos manualmente.

## Observação

O jogo principal é o modo Three.js com controle preciso. O AR nativo é um modo extra do celular e pode não aceitar controles dentro do visualizador do aparelho.
