"use client";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { EditorState, EditorSelection } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { livePreview } from "@/lib/cm-live-preview";

export interface LiveEditorHandle {
    insertAtCursor: (text: string, select?: [number, number]) => void;
    setDoc: (text: string) => void;
    focus: () => void;
}

interface Props {
    value: string;
    onChange: (v: string) => void;
    onInsertImages?: (files: File[]) => void;
}

// Wrap the current selection with markers, re-selecting the inner text.
function wrapCmd(before: string, after: string) {
    return (view: EditorView) => {
        const { state } = view;
        const tr = state.changeByRange((range) => {
            const inner  = state.sliceDoc(range.from, range.to) || "text";
            const insert = before + inner + after;
            return {
                changes: { from: range.from, to: range.to, insert },
                range: EditorSelection.range(range.from + before.length, range.from + before.length + inner.length),
            };
        });
        view.dispatch(state.update(tr, { scrollIntoView: true, userEvent: "input" }));
        return true;
    };
}

const theme = EditorView.theme({
    "&": { backgroundColor: "transparent", color: "var(--on-surface)", height: "auto" },
    "&.cm-focused": { outline: "none" },
    ".cm-scroller": { fontFamily: "inherit", overflow: "visible", lineHeight: "1.85" },
    ".cm-content": {
        fontFamily: "var(--reader-font, var(--font-mono))",
        fontSize:   "calc(1.05rem * var(--reader-font-scale, 1))",
        caretColor: "var(--primary)",
        padding:    "0",
        minHeight:  "60vh",
    },
    ".cm-line": { padding: "0" },
    ".cm-cursor, .cm-dropCursor": { borderLeftColor: "var(--primary)" },
    ".cm-selectionBackground, &.cm-focused .cm-selectionBackground": { backgroundColor: "var(--secondary-container)", opacity: "0.35" },
    // headings
    ".cm-live-h1": { fontSize: "2rem",    fontWeight: "700", lineHeight: "1.3" },
    ".cm-live-h2": { fontSize: "1.6rem",  fontWeight: "700", lineHeight: "1.3" },
    ".cm-live-h3": { fontSize: "1.3rem",  fontWeight: "700" },
    ".cm-live-h4": { fontSize: "1.1rem",  fontWeight: "700" },
    ".cm-live-h5": { fontSize: "1rem",    fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em" },
    ".cm-live-h6": { fontSize: "0.9rem",  fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", opacity: "0.8" },
    // blocks + inline
    ".cm-live-codeblock": { fontFamily: "var(--font-mono)", background: "var(--surface-container)", fontSize: "0.9em" },
    ".cm-live-strong": { fontWeight: "700" },
    ".cm-live-em": { fontStyle: "italic" },
    ".cm-live-code": { fontFamily: "var(--font-mono)", background: "var(--surface-container)", padding: "0.1em 0.3em" },
    ".cm-live-strike": { textDecoration: "line-through", opacity: "0.7" },
});

const LiveMarkdownEditor = forwardRef<LiveEditorHandle, Props>(function LiveMarkdownEditor(
    { value, onChange, onInsertImages },
    ref,
) {
    const hostRef   = useRef<HTMLDivElement>(null);
    const viewRef   = useRef<EditorView | null>(null);
    // `value` seeds the initial doc only — the editor is uncontrolled after
    // mount (it re-mounts with the current body each time focus opens). All
    // edits flow OUT via onChange; external resets go through setDoc(). This
    // avoids the controlled-editor feedback loop that fights fast input.
    const initialRef  = useRef(value);
    // Keep callbacks in refs so the once-created EditorView always calls latest.
    const onChangeRef = useRef(onChange);
    const onImagesRef = useRef(onInsertImages);
    onChangeRef.current = onChange;
    onImagesRef.current = onInsertImages;
    // Coalesce onChange to one emit per frame — decouples CM transactions from
    // React setState so rapid input can't trigger a synchronous update storm.
    const pendingRef = useRef<string | null>(null);
    const rafRef     = useRef(0);

    // Create the editor once.
    useEffect(() => {
        if (!hostRef.current) return;
        const state = EditorState.create({
            doc: initialRef.current,
            extensions: [
                keymap.of([
                    { key: "Mod-b", run: wrapCmd("**", "**") },
                    { key: "Mod-i", run: wrapCmd("_", "_") },
                    { key: "Mod-e", run: wrapCmd("`", "`") },
                    { key: "Mod-k", run: wrapCmd("[", "](url)") },
                    { key: "Tab",   run: (v) => { v.dispatch(v.state.replaceSelection("  "), { userEvent: "input" }); return true; } },
                ]),
                history(),
                keymap.of([...defaultKeymap, ...historyKeymap]),
                markdown({ base: markdownLanguage }),
                EditorView.lineWrapping,
                livePreview(),
                theme,
                EditorView.updateListener.of((u) => {
                    if (!u.docChanged) return;
                    pendingRef.current = u.state.doc.toString();
                    if (rafRef.current) return;
                    rafRef.current = requestAnimationFrame(() => {
                        rafRef.current = 0;
                        const v = pendingRef.current;
                        pendingRef.current = null;
                        if (v !== null) onChangeRef.current(v);
                    });
                }),
                EditorView.domEventHandlers({
                    paste(event) {
                        const files = Array.from(event.clipboardData?.items ?? [])
                            .filter((i) => i.type.startsWith("image/"))
                            .map((i) => i.getAsFile())
                            .filter((f): f is File => !!f);
                        if (files.length && onImagesRef.current) { event.preventDefault(); onImagesRef.current(files); return true; }
                        return false;
                    },
                    drop(event) {
                        const files = Array.from(event.dataTransfer?.files ?? []).filter((f) => f.type.startsWith("image/"));
                        if (files.length && onImagesRef.current) { event.preventDefault(); onImagesRef.current(files); return true; }
                        return false;
                    },
                }),
            ],
        });
        const view = new EditorView({ state, parent: hostRef.current });
        viewRef.current = view;
        view.focus();
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            if (pendingRef.current !== null) onChangeRef.current(pendingRef.current); // flush last edit
            view.destroy();
            viewRef.current = null;
        };
    }, []);

    useImperativeHandle(ref, () => ({
        insertAtCursor(text, select) {
            const view = viewRef.current;
            if (!view) return;
            const { from, to } = view.state.selection.main;
            view.dispatch({
                changes: { from, to, insert: text },
                selection: select
                    ? { anchor: from + select[0], head: from + select[1] }
                    : { anchor: from + text.length },
                scrollIntoView: true,
                userEvent: "input",
            });
            view.focus();
        },
        // Replace the whole doc from outside (draft load / clear / edit-file).
        setDoc(text) {
            const view = viewRef.current;
            if (!view || text === view.state.doc.toString()) return;
            view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: text } });
        },
        focus() { viewRef.current?.focus(); },
    }));

    return <div ref={hostRef} className="w-full" />;
});

export default LiveMarkdownEditor;
