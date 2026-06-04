import { Link } from "lucide-react";
import { navLinks, socialLinks } from "../lib/links";
import { FaGithub, FaInstagram, FaLinkedin, FaTwitter } from "react-icons/fa";

const socialIcons = {
    Github: <FaGithub size = {16} strokeWidth = {1.5} />,
    Instagram: <FaInstagram size = {16} strokeWidth = {1.5} />,
    LinkedIn: <FaLinkedin size = {16} strokeWidth = {1.5} />,
    Twitter: <FaTwitter size = {16} strokeWidth = {1.5} />,
}

export default function Footer() {
    return (
        <footer style={{ borderTop: "1px solid var(--outline-variant)" }} className="w-full mt-auto">
            <div className="flex items-center justify-between px-8 h-14 mx-auto w-full">

                {/* Left — TODO: your name or "Atlas" branding */}
                <Link href = "/" className = "text-xs font-bold tracking-tight">Atlas
                </Link>

                {/* Center — TODO: footer links (e.g. About, Projects, Blog) */}
                <ul className = "flex items-center gap-8 list-none m-0 p-0">
                    {navLinks.map((link) => (
                        <li key = {link.href}>
                            <Link
                             href = {link.href}
                             className = "text-xs font-bold tracking-widest transition-colors"
                             style = {{fontFamily: "var(--font-mono)", color: "var(--on-surface-variant)", letterSpacing: "0.08em"}}
                             >
                                {link.label}
                            </Link>    
                        </li>
                    ))}
                </ul>
                {/* Right — TODO: social icons (GitHub, Twitter, etc.) */}
                <ul className = " flex items-center gap-4 list-none m-0 p-0">
                    {socialLinks.map((social) => (
                        <li key = {social.href}>
                            <a 
                                href = {social.href}
                                target = "_blank"
                                rel = "noopener noreferrer"
                                aria-label = {social.label}
                                className = "flex items-center justify-center w-8 h-8 transition-colors"
                                style = {{color: "var(--on_surfance-variant"}}
                                >
                                {socialIcons[social.label as keyof typeof socialIcons]}
                            </a>

                        </li>
                    ))}
                </ul>
            </div>

            {/* Bottom row — TODO: copyright line in JetBrains Mono, small text */}
             <div className = "text-xs font-bold tracking-tight">© {new Date().getFullYear()} Willard Lee. All rights reserved.</div>

        </footer>
    )
}
