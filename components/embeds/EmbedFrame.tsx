import type { ReactNode } from "react";

/**
 * Shared chrome for embeds — a bracketed mono label + rule, matching the
 * ExcalidrawEmbed / callout aesthetic used across the site.
 */
export default function EmbedFrame({
    label,
    children,
    className,
}: {
    label: string;
    children: ReactNode;
    className?: string;
}) {
    return (
        <div className={`my-8 ${className ?? ""}`}>
            <div className="flex items-center gap-2 mb-2">
                <span
                    className="font-mono text-xs tracking-widest"
                    style={{ color: "var(--on-surface-variant)" }}
                >
                    [ {label} ]
                </span>
                <div className="flex-1 border-t" style={{ borderColor: "var(--outline-variant)" }} />
            </div>
            {children}
        </div>
    );
}
