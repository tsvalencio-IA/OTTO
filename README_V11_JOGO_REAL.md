# Athos: Guardião dos Portais — V11 Jogo Real

Esta versão troca o modelo de “apertar o botão que o jogo manda” por fases reais estilo plataforma 2.5D:

- controle inferior estilo videogame/Nintendo;
- botão **Sair** fixo no topo direito e também no controle inferior;
- Athos 3D carregado por `athos.glb` no jogo via Three.js;
- lobby com `model-viewer` e AR nativo;
- fases com cristais, lava, túneis, portões, blocos escuros e portal de saída;
- Brincar Livre AR com câmera real e botões funcionando;
- quiz, fala do Athos, medalhas, pontos e progresso local.

## Como testar

1. Suba tudo no GitHub Pages.
2. Abra o link HTTPS no celular.
3. Teste primeiro **Jogar fases**.
4. Use o direcional para andar e os botões A/B/X/Y:
   - A / ▲ = pular;
   - B / ▼ = abaixar;
   - X = poder;
   - Y = girar;
   - Mini / Normal / Gigante = muda tamanho;
   - Sair = volta ao lobby.
5. A missão agora é objetiva: pegue cristais, resolva obstáculos e chegue ao portal.

## Observações

- No modo fácil, o jogo é menos punitivo.
- No modo médio/difícil, lava e falhas tiram vida.
- O AR nativo continua dependendo do visualizador do aparelho.
- O modo “Brincar Livre AR” usa a câmera dentro da página para manter os controles funcionando.
