"use client";

// Skills categorized by type — colors map to CSS token meanings
const SKILLS = [
    { label: "Python",              symbol: "◈", color: "var(--primary)" },
    { label: "TypeScript",          symbol: "◈", color: "var(--primary)" },
    { label: "R",                   symbol: "◈", color: "var(--primary)" },
    { label: "Next.js 16",          symbol: "⬡", color: "var(--secondary-container)" },
    { label: "LangChain",           symbol: "⬡", color: "var(--secondary-container)" },
    { label: "FastAPI",             symbol: "⬡", color: "var(--secondary-container)" },
    { label: "Framer Motion",       symbol: "⬡", color: "var(--secondary-container)" },
    { label: "TailwindCSS v4",      symbol: "⬡", color: "var(--secondary-container)" },
    { label: "Machine Learning",    symbol: "▶", color: "#facc15" },
    { label: "RAG Systems",         symbol: "▶", color: "#facc15" },
    { label: "Financial Modeling",  symbol: "▶", color: "#facc15" },
    { label: "PyTorch",             symbol: "▣", color: "var(--on-surface-variant)" },
    { label: "PostgreSQL",          symbol: "▣", color: "var(--on-surface-variant)" },
    { label: "Vercel",              symbol: "▣", color: "var(--on-surface-variant)" },
] as const;

const MARQUEE_STYLE = `
  @keyframes marquee-scroll {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }
  .marquee-track {
    animation: marquee-scroll 34s linear infinite;
    will-change: transform;
  }
  .marquee-track:hover {
    animation-play-state: paused;
  }
`;

export default function SkillTicker() {
    // duplicate for seamless infinite loop (first half + second half = same)
    const items = [...SKILLS, ...SKILLS];

    return (
        <>
            <style>{MARQUEE_STYLE}</style>
            <div
                className="overflow-hidden"
                style={{
                    borderTop:    "1px solid var(--outline-variant)",
                    borderBottom: "1px solid var(--outline-variant)",
                    background:   "var(--surface-container-lowest)",
                }}
                aria-hidden="true"
            >
                <div className="marquee-track flex items-stretch" style={{ width: "max-content" }}>
                    {items.map((skill, i) => (
                        <span key={i} className="flex items-center">
                            <span
                                className="font-mono text-xs flex items-center gap-2 px-5 py-3 whitespace-nowrap"
                                style={{ color: skill.color }}
                            >
                                <span style={{ opacity: 0.6 }}>{skill.symbol}</span>
                                {skill.label}
                            </span>
                            <span
                                className="font-mono text-xs px-1 self-stretch flex items-center"
                                style={{ color: "var(--outline-variant)" }}
                            >
                                ╸
                            </span>
                        </span>
                    ))}
                </div>
            </div>
        </>
    );
}
