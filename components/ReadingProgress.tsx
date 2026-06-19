"use client";
import { useEffect, useState } from "react";

export default function ReadingProgress() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const update = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
        };
        window.addEventListener("scroll", update, { passive: true });
        return () => window.removeEventListener("scroll", update);
    }, []);

    return (
        <div className="fixed top-0 left-0 right-0 z-50 h-px"
             style={{ background: "var(--outline-variant)" }}>
            <div
                className="h-full transition-none"
                style={{
                    width: `${progress}%`,
                    background: "var(--primary-container)",
                    boxShadow: "0 0 8px var(--primary-container)",
                }}
            />
        </div>
    );
}
