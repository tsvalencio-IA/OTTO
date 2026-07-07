# Athos Adventure 3D+ — V46.1 Render Premium Corrigido

Base: V45 estável.

Correção desta versão:
- integra a camada `assets/render-v46` do Gemini de forma segura;
- corrige o `safe()` do módulo para preservar `this` e não quebrar `install/rebuildWorld/dispose`;
- mapeia os mundos do jogo (`field/fire/forest/castle/space/arena/real`) para os mundos do render V46;
- desativa as camadas visuais experimentais antigas V442/V45 para o V46 ser a camada visual principal;
- mantém joystick, B Poder, Quiz/Falar, data-action, data-move, data-world, model-viewer e athos.glb;
- Real/AR não usa câmera falsa; abre AR nativo via model-viewer com `ar-placement="floor"` e `ar-scale="fixed"`;
- se o aparelho não suportar AR nativo, o jogo não cria câmera fake.

Abrir após subir:

`?v=461-render-premium-corrigido`

Teste:

`F12_TESTE_ATHOS_V461_RENDER_PREMIUM_CORRIGIDO.js`
