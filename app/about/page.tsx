import { socialLinks } from "@/lib/links";
import FadeUp from "@/components/motion/FadeUp";
import BootSequence from "@/components/motion/BootSequence";
import AnimatedBar from "@/components/motion/AnimatedBar";

const skills: Record<string, { name: string; level: number }[]> = {
    "LANGUAGES": [
        { name: "Python",     level: 90 },
        { name: "TypeScript", level: 75 },
        { name: "R",          level: 65 },
        { name: "SQL",        level: 80 },
        { name: "C++",        level: 55 },
        { name: "Java",        level: 60 }
    ],
    "ML / AI": [
        { name: "PyTorch",      level: 75 },
        { name: "HuggingFace",  level: 70 },
        { name: "LangChain",    level: 65 },
        { name: "scikit-learn", level: 80 },
    ],
    "DATA": [
        { name: "Pandas",  level: 88 },
        { name: "NumPy",   level: 85 },
        { name: "Polars",  level: 60 },
        { name: "Jupyter", level: 90 },
    ],
    "FINANCE": [
        { name: "Quant Analysis",      level: 55 },
        { name: "Financial Modelling", level: 50 },
        { name: "Portfolio Theory",    level: 45 },
    ],
    "WEB": [
        { name: "Next.js", level: 70 },
        { name: "React",   level: 72 },
        { name: "Tailwind",level: 75 },
    ],
};

const processes = [
    { status: "RUNNING", pid: "0x1A2F", name: "malaysian-rag",  desc: "RAG system for Malaysian language + context" },
    { status: "RUNNING", pid: "0x3B4C", name: "quant-research", desc: "Learning quantitative finance models" },
    { status: "IDLE",    pid: "0x5D6E", name: "next-project",   desc: "TBD" },
];

const categoryColor: Record<string, string> = {
    "LANGUAGES": "var(--primary)",
    "ML / AI":   "var(--secondary-container)",
    "DATA":      "#4ade80",
    "FINANCE":   "#facc15",
    "WEB":       "var(--primary-container)",
};

function profLabel(n: number) {
    if (n >= 85) return "EXPERT";
    if (n >= 70) return "PROFICIENT";
    if (n >= 55) return "LEARNING";
    return "EXPLORING";
}

function profColor(n: number) {
    if (n >= 85) return "var(--secondary-container)";
    if (n >= 70) return "var(--primary)";
    if (n >= 55) return "#facc15";
    return "var(--on-surface-variant)";
}

const bootLines = [
    "> INITIALIZING  OPERATOR.FILE...",
    "> IDENTITY CHECK............. OK",
    "> LOADING SKILL MATRIX....... OK",
    "> ACCESS LEVEL............. FULL",
];

const languages = [
    { code: "EN",  name: "English",  level: "NATIVE",         bars: 9  },
    { code: "MS",  name: "Malay",    level: "FLUENT",         bars: 7 },
    { code: "ZH",  name: "Mandarin", level: "CONVERSATIONAL", bars: 5  },
    { code: "TA", name: "TAMIL",  level: "BEGINNER",          bars: 3 },
    { code: "FR", name: "FRENCH",  level: "LEARNING",          bars: 1 },
] as const;

function langColor(level: string) {
    if (level === "NATIVE")         return "var(--primary)";
    if (level === "FLUENT")         return "var(--secondary-container)";
    if (level === "CONVERSATIONAL") return "#4ade80";
    return "#facc15";
}

export default function AboutPage() {
    return (
        <main className="w-full">

            {/* ── Boot header ─────────────────────────────────────────── */}
            <div className="dot-grid px-4 md:px-16 py-12 md:py-20 mb-0">
                <div className="mb-6">
                    <BootSequence lines={bootLines} />
                </div>
                <h1 className="font-display text-5xl md:text-7xl font-bold mb-2 glow">
                    WILLARD.SYS
                </h1>
                <p className="font-mono text-xs tracking-widest mt-3"
                   style={{ color: "var(--on-surface-variant)" }}>
                    AI · ML · DATA · QUANT · PULAU PINANG, MY
                </p>
            </div>

            {/* ── Two-column layout ───────────────────────────────────── */}
            <div className="flex flex-col md:flex-row gap-0 border-t" style={{ borderColor: "var(--outline-variant)" }}>

                {/* Left — System panel */}
                <aside className="md:w-72 shrink-0 border-b md:border-b-0 md:border-r px-8 py-12"
                       style={{ borderColor: "var(--outline-variant)" }}>
                    <FadeUp>
                        <p className="font-mono text-xs font-bold tracking-widest mb-6"
                           style={{ color: "var(--primary)" }}>
                            SYS.INFO
                        </p>

                        {/* Info rows — highlight on hover */}
                        <div className="space-y-1">
                            {[
                                { k: "OPERATOR", v: "Willard Lee" },
                                { k: "HOST",     v: "atlas.sys" },
                                { k: "UPTIME",   v: "22 yrs" },
                                { k: "LOCATION", v: "Pulau Pinang, MY" },
                                { k: "SHELL",    v: "Python / TS" },
                                { k: "STATUS",   v: "● ONLINE" },
                            ].map(({ k, v }) => (
                                <div key={k}
                                     className="group flex gap-3 px-2 -mx-2 py-1.5 transition-colors hover:bg-[var(--surface-container-high)] cursor-default">
                                    <span className="font-mono text-xs w-20 shrink-0"
                                          style={{ color: "var(--on-surface-variant)" }}>
                                        {k}
                                    </span>
                                    <span className="font-mono text-xs transition-colors duration-150 group-hover:text-[var(--primary)]"
                                          style={{ color: k === "STATUS" ? "var(--secondary-container)" : "var(--on-surface)" }}>
                                        {v}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Interests — indicator scales on hover */}
                        <div className="mt-8 pt-6 border-t space-y-1" style={{ borderColor: "var(--outline-variant)" }}>
                            <p className="font-mono text-xs font-bold tracking-widest mb-4"
                               style={{ color: "var(--primary)" }}>
                                INTERESTS
                            </p>
                            {["Machine Learning", "NLP", "Quantitative Finance", "Sports", "Outdoors"].map((item) => (
                                <p key={item}
                                   className="group flex items-center gap-2 font-mono text-xs px-2 -mx-2 py-1 transition-colors hover:text-[var(--primary)] cursor-default"
                                   style={{ color: "var(--on-surface-variant)" }}>
                                    <span className="transition-transform duration-150 group-hover:scale-125 inline-block shrink-0">■</span>
                                    {item}
                                </p>
                            ))}
                        </div>

                        {/* Connect — arrow slides diagonally on hover */}
                        <div className="mt-8 pt-6 border-t" style={{ borderColor: "var(--outline-variant)" }}>
                            <p className="font-mono text-xs font-bold tracking-widest mb-4"
                               style={{ color: "var(--primary)" }}>
                                CONNECT
                            </p>
                            <div className="space-y-1">
                                {socialLinks.map((link) => (
                                    <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer"
                                       className="group flex items-center gap-2 font-mono text-xs px-2 -mx-2 py-1.5 transition-colors hover:text-[var(--primary)]"
                                       style={{ color: "var(--on-surface-variant)" }}>
                                        <span className="transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 inline-block shrink-0">
                                            ↗
                                        </span>
                                        {link.label.toUpperCase()}
                                    </a>
                                ))}
                            </div>
                        </div>
                    </FadeUp>
                </aside>

                {/* Right — Main content */}
                <div className="flex-1 px-4 md:px-8 lg:px-12 py-8 md:py-12 space-y-16">

                    {/* Bio */}
                    <FadeUp>
                        <div className="flex items-center gap-3 mb-6">
                            <span className="font-mono text-xs font-bold tracking-widest"
                                  style={{ color: "var(--on-surface-variant)" }}>
                                LOG_ENTRY
                            </span>
                            <div className="flex-1 border-t" style={{ borderColor: "var(--outline-variant)" }} />
                        </div>
                        <div className="border-l-2 pl-6 transition-colors hover:border-l-[var(--secondary-container)]"
                             style={{ borderColor: "var(--primary)" }}>
                            <p className="font-mono text-xs mb-1" style={{ color: "var(--on-surface-variant)" }}>
                                {">"} cat bio.txt
                            </p>
                            <p className="font-sans text-sm leading-relaxed mt-3"
                               style={{ color: "var(--on-surface)" }}>
                                Multi-sport athlete and outdoor person by default — computing and finance by obsession.
                                I sit at the intersection of machine learning, data science, and quantitative finance,
                                currently building systems that understand Malaysian language and context.
                                When I&apos;m not training models, I&apos;m probably training outside.
                            </p>
                        </div>
                    </FadeUp>

                    {/* Skills */}
                    <FadeUp delay={0.05}>
                        <div className="flex items-center gap-3 mb-6">
                            <span className="font-mono text-xs font-bold tracking-widest"
                                  style={{ color: "var(--on-surface-variant)" }}>
                                SKILL.MATRIX
                            </span>
                            <div className="flex-1 border-t" style={{ borderColor: "var(--outline-variant)" }} />
                        </div>

                        {/* Overview stats — each stat lifts on hover */}
                        {(() => {
                            const allItems = Object.values(skills).flat();
                            const total    = allItems.length;
                            const avg      = Math.round(allItems.reduce((s, i) => s + i.level, 0) / total);
                            const experts  = allItems.filter((i) => i.level >= 85).length;
                            return (
                                <div className="flex gap-2 flex-wrap mb-8 pb-6 border-b"
                                     style={{ borderColor: "var(--outline-variant)" }}>
                                    {[
                                        { label: "MODULES",    value: total },
                                        { label: "CATEGORIES", value: Object.keys(skills).length },
                                        { label: "AVG LEVEL",  value: `${avg}%` },
                                        { label: "EXPERT",     value: experts },
                                    ].map(({ label, value }) => (
                                        <div key={label}
                                             className="group px-4 py-2 border transition-all duration-150 hover:-translate-y-0.5 hover:border-[var(--outline)] cursor-default"
                                             style={{ borderColor: "var(--outline-variant)" }}>
                                            <p className="font-display text-2xl font-bold transition-colors duration-150 group-hover:text-[var(--secondary-container)]"
                                               style={{ color: "var(--primary)" }}>
                                                {value}
                                            </p>
                                            <p className="font-mono text-xs tracking-widest mt-0.5"
                                               style={{ color: "var(--on-surface-variant)" }}>
                                                {label}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            );
                        })()}

                        {/* Category panels */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(skills).map(([group, items]) => {
                                const color = categoryColor[group] ?? "var(--primary)";
                                const avg   = Math.round(items.reduce((s, i) => s + i.level, 0) / items.length);
                                const top   = [...items].sort((a, b) => b.level - a.level)[0];

                                return (
                                    <div key={group} className="border scannable"
                                         style={{ borderColor: "var(--outline-variant)", borderLeftColor: color, borderLeftWidth: "2px" }}>

                                        {/* Panel header */}
                                        <div className="flex items-center justify-between px-4 py-2 border-b"
                                             style={{ borderColor: "var(--outline-variant)", background: "var(--surface-container)" }}>
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-xs" style={{ color }}>■</span>
                                                <span className="font-mono text-xs font-bold tracking-widest" style={{ color }}>
                                                    {group}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="font-mono text-xs" style={{ color: "var(--on-surface-variant)" }}>AVG</span>
                                                <span className="font-mono text-xs font-bold" style={{ color }}>{avg}%</span>
                                            </div>
                                        </div>

                                        {/* Skill rows — row highlights on hover */}
                                        <div className="divide-y overflow-x-auto" style={{ borderColor: "var(--outline-variant)" }}>
                                            {items.map(({ name, level }, itemIdx) => {
                                                const filled = Math.round(level / 10);
                                                const pLabel = profLabel(level);
                                                const pColor = profColor(level);
                                                const isTop  = name === top.name;
                                                return (
                                                    <div key={name}
                                                         className="group grid gap-3 px-4 py-2.5 transition-colors hover:bg-[var(--surface-container-high)] cursor-default"
                                                         style={{ gridTemplateColumns: "11rem 6.5rem 1fr auto" }}>
                                                        <span className="font-mono text-xs truncate transition-colors duration-150 group-hover:text-[var(--on-surface)]"
                                                              style={{ color: isTop ? color : "var(--on-surface)" }}>
                                                            {isTop && <span style={{ color }}>▶ </span>}
                                                            {name}
                                                        </span>
                                                        <span className="font-mono text-xs transition-colors duration-150"
                                                              style={{ color: pColor }}>
                                                            {pLabel}
                                                        </span>
                                                        <AnimatedBar
                                                            filled={filled}
                                                            total={10}
                                                            color={color}
                                                            delay={itemIdx * 0.08}
                                                        />
                                                        <span className="font-mono text-xs transition-colors duration-150 group-hover:text-[var(--on-surface)]"
                                                              style={{ color: "var(--on-surface-variant)" }}>
                                                            {level}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                    </div>
                                );
                            })}
                        </div>
                    </FadeUp>

                    {/* Languages */}
                    <FadeUp delay={0.1}>
                        <div className="flex items-center gap-3 mb-6">
                            <span className="font-mono text-xs font-bold tracking-widest"
                                  style={{ color: "var(--on-surface-variant)" }}>
                                LANG.PKG
                            </span>
                            <div className="flex-1 border-t" style={{ borderColor: "var(--outline-variant)" }} />
                        </div>

                        {/* Language cards — lift + subtle border brightens on hover */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {languages.map(({ code, name, level, bars }, langIdx) => {
                                const color = langColor(level);
                                return (
                                    <div key={code}
                                         className="group flex items-center gap-3 border px-4 py-3 scannable transition-all duration-150 hover:-translate-y-0.5 hover:bg-[var(--surface-container-high)] cursor-default"
                                         style={{ borderColor: "var(--outline-variant)", borderLeftColor: color, borderLeftWidth: "2px" }}>
                                        {/* ISO code badge — brightens on hover */}
                                        <span className="font-mono text-xs px-1.5 py-0.5 shrink-0 w-10 text-center transition-colors duration-150 group-hover:bg-[var(--surface-container-highest)]"
                                              style={{ background: "var(--surface-container-high)", color }}>
                                            {code}
                                        </span>
                                        {/* Name */}
                                        <span className="font-mono text-xs flex-1 transition-colors duration-150 group-hover:text-[var(--primary)]"
                                              style={{ color: "var(--on-surface)" }}>
                                            {name}
                                        </span>
                                        {/* Level label */}
                                        <span className="font-mono text-xs shrink-0" style={{ color }}>
                                            {level}
                                        </span>
                                        {/* Animated bar */}
                                        <AnimatedBar filled={bars} total={10} color={color} delay={langIdx * 0.1 + 0.2} />
                                    </div>
                                );
                            })}
                        </div>
                    </FadeUp>

                    {/* Current processes */}
                    <FadeUp delay={0.15}>
                        <div className="flex items-center gap-3 mb-6">
                            <span className="font-mono text-xs font-bold tracking-widest"
                                  style={{ color: "var(--on-surface-variant)" }}>
                                ACTIVE.PROCESSES
                            </span>
                            <div className="flex-1 border-t" style={{ borderColor: "var(--outline-variant)" }} />
                        </div>
                        <div className="border border-t-0 overflow-x-auto" style={{ borderColor: "var(--outline-variant)" }}>
                            {/* Table header */}
                            <div className="flex gap-4 px-4 py-2 border-b"
                                 style={{ borderColor: "var(--outline-variant)", background: "var(--surface-container)" }}>
                                {["STATUS", "PID", "PROCESS", "DESCRIPTION"].map((h) => (
                                    <span key={h} className="font-mono text-xs font-bold tracking-widest"
                                          style={{ color: "var(--on-surface-variant)",
                                                   width: h === "STATUS" ? "80px" : h === "PID" ? "64px" : h === "PROCESS" ? "160px" : "auto",
                                                   flexShrink: 0 }}>
                                        {h}
                                    </span>
                                ))}
                            </div>
                            {/* Process rows — full row highlight + process name shifts color */}
                            {processes.map((proc) => (
                                <div key={proc.pid}
                                     className="group flex gap-4 items-center px-4 py-3 border-b last:border-b-0 transition-colors hover:bg-[var(--surface-container-high)] cursor-default"
                                     style={{ borderColor: "var(--outline-variant)" }}>
                                    <span className="font-mono text-xs shrink-0 transition-colors duration-150"
                                          style={{ width: "80px",
                                                   color: proc.status === "RUNNING" ? "var(--secondary-container)" : "var(--on-surface-variant)" }}>
                                        {proc.status === "RUNNING" ? "● " : "○ "}{proc.status}
                                    </span>
                                    <span className="font-mono text-xs shrink-0 transition-colors duration-150 group-hover:text-[var(--on-surface)]"
                                          style={{ width: "64px", color: "var(--on-surface-variant)" }}>
                                        {proc.pid}
                                    </span>
                                    <span className="font-mono text-xs shrink-0 transition-colors duration-150 group-hover:text-[var(--secondary-container)]"
                                          style={{ width: "160px", color: "var(--primary)" }}>
                                        {proc.name}
                                    </span>
                                    <span className="font-mono text-xs transition-colors duration-150 group-hover:text-[var(--on-surface)]"
                                          style={{ color: "var(--on-surface-variant)" }}>
                                        {proc.desc}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </FadeUp>

                </div>
            </div>
        </main>
    );
}
