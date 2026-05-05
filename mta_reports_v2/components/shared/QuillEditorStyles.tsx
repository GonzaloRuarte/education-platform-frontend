'use client'

import { COLORS, TITLE_FONT_FAMILY } from '@/mta_reports_v2/constants'

const C = COLORS

/**
 * Global styles for slide-embedded Quill editors.
 *
 * Renders <style jsx global> targeting two class roots:
 *   .portada-editor      — used by PortadaTab (transparent toolbar, hero typography)
 *   .editable-section-editor — used by EditableContentSection (toolbar with body/title variants)
 *
 * Mount once per slide that needs it. Co-locating both rules avoids duplicating ~60 lines
 * of near-identical .ql-* CSS across the two callers.
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
      z-index: 2;
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
      font-size: clamp(26px, 3.6vw, 38px);
      font-weight: 800;
      line-height: 1.05;
      color: ${C.midNavy};
    }

    .body-editor .ql-editor {
      font-size: clamp(18px, 2.2vw, 24px);
      line-height: 1.48;
      font-weight: 400;
    }
  `}</style>
)

export { QuillEditorStyles }
