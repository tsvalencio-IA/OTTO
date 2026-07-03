# Athos: Guardião dos Portais — V12 3D/AR Restaurado

Esta versão foi reconstruída voltando para a base visual/3D da V9 Gemini, sem evoluir em cima da V11.

## O que foi preservado

- `athos.glb` preservado.
- `model-viewer` preservado no lobby.
- Botão de AR nativo preservado.
- Three.js preservado no modo jogo.
- Câmera real preservada no mundo real.
- Render visual voxel da V9 preservado.
- Quiz preservado.
- Chat/Falar com Athos preservado.
- Pontos, vidas, medalhas e localStorage preservados.
- Moldes e ícones preservados.

## O que foi corrigido/evoluído

- Não usa mais a V11 como base.
- Corrigido o risco de apagar a classe `active` do jogo ao trocar de mundo.
- Canvas do Three.js agora recebe `id="three-canvas"`.
- Botão **Sair** fixo no topo dentro do jogo.
- Botão **Sair** também no controle inferior.
- Controle inferior redesenhado em estilo videogame/Nintendo:
  - direcional à esquerda;
  - botões A/B/X/Y à direita;
  - botões Mini, Normal, Gigante, Falar, Quiz e Sair no centro.
- Missões agora são sequenciais, não aleatórias.
- Primeiras missões são treino guiado.
- Depois entram fases reais com combinações de ações.
- O jogo mostra o próximo comando esperado.
- O botão correto fica destacado/piscando.
- Ao apertar botão errado, a V12 orienta qual botão usar em vez de punir injustamente.
- Ações Frente/Voltar foram implementadas no eixo Z do Three.js.
- Ação Normal foi mantida para restaurar tamanho do Athos.

## Como testar

1. Suba todos os arquivos no GitHub Pages.
2. Abra pelo celular usando o link HTTPS.
3. Teste o lobby e veja se o Athos aparece em 3D.
4. Toque em **Projetar no Mundo Real** para testar AR nativo.
5. Toque em **Jogar Missões**.
6. Siga o botão destacado no controle inferior.
7. Teste **Brincar Livre**.
8. No Brincar Livre, troque mundos e use os controles sem punição.

## Observação importante

Esta é uma restauração correta do 3D/AR + controle preciso. Ela não promete ainda um Mario Bros completo com colisão avançada. A próxima etapa deve criar fases com plataforma/colisão reais em cima desta base, sem remover o 3D, o AR e os renders.
