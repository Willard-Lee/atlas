// ── CodeMirror 6 live-preview extension ──────────────────────────────────────
// Renders markdown "as you type" by decorating the syntax tree: heading marks
// are hidden and the line is enlarged, emphasis/code marks are hidden, and
// fenced code gets a block style. The document stays literal markdown text —
// these are visual decorations only, so `body` round-trips losslessly.
//
// Marks reappear (become editable) when the cursor/selection is on that node.

import { EditorState, type Extension, type Range } from "@codemirror/state";
import { Decoration, type DecorationSet, EditorView, ViewPlugin, type ViewUpdate } from "@codemirror/view";
import { syntaxTree } from "@codemirror/language";

const hideMark  = Decoration.replace({});
const codeLine  = Decoration.line({ class: "cm-live-codeblock" });
const headLine  = (lvl: number) => Decoration.line({ class: `cm-live-h${lvl}` });
const markDeco  = (cls: string) => Decoration.mark({ class: cls });

const EMPH: Record<string, string> = {
    StrongEmphasis: "cm-live-strong",
    Emphasis:       "cm-live-em",
    InlineCode:     "cm-live-code",
    Strikethrough:  "cm-live-strike",
};

/** True if any selection range touches [from, to]. */
function touches(state: EditorState, from: number, to: number): boolean {
    return state.selection.ranges.some((r) => r.from <= to && r.to >= from);
}

function buildDecorations(view: EditorView): DecorationSet {
    const decos: Range<Decoration>[] = [];
    const { state } = view;

    for (const { from, to } of view.visibleRanges) {
        syntaxTree(state).iterate({
            from,
            to,
            enter: (node) => {
                const name = node.name;

                // ── ATX headings: enlarge the line, hide the "### " prefix ──
                const h = /^ATXHeading(\d)$/.exec(name);
                if (h) {
                    const level = Number(h[1]);
                    const line  = state.doc.lineAt(node.from);
                    decos.push(headLine(level).range(line.from));
                    if (!touches(state, line.from, line.to)) {
                        const text = state.doc.sliceString(line.from, line.to);
                        const m = /^#{1,6}\s*/.exec(text);
                        if (m && m[0].length) decos.push(hideMark.range(line.from, line.from + m[0].length));
                    }
                    return;
                }

                // ── Fenced code: block styling on every line of the fence ──
                if (name === "FencedCode") {
                    const first = state.doc.lineAt(node.from).number;
                    for (let n = first; ; n++) {
                        const line = state.doc.line(n);
                        decos.push(codeLine.range(line.from));
                        if (line.to >= node.to) break;
                    }
                    return;
                }

                // ── Emphasis / inline code / strikethrough: style content ──
                if (EMPH[name]) {
                    decos.push(markDeco(EMPH[name]).range(node.from, node.to));
                    return;
                }

                // ── Their delimiter marks: hide unless the node is being edited ──
                if (name === "EmphasisMark" || name === "CodeMark" || name === "StrikethroughMark") {
                    const parent = node.node.parent;
                    if (parent && !touches(state, parent.from, parent.to)) {
                        decos.push(hideMark.range(node.from, node.to));
                    }
                }
            },
        });
    }

    // Decoration.set sorts + validates ordering for us.
    return Decoration.set(decos, true);
}

export function livePreview(): Extension {
    return ViewPlugin.fromClass(
        class {
            decorations: DecorationSet;
            constructor(view: EditorView) {
                this.decorations = buildDecorations(view);
            }
            update(u: ViewUpdate) {
                if (u.docChanged || u.selectionSet || u.viewportChanged) {
                    this.decorations = buildDecorations(u.view);
                }
            }
        },
        { decorations: (v) => v.decorations },
    );
}
