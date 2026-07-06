# Athos: Guardião dos Portais V36 — Jogável

Powered by thIAguinho Soluções Digitais

Esta versão corrige o problema real apontado nos prints: a V35 passava no teste técnico, mas a interface de jogo ficava ruim para jogar no celular. A V36 mantém AR, 3D, `athos.glb`, quiz, fases, portais, inimigos, medalhas e render premium, mas reorganiza a jogabilidade mobile.

## Correções principais

- Controles em modo paisagem reposicionados como gamepad real: joystick embaixo à esquerda, ações embaixo à direita e mundos compactos no topo direito.
- Painéis grandes deixam de tampar a fase: objetivo fica compacto e reduz sozinho depois de alguns segundos.
- Tutorial não bloqueia a tela em modo paisagem.
- Joystick ficou mais robusto: pointermove/pointerup agora são tratados no documento, não só dentro do círculo.
- Corrigido movimento grudado: botões de movimento não usam mais `data-action` para manter estado preso; usam `data-move` com limpeza no pointerup/cancel/blur.
- Pulo com resposta mais visível e impulso lateral/profundidade melhor.
- Não força lock de orientação; o layout se adapta ao celular em pé ou deitado.
- Mantém o botão `B Poder` separado por `#powerBtn` e `data-action="power"`.

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

Depois do deploy, abra o jogo no celular primeiro em modo paisagem e teste manualmente:

1. Entrar em Jogar Fases 3D.
2. Arrastar o joystick para frente, trás e diagonal.
3. Apertar A parado e andando.
4. Segurar Fundo + A.
5. Apertar B andando.
6. Girar o celular e verificar se os botões ficam jogáveis.

Também há o script `F12_TESTE_ATHOS_V36_JOGAVEL.js` para teste técnico no console.
