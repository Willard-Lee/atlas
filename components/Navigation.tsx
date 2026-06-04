import Link from "next/link";
import { Search, Terminal } from "lucide-react";
import { navLinks } from "../lib/links"; /* Single source of truth for all nav links */

export default function Navigation(){ /* this creates a nav component to be used across all pages */
    return (
        <nav style ={{borderBottom: "1px solid var(--outline-variant)"}} className = "w-full"> {/*nav styling using tailwind classes */}
            <div className = "flex items-center justify-between px-8 h-14 mx-auto w-full">
                {/*Left - Logo and Brand Name*/}
                <Link href= "/" className = "text-base font-bold tracking-tight">
                    Atlas    
                </Link>
                {/*Middle - Navigation Links*/}
                <ul className = "flex items-center gap-8 list-none m-0 p-0">
                    {navLinks.map((link) =>(
                        <li key = {link.href}>
                            <Link
                                href = {link.href}
                                className = "text-xs font-bold uppercase tracking-widest transition-colors"
                                style = {{fontFamily: "var(--font-mono)", color: "var(--on-surface-variant)", letterSpacing: "0.08em"}}
                                >
                                {link.label}
                            </Link>  
                        
                        </li>
                    ))}
                </ul>
                {/* Right - Search and Theme Toggle terminal icon */}
                <div className = "flex items-center gap-4">
                    <button 
                     aria-label = "Search" 
                     className = "flex items-center justify-center w-8 h-8 transition-colors" 
                     style = {{color: "var(--on-surface-variant)"}}
                     >
                        <Search size = {16} strokeWidth = {1.5}/>
                    </button>
                    <button 
                     aria-label = "Toggle Theme" 
                     className = "flex items-center justify-center w-8 h-8 transition-colors"
                     style = {{color : "var(--on-surface-variant)"}}
                     >
                        <Terminal size = {16} strokeWidth = {1.5} />
                    </button>
                </div>
            </div>
        </nav>
    )
}