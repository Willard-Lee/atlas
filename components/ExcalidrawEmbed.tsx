"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const Excalidraw = dynamic(
    async () => (await import("@excalidraw/excalidraw")).Excalidraw,
    { ssr: false, loading: () => (
        <div className="flex items-center justify-center h-96 font-mono text-xs"
             style={{ color: "var(--on-surface-variant)", border: "1px solid var(--outline-variant)" }}>
            LOADING DIAGRAM...
        </div>
    )}
);

interface ExcalidrawEmbedProps {
    file: string;
}

export default function ExcalidrawEmbed({ file }: ExcalidrawEmbedProps) {
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        fetch(file)
            .then((r) => {
                if (!r.ok) throw new Error("not found");
                return r.json();
            })
            .then(setData)
            .catch(() => setError(true));
    }, [file]);

    if (error) return (
        <div className="flex items-center justify-center h-24 font-mono text-xs"
             style={{ color: "var(--error)", border: "1px solid var(--error-container)" }}>
            DIAGRAM NOT FOUND: {file}
        </div>
    );

    if (!data) return (
        <div className="flex items-center justify-center h-96 font-mono text-xs"
             style={{ color: "var(--on-surface-variant)", border: "1px solid var(--outline-variant)" }}>
            LOADING DIAGRAM...
        </div>
    );

    return (
        <div className="my-8">
            <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-xs tracking-widest"
                      style={{ color: "var(--on-surface-variant)" }}>
                    [ DIAGRAM ]
                </span>
                <div className="flex-1 border-t" style={{ borderColor: "var(--outline-variant)" }} />
            </div>
            <div className="w-full h-[500px] border" style={{ borderColor: "var(--outline-variant)" }}>
                <Excalidraw
                    initialData={{ elements: data.elements, appState: { ...data.appState, viewModeEnabled: true } }}
                    viewModeEnabled
                    UIOptions={{ canvasActions: { export: false, saveToActiveFile: false, saveAsImage: false, loadScene: false, clearCanvas: false, changeViewBackgroundColor: false, toggleTheme: false } }}
                />
            </div>
        </div>
    );
}
