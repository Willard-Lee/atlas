"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { FaHouse, FaFileLines, FaFolder, FaUser } from "react-icons/fa6";
import { TbPlant2 } from "react-icons/tb";

const tabs = [
    { href: "/",         label: "HOME", Icon: FaHouse    },
    { href: "/blog",     label: "BLOG", Icon: FaFileLines },
    { href: "/projects", label: "PROJ", Icon: FaFolder   },
    { href: "/garden",   label: "GRDN", Icon: TbPlant2   },
    { href: "/about",    label: "ABOT", Icon: FaUser     },
] as const;

export default function MobileTabBar() {
    const pathname = usePathname();
    const isActive = (href: string) =>
        href === "/" ? pathname === "/" : pathname.startsWith(href);

    return (
        <nav
            data-focus-hide
            className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex h-14"
            style={{
                background: "var(--surface-container-low)",
                borderTop:  "1px solid var(--outline-variant)",
            }}
        >
            {tabs.map(({ href, label, Icon }) => {
                const active = isActive(href);
                return (
                    <Link
                        key={href}
                        href={href}
                        className="flex-1 flex flex-col items-center justify-center relative"
                    >
                        <motion.div
                            className="flex flex-col items-center justify-center gap-0.5 w-full py-1"
                            whileTap={{ scale: 0.85 }}
                            style={{ color: active ? "var(--primary)" : "var(--on-surface-variant)" }}
                        >
                            {/* Active top line */}
                            {active && (
                                <span
                                    className="absolute top-0 left-2 right-2"
                                    style={{ height: 2, background: "var(--primary)" }}
                                />
                            )}

                            {/* Icon with glow when active */}
                            <span
                                style={{
                                    filter: active
                                        ? "drop-shadow(0 0 6px rgba(201, 131, 226, 0.65))"
                                        : "none",
                                    transition: "filter 0.15s ease",
                                }}
                            >
                                <Icon size={16} />
                            </span>

                            {/* Label */}
                            <span className="font-mono" style={{ fontSize: 9, letterSpacing: "0.12em" }}>
                                {label}
                            </span>
                        </motion.div>
                    </Link>
                );
            })}
        </nav>
    );
}
