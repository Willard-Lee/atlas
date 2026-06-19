"use client";
import { motion } from "framer-motion";

export default function BootSequence({ lines }: { lines: string[] }) {
    return (
        <div className="space-y-1">
            {lines.map((line, i) => (
                <motion.p
                    key={line}
                    className="font-mono text-xs"
                    style={{ color: "var(--on-surface-variant)" }}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, delay: i * 0.2, ease: "easeOut" }}
                >
                    {line}
                </motion.p>
            ))}
        </div>
    );
}
