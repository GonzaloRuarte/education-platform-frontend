'use client'

import { COLORS, FONT_WEIGHTS, TITLE_FONT_FAMILY, Z_INDEX } from '@/mta_reports_v2/constants'

const C = COLORS
const W = FONT_WEIGHTS

/**
 * Estilos globales para los editores Quill embebidos en las slides.
 *
 * Renderiza <style jsx global> apuntando a dos raíces de clase:
 *   .portada-editor      - usado por PortadaTab (toolbar transparente, tipografía hero)
 *   .editable-section-editor - usado por EditableContentSection (toolbar con variantes body/title)
 *
 * Montar una vez por slide que lo necesite. Colocar ambas reglas juntas evita duplicar ~60 líneas
 * de CSS .ql-* casi idéntico entre los dos callers.
 */
const QuillEditorStyles = () => (
  <style jsx global>{`
    .portada-editor,
    .editable-section-editor {
      position: relative;
    }

    .portada-editor .ql-toolbar.ql-snow,
    .editable-section-editor .ql-toolbar.ql-snow {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      z-index: ${Z_INDEX.toolbar};
      border: 1px solid ${C.navyAlpha12};
      background: ${C.lightBlueAlpha22};
      border-radius: 18px;
      opacity: 0;
      pointer-events: none;
      transform: translateY(-12px);
      transition: opacity 0.18s ease, transform 0.18s ease;
    }

    .portada-editor .ql-toolbar.ql-snow {
      padding: 8px 10px;
    }

    .editable-section-editor .ql-toolbar.ql-snow {
      padding: 10px 12px;
    }

    .portada-editor.is-active .ql-toolbar.ql-snow {
      opacity: 1;
      pointer-events: auto;
      transform: translateY(calc(-100% - 8px));
    }

    .editable-section-editor.is-active .ql-toolbar.ql-snow {
      opacity: 1;
      pointer-events: auto;
      transform: translateY(calc(-100% - 12px));
    }

    .portada-editor .ql-container.ql-snow,
    .editable-section-editor .ql-container.ql-snow {
      border: 0;
      font-family: inherit;
    }

    .portada-editor .ql-editor,
    .portada-editor .ql-editor * {
      color: ${C.navy} !important;
    }

    .portada-editor .ql-editor {
      padding: 0;
      text-align: left;
      white-space: normal;
      overflow-wrap: anywhere;
      word-break: break-word;
    }

    .editable-section-editor .ql-editor {
      color: ${C.midNavy};
      padding: 0;
      white-space: normal;
      overflow-wrap: anywhere;
      word-break: break-word;
    }

    .portada-editor .ql-editor p,
    .editable-section-editor .ql-editor p {
      margin: 0;
    }

    .editable-section-editor .ql-editor ul,
    .editable-section-editor .ql-editor ol {
      padding-left: 1.5rem;
      margin: 0;
    }

    .editable-section-editor .ql-editor li {
      margin-bottom: 0.6em;
    }

    .editable-section-editor .ql-editor li > .ql-ui::before {
      font-size: 2em;
      line-height: 1;
    }

    .editable-section-editor .ql-editor blockquote {
      border-left: 4px solid ${C.lightBlue};
      padding-left: 16px;
    }

    .portada-editor.is-readonly .ql-container.ql-snow,
    .editable-section-editor.is-readonly .ql-container.ql-snow {
      pointer-events: none;
    }

    .portada-editor.is-readonly .ql-editor,
    .editable-section-editor.is-readonly .ql-editor {
      cursor: default;
    }

    .title-editor .ql-editor {
      font-family: ${TITLE_FONT_FAMILY};
      font-size: min(3cqi, 38px);
      font-weight: ${W.extrabold};
      line-height: 1.05;
      color: ${C.midNavy};
    }

    .body-editor .ql-editor {
      font-size: min(1.9cqi, 24px);
      line-height: 1.4;
      font-weight: ${W.normal};
    }
  `}</style>
)

export { QuillEditorStyles }
