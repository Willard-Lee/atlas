import Link from "next/link";
import { navLinks, socialLinks } from "../lib/links";
import { FaGithub, FaInstagram, FaLinkedin, FaSquareXTwitter, FaMedium } from "react-icons/fa6";

const socialBrands: Record<string, { highlight: string; bg: string; depth: string }> = {
    GitHub:    { highlight: "#3c434b", bg: "#24292e", depth: "#0d1117" },
    Instagram: { highlight: "#f06478", bg: "#E4405F", depth: "#a01a38" },
    LinkedIn:  { highlight: "#2887d6", bg: "#0A66C2", depth: "#044181" },
    X:         { highlight: "#4bb6f5", bg: "#1D9BF0", depth: "#0a5e9e" },
    Medium:    { highlight: "#00d485", bg: "#00AB6C", depth: "#005e3b" },
};

const socialIcons: Record<string, React.ReactNode> = {
    GitHub:    <FaGithub         size={16} />,
    Instagram: <FaInstagram      size={16} />,
    LinkedIn:  <FaLinkedin       size={16} />,
    X:         <FaSquareXTwitter size={16} />,
    Medium:    <FaMedium         size={16} />,
};

export default function Footer() {
    return (
        <footer data-focus-hide className="w-full mt-auto pb-16 lg:pb-0" style={{ borderTop: "1px solid var(--outline-variant)" }}>
            <div className="flex items-center justify-between px-6 md:px-8 h-14 mx-auto w-full">

                {/* Brand */}
                <Link
                    href="/"
                    className="font-display text-xs font-bold tracking-tight transition-colors hover:text-[var(--primary)]"
                    style={{ color: "var(--on-surface)" }}
                >
                    ATLAS.SYS
                </Link>

                {/* Nav links */}
                <ul className="hidden md:flex items-center gap-8 list-none m-0 p-0">
                    {navLinks.map((link) => (
                        <li key={link.href}>
                            <Link
                                href={link.href}
                                className="font-mono text-xs font-bold tracking-widest transition-colors hover:text-[var(--primary)]"
                                style={{ color: "var(--on-surface-variant)" }}
                            >
                                {link.label}
                            </Link>
                        </li>
                    ))}
                </ul>

                {/* Social icons */}
                <ul className="flex items-center gap-4 list-none m-0 p-0">
                    {socialLinks.map((social) => (
                        <li key={social.href}>
                            <a
                                href={social.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={social.label}
                                className="social-icon-3d"
                                style={{
                                    "--icon-highlight": socialBrands[social.label]?.highlight,
                                    "--icon-bg":        socialBrands[social.label]?.bg,
                                    "--icon-depth":     socialBrands[social.label]?.depth,
                                } as React.CSSProperties}
                            >
                                {socialIcons[social.label]}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Build notice */}
            <div className="px-8 pb-1 font-mono text-xs flex items-center gap-2 flex-wrap" style={{ color: "var(--outline)" }}>
                <span style={{ color: "var(--primary)", animation: "blink 1.4s step-end infinite" }}>■</span>
                PERPETUAL_BUILD — this site is always under construction. design and content iterate continuously.
                <span aria-hidden style={{ color: "var(--outline-variant)" }}>·</span>
                <Link href="/changelog" className="tracking-widest transition-colors hover:text-[var(--primary)]">
                    v1.2.0 · CHANGELOG →
                </Link>
            </div>

            {/* Copyright */}
            <div className="px-8 pb-4 font-mono text-xs" style={{ color: "var(--on-surface-variant)" }}>
                © {new Date().getFullYear()} Willard Lee · All rights reserved.
            </div>
        </footer>
    );
}
