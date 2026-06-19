import Link from "next/link";
import { navLinks, socialLinks } from "../lib/links";
import { FaGithub, FaInstagram, FaLinkedin, FaSquareXTwitter, FaMedium } from "react-icons/fa6";

const socialIcons: Record<string, React.ReactNode> = {
    GitHub:    <FaGithub         size={16} />,
    Instagram: <FaInstagram      size={16} />,
    LinkedIn:  <FaLinkedin       size={16} />,
    X:         <FaSquareXTwitter size={16} />,
    Medium:    <FaMedium         size={16} />,
};

export default function Footer() {
    return (
        <footer className="w-full mt-auto" style={{ borderTop: "1px solid var(--outline-variant)" }}>
            <div className="flex items-center justify-between px-8 h-14 mx-auto w-full">

                {/* Brand */}
                <Link
                    href="/"
                    className="font-display text-xs font-bold tracking-tight transition-colors hover:text-[var(--primary)]"
                    style={{ color: "var(--on-surface)" }}
                >
                    ATLAS.SYS
                </Link>

                {/* Nav links */}
                <ul className="flex items-center gap-8 list-none m-0 p-0">
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
                                className="flex items-center justify-center w-8 h-8 transition-colors hover:text-[var(--primary)]"
                                style={{ color: "var(--on-surface-variant)" }}
                            >
                                {socialIcons[social.label]}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Build notice */}
            <div className="px-8 pb-1 font-mono text-xs flex items-center gap-2" style={{ color: "var(--outline)" }}>
                <span style={{ color: "var(--primary)", animation: "blink 1.4s step-end infinite" }}>■</span>
                PERPETUAL_BUILD — this site is always under construction. design and content iterate continuously.
            </div>

            {/* Copyright */}
            <div className="px-8 pb-4 font-mono text-xs" style={{ color: "var(--on-surface-variant)" }}>
                © {new Date().getFullYear()} Willard Lee · All rights reserved.
            </div>
        </footer>
    );
}
