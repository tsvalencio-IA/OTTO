# Athos AR do Otto — GitHub Pages

Sistema pronto para subir no GitHub Pages com o personagem **Athos** em 3D.

## Como subir

1. Extraia o ZIP.
2. Envie todos os arquivos para um repositório do GitHub.
3. Vá em **Settings > Pages**.
4. Em **Build and deployment**, escolha **Deploy from a branch**.
5. Selecione **main** e **/root**.
6. Abra o link HTTPS gerado pelo GitHub Pages no celular.

## Arquivo 3D

O arquivo já está incluído como:

```txt
athos.glb
```

Se quiser trocar o modelo depois, substitua esse arquivo mantendo o mesmo nome.

## Modos do sistema

### Brincar com câmera

Este é o modo mais garantido para criança brincar. Ele abre a câmera dentro da página e coloca o Athos por cima da imagem. Nesse modo, os botões funcionam:

- Mini
- Normal
- Gigante
- Girar
- Dançar
- Pular
- Mover
- Falar

### AR real

O botão **AR real** tenta abrir o visualizador nativo do celular.

No Android, pode abrir pelo visualizador do Google/Scene Viewer. Quando isso acontece, a página pode sair de cena e os botões da página deixam de controlar o boneco. Isso é limitação do visualizador nativo, não erro do projeto.

Para brincar com ações funcionando, use **Brincar com câmera**.

## Observação técnica

O `athos.glb` enviado não possui animações internas no próprio arquivo. Por isso, o sistema simula Dançar, Girar e Pular pela interface.

## Cache

Esta versão remove o Service Worker antigo para evitar que o GitHub Pages fique mostrando versão velha em cache.

## Rodapé

Powered by thIAguinho Soluções Digitais
