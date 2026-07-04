# V21 — Jogabilidade 3D mais longa e objetiva

Arquivos alterados neste pacote:

- `index.html`

O que foi corrigido/evoluído:

1. Mantive apenas o arquivo alterado para você substituir manualmente pelo celular.
2. Removi a dependência de aviso grande de rotação no meio da tela.
3. Corrigi a experiência de fase curta: as fases agora são bem mais longas.
4. A câmera agora acompanha o Athos de trás, dando sensação de profundidade.
5. O controle mudou para ficar mais natural:
   - Frente: avança na fase.
   - Voltar: volta na fase.
   - Esq/Dir: muda de lado na pista.
   - A + Frente: pulo longo.
   - B: bola de fogo contra inimigos e blocos escuros.
6. O portal agora fica no centro do caminho, mais fácil de alcançar.
7. O pulo ficou um pouco mais alto e a gravidade mais leve.
8. As fases têm mais distância, mais cristais, inimigos, lava, túneis, portões, plataformas e objetivos.
9. Corrigi riscos de estado salvo quebrado usando chave nova `athos-v21-state`.

Como testar:

1. Substitua somente o `index.html` do seu repositório.
2. Aguarde o GitHub Pages atualizar.
3. No celular, limpe cache/recarregue forçado se ainda abrir a versão velha.
4. Entre em `Jogar Fases`.
5. Teste segurando `Frente` e apertando `A Pular+`.
6. Use `◀ Esq` e `▶ Dir` para mudar de lado na pista.

Observação importante:

Se o celular estiver com rotação automática bloqueada no Android, nenhum site consegue obrigar totalmente a tela a virar. O código tenta abrir tela cheia e travar em paisagem quando o navegador permite, mas o bloqueio do sistema ainda pode impedir.
