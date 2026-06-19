import Link from "next/link";
import { navLinks, socialLinks } from "../lib/links";
import { FaGithub, FaInstagram, FaLinkedin, FaSquareXTwitter } from "react-icons/fa6";

const socialIcons: Record<string, React.ReactNode> = {
    GitHub:    <FaGithub         size={16} />,
    Instagram: <FaInstagram      size={16} />,
    LinkedIn:  <FaLinkedin       size={16} />,
    X:         <FaSquareXTwitter size={16} />,
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

            {/* Copyright */}
            <div className="px-8 pb-4 font-mono text-xs" style={{ color: "var(--on-surface-variant)" }}>
                © {new Date().getFullYear()} Willard Lee · All rights reserved.
            </div>
        </footer>
    );
}
