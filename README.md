# Athos: Guardião dos Portais — V14 Jogo 3D/AR

Versão reconstruída para preservar o coração do projeto: Athos 3D real, AR nativo, câmera real, Three.js, controle estilo videogame e fases com objetivos reais.

## Como subir no GitHub Pages

1. Envie todos os arquivos deste ZIP para o repositório.
2. Confirme que `athos.glb` está na mesma pasta do `index.html`.
3. Ative: Settings > Pages > Deploy from branch > main > root.
4. Abra pelo link HTTPS no celular.

## O que testar primeiro

1. Lobby com Athos 3D girando.
2. Botão AR Nativo do model-viewer.
3. Jogar Fases.
4. Brincar Livre AR com câmera.
5. Controle: esquerda, direita, frente, voltar, pular, abaixar, girar, poder, mini, normal e gigante.
6. Fases: coletar cristais, pular lava, abaixar em túnel, abrir portão gigante, quebrar bloco escuro e entrar no portal.
7. Quiz, chat e coleção.

## Observações

- O AR Nativo depende do celular/navegador. Android normalmente usa Scene Viewer/WebXR; iOS usa Quick Look quando compatível.
- O modo Brincar Livre AR mantém a câmera real dentro da página, permitindo que os botões continuem funcionando.
- O jogo principal usa Three.js e carrega `athos.glb` com GLTFLoader.
