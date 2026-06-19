import type { Metadata } from "next"
import { Syne, DM_Sans, JetBrains_Mono } from "next/font/google"
import Providers from "@/components/Providers"
import Navigation from "@/components/Navigation"
import Footer from "@/components/Footer"
import BackToTop from "@/components/BackToTop"
import PageTransition from "@/components/motion/PageTransition"
import Cursor from "@/components/Cursor"
import "@/styles/globals.css"
import "katex/dist/katex.min.css"

// ── Fonts ────────────────────────────────────────────────────────────────────
// Variable names must match what globals.css @theme inline references

const syne = Syne({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-syne", 
  weight: ["400", "500","600", "700", "800"],
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
  weight: ["400", "500"],
})
const jetbrainsMono = JetBrains_Mono({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-jetbrains-mono", // used by --font-mono in globals.css
    weight: ["400", "500", "700"],
})

// ── Metadata ─────────────────────────────────────────────────────────────────
// Only works because this file has no 'use client'

export const metadata: Metadata = {
    title: "Willard Lee",
    description: "Personal portfolio and blog",
}

// ── Layout ───────────────────────────────────────────────────────────────────

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html
            lang="en"
            suppressHydrationWarning // required by next-themes to avoid flicker
            className={`${syne.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
        >
            <head>
                <link rel="icon" href="/favicon.ico" />
            </head>
            <body className="min-h-screen flex flex-col">
                <Providers>
                    <a href="#main" className="sr-only focus:not-sr-only">Skip to content</a>
                    <Navigation />
                    <main id="main" className="flex-1">
                        <PageTransition>{children}</PageTransition>
                    </main>
                    <Footer />
                    <BackToTop />
                    <Cursor />
                </Providers>
            </body>
        </html>
    )
}
