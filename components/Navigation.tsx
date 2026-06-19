"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Search, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { navLinks, socialLinks } from "../lib/links";
import SearchModal from "./Search";

export default function Navigation() {
    const pathname = usePathname();
    const [searchOpen, setSearchOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const isActive = (href: string) =>
        href === "/" ? pathname === "/" : pathname.startsWith(href);

    return (
        <>
            <nav className="w-full sticky top-0 z-40"
                 style={{ borderBottom: "1px solid var(--outline-variant)", background: "var(--background)" }}>
                <div className="flex items-center justify-between px-8 h-14 mx-auto w-full">

                    {/* Left — Brand */}
                    <Link href="/" className="font-display text-base font-bold tracking-tight"
                          style={{ color: "var(--on-surface)" }}>
                        ATLAS.SYS
                    </Link>

                    {/* Middle — Nav links (desktop) */}
                    <ul className="hidden md:flex items-center gap-8 list-none m-0 p-0">
                        {navLinks.map((link) => (
                            <li key={link.href} className="relative">
                                <Link
                                    href={link.href}
                                    className="font-mono text-xs font-bold uppercase tracking-widest transition-colors"
                                    style={{
                                        color: isActive(link.href) ? "var(--primary)" : "var(--on-surface-variant)",
                                        filter: isActive(link.href)
                                            ? "drop-shadow(0 0 8px var(--primary-container))"
                                            : "none",
                                    }}
                                >
                                    {link.label}
                                </Link>
                                {/* Active underline pill */}
                                {isActive(link.href) && (
                                    <motion.span
                                        layoutId="nav-indicator"
                                        className="absolute -bottom-[17px] left-0 right-0 h-px"
                                        style={{ background: "var(--primary)" }}
                                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                    />
                                )}
                            </li>
                        ))}
                    </ul>

                    {/* Right — Search + Mobile toggle */}
                    <div className="flex items-center gap-4">
                        <motion.button
                            aria-label="Search"
                            onClick={() => setSearchOpen(true)}
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.9 }}
                            className="flex items-center justify-center w-8 h-8 transition-colors hover:text-[var(--primary)]"
                            style={{ color: "var(--on-surface-variant)" }}
                        >
                            <Search size={16} strokeWidth={1.5} />
                        </motion.button>
                        <motion.button
                            aria-label="Toggle menu"
                            onClick={() => setMobileOpen((v) => !v)}
                            whileTap={{ scale: 0.9 }}
                            className="md:hidden flex items-center justify-center w-8 h-8 transition-colors"
                            style={{ color: "var(--on-surface-variant)" }}
                        >
                            <AnimatePresence mode="wait" initial={false}>
                                {mobileOpen
                                    ? <motion.span key="x"
                                            initial={{ rotate: -90, opacity: 0 }}
                                            animate={{ rotate: 0, opacity: 1 }}
                                            exit={{ rotate: 90, opacity: 0 }}
                                            transition={{ duration: 0.15 }}>
                                          <X size={16} strokeWidth={1.5} />
                                      </motion.span>
                                    : <motion.span key="menu"
                                            initial={{ rotate: 90, opacity: 0 }}
                                            animate={{ rotate: 0, opacity: 1 }}
                                            exit={{ rotate: -90, opacity: 0 }}
                                            transition={{ duration: 0.15 }}>
                                          <Menu size={16} strokeWidth={1.5} />
                                      </motion.span>
                                }
                            </AnimatePresence>
                        </motion.button>
                    </div>
                </div>

                {/* Mobile menu */}
                <AnimatePresence>
                    {mobileOpen && (
                        <motion.div
                            className="md:hidden border-t overflow-hidden"
                            style={{ borderColor: "var(--outline-variant)" }}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.22, ease: "easeOut" }}
                        >
                            <ul className="flex flex-col list-none m-0 p-0">
                                {navLinks.map((link, i) => (
                                    <motion.li
                                        key={link.href}
                                        className="border-b"
                                        style={{ borderColor: "var(--outline-variant)" }}
                                        initial={{ opacity: 0, x: -16 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 + 0.05, duration: 0.18 }}
                                    >
                                        <Link
                                            href={link.href}
                                            onClick={() => setMobileOpen(false)}
                                            className="block px-8 py-4 font-mono text-xs uppercase tracking-widest transition-colors"
                                            style={{ color: isActive(link.href) ? "var(--primary)" : "var(--on-surface-variant)" }}
                                        >
                                            {isActive(link.href) ? `> ${link.label}` : link.label}
                                        </Link>
                                    </motion.li>
                                ))}
                            </ul>
                            <motion.div
                                className="flex gap-6 px-8 py-4"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: navLinks.length * 0.05 + 0.1 }}
                            >
                                {socialLinks.map((link) => (
                                    <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer"
                                       className="font-mono text-xs transition-colors hover:text-[var(--primary)]"
                                       style={{ color: "var(--on-surface-variant)" }}>
                                        {link.label.toUpperCase()}
                                    </a>
                                ))}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
        </>
    );
}
