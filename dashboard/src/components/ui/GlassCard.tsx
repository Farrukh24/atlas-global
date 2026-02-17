import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/utils/cn'; // Assuming cn utility exists or I'll create it

interface GlassCardProps {
    children: ReactNode;
    className?: string;
    delay?: number;
    onClick?: () => void;
}

export default function GlassCard({ children, className, delay = 0, onClick }: GlassCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={onClick}
            transition={{ duration: 0.5, delay }}
            className={cn(
                "glass-card rounded-[32px] p-6 overflow-hidden relative group",
                className
            )}
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary-500/10 transition-colors duration-500" />
            {children}
        </motion.div>
    );
}
