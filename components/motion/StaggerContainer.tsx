"use client";
import { motion, type Variants } from "framer-motion";
import { ReactNode } from "react";

const container: Variants = {
    hidden: {},
    show: {
        transition: {
            staggerChildren: 0.08,
        },
    },
};

const item: Variants = {
    hidden: { opacity: 0, y: 16 },
    show:   { opacity: 1, y: 0 },
};

interface StaggerContainerProps {
    children: ReactNode;
    className?: string;
}

export function StaggerContainer({ children, className }: StaggerContainerProps) {
    return (
        <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <motion.div variants={item} transition={{ duration: 0.4 }} className={className}>
            {children}
        </motion.div>
    );
}
