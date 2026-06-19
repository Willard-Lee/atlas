"use client";
import { useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { FolderNode, NoteNode, TreeNode } from "@/lib/garden-tree";

const maturityColor: Record<string, string> = {
    seedling:  "#facc15",
    budding:   "#00dbe9",
    evergreen: "#4ade80",
};

// ○ seedling · ◑ budding · ● evergreen — conveys growth progression
const maturityDot: Record<string, string> = {
    seedling:  "○",
    budding:   "◑",
    evergreen: "●",
};

function containsActive(nodes: TreeNode[], pathname: string): boolean {
    return nodes.some((n) =>
        n.kind === "note"
            ? n.url === pathname
            : containsActive(n.children, pathname),
    );
}

function collectFolderPaths(nodes: TreeNode[], prefix = ""): string[] {
    return nodes.flatMap((n) => {
        if (n.kind !== "folder") return [];
        const p = prefix ? `${prefix}/${n.name}` : n.name;
        return [p, ...collectFolderPaths(n.children, p)];
    });
}

// ── Note row ─────────────────────────────────────────────────────────────────

function NoteRow({ note, depth, pathname }: {
    note:     NoteNode;
    depth:    number;
    pathname: string;
}) {
    const isActive = pathname === note.url;
    const color    = maturityColor[note.maturity] ?? "var(--on-surface-variant)";
    const dot      = maturityDot[note.maturity]   ?? "○";

    return (
        <Link
            href={note.url}
            className="group flex items-center gap-2 py-1.5 pr-3 relative transition-colors"
            style={{
                paddingLeft: `${16 + depth * 14}px`,
                background:  isActive ? "var(--surface-container)" : undefined,
            }}
        >
            {/* Active left bar */}
            {isActive && (
                <span
                    className="absolute left-0 inset-y-0 w-0.5"
                    style={{ background: "var(--primary)" }}
                />
            )}

            {/* Maturity dot */}
            <span
                className="font-mono text-xs shrink-0 leading-none"
                style={{ color, opacity: isActive ? 1 : 0.6 }}
            >
                {dot}
            </span>

            {/* Title */}
            <span
                className="font-mono text-xs truncate leading-relaxed transition-colors group-hover:text-[var(--on-surface)]"
                style={{ color: isActive ? "var(--primary)" : "var(--on-surface-variant)" }}
            >
                {note.title}
            </span>
        </Link>
    );
}

// ── Folder row ────────────────────────────────────────────────────────────────

function FolderRow({ node, depth, pathname, expanded, onToggle, folderPath }: {
    node:       FolderNode;
    depth:      number;
    pathname:   string;
    expanded:   Set<string>;
    onToggle:   (path: string) => void;
    folderPath: string;
}) {
    const isOpen      = expanded.has(folderPath);
    const hasActive   = containsActive(node.children, pathname);

    return (
        <div>
            {/* Folder header button */}
            <button
                onClick={() => onToggle(folderPath)}
                className="w-full flex items-center gap-2 py-2 pr-3 text-left transition-colors hover:bg-[var(--surface-container-high)] group"
                style={{ paddingLeft: `${12 + depth * 14}px` }}
            >
                {/* Rotating arrow */}
                <motion.span
                    className="font-mono text-xs shrink-0 leading-none"
                    animate={{ rotate: isOpen ? 90 : 0 }}
                    transition={{ duration: 0.15, ease: "easeInOut" }}
                    style={{ color: hasActive ? "var(--primary)" : "var(--on-surface-variant)" }}
                >
                    ▸
                </motion.span>

                {/* Folder label */}
                <span
                    className="font-mono text-xs font-bold tracking-wider flex-1 truncate"
                    style={{ color: hasActive ? "var(--primary)" : "var(--on-surface)" }}
                >
                    {node.label}
                </span>

                {/* Note count */}
                {node.noteCount > 0 && (
                    <span
                        className="font-mono text-xs shrink-0 px-1 tabular-nums"
                        style={{
                            color:      "var(--outline)",
                            background: "var(--surface-container)",
                        }}
                    >
                        {node.noteCount}
                    </span>
                )}
            </button>

            {/* Children — animated expand/collapse */}
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        key="children"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.18, ease: "easeInOut" }}
                        style={{ overflow: "hidden" }}
                    >
                        {/* Vertical guide line */}
                        <div
                            className="relative"
                            style={{
                                borderLeft:  "1px solid var(--outline-variant)",
                                marginLeft:  `${18 + depth * 14}px`,
                            }}
                        >
                            {node.children.map((child) =>
                                child.kind === "folder" ? (
                                    <FolderRow
                                        key={child.name}
                                        node={child}
                                        depth={depth + 1}
                                        pathname={pathname}
                                        expanded={expanded}
                                        onToggle={onToggle}
                                        folderPath={`${folderPath}/${child.name}`}
                                    />
                                ) : (
                                    <NoteRow
                                        key={child.slug}
                                        note={child}
                                        depth={depth + 1}
                                        pathname={pathname}
                                    />
                                ),
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ── Root export ───────────────────────────────────────────────────────────────

export default function GardenTree({ tree }: { tree: FolderNode[] }) {
    const pathname = usePathname();

    // Start with all folders expanded
    const [expanded, setExpanded] = useState<Set<string>>(
        () => new Set(collectFolderPaths(tree)),
    );

    const onToggle = useCallback((folderPath: string) => {
        setExpanded((prev) => {
            const next = new Set(prev);
            if (next.has(folderPath)) next.delete(folderPath);
            else next.add(folderPath);
            return next;
        });
    }, []);

    const totalNotes = tree.reduce((acc, f) => acc + f.noteCount, 0);

    if (tree.length === 0) {
        return (
            <p className="font-mono text-xs px-4 py-4" style={{ color: "var(--outline)" }}>
                NO NODES YET
            </p>
        );
    }

    return (
        <div>
            {/* Stats strip */}
            <div
                className="flex items-center gap-3 px-3 py-2 border-b"
                style={{ borderColor: "var(--outline-variant)" }}
            >
                {(["evergreen", "budding", "seedling"] as const).map((m) => {
                    function countMaturity(nodes: TreeNode[]): number {
                        return nodes.reduce((acc, n) => {
                            if (n.kind === "note") return acc + (n.maturity === m ? 1 : 0);
                            return acc + countMaturity(n.children);
                        }, 0);
                    }
                    const count = countMaturity(tree);
                    if (count === 0) return null;
                    return (
                        <span key={m} className="font-mono text-xs flex items-center gap-1"
                              style={{ color: maturityColor[m] }}>
                            {maturityDot[m]} {count}
                        </span>
                    );
                })}
                <span className="font-mono text-xs ml-auto" style={{ color: "var(--outline)" }}>
                    {totalNotes}
                </span>
            </div>

            {/* Tree */}
            <div className="py-1">
                {tree.map((folder) => (
                    <FolderRow
                        key={folder.name}
                        node={folder}
                        depth={0}
                        pathname={pathname}
                        expanded={expanded}
                        onToggle={onToggle}
                        folderPath={folder.name}
                    />
                ))}
            </div>
        </div>
    );
}
