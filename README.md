# ATHOS V41.1 — HOTFIX POINTER CAPTURE

Base: V41 Game Feel.

Correção isolada após teste F12:
- Corrigido erro JavaScript `NotFoundError: Failed to execute setPointerCapture`.
- Adicionado `safePointerCapture()` com try/catch.
- Aplicado em joystick, botões de movimento e botão Y Abaixar.
- Não altera layout dos controles.
- Não altera AR, model-viewer, athos.glb, Quiz/Falar, render V40 ou game feel V41.
- Mantém Quiz/Falar somente no lobby.

Teste novo:
- `F12_TESTE_ATHOS_V411_POINTER_HOTFIX.js`

Subir todo o conteúdo deste ZIP na raiz do GitHub Pages.
