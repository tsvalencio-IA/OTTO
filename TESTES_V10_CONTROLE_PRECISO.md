# Testes V10 — Controle Preciso

Verificações estáticas executadas:

- `athos.glb` continua referenciado.
- `model-viewer` continua presente para AR nativo.
- Three.js e GLTFLoader continuam presentes.
- Controle inferior estilo Nintendo foi incluído.
- Botões de esquerda, direita, pular, abaixar, girar, poder, mini, normal, gigante, falar, quiz e sair existem.
- A ação `normal` foi implementada.
- Removido risco de `className = ''` apagar a classe `active` do jogo.
- Canvas do Three.js recebe `id="three-canvas"`.
- Missões agora destacam o botão correto com `ctrlTarget`.
- No modo Fácil, erro orienta o botão correto em vez de tirar vida.

Teste manual recomendado no celular:

1. Abrir pelo GitHub Pages em HTTPS.
2. Entrar em **Jogar missões**.
3. Seguir apenas o botão destacado.
4. Confirmar que cada instrução aceita exatamente o botão indicado.
5. Testar **Brincar livre** e trocar mundos manualmente.
