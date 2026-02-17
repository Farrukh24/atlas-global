import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/utils/cn';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: string;
    trendDown?: boolean;
    delay?: number;
}

export default function StatCard({ title, value, icon: Icon, trend, trendDown, delay = 0 }: StatCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay }}
            className="glass-panel p-6 rounded-[28px] shadow-sm border border-slate-200 dark:border-gray-800 hover:shadow-xl transition-all duration-300 group"
        >
            <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                    <Icon className="text-primary-500" size={24} />
                </div>
                {trend && (
                    <div className={cn(
                        "flex items-center text-xs font-bold px-2.5 py-1 rounded-lg",
                        trendDown
                            ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                            : "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
                    )}>
                        {trendDown ? <ArrowDownRight size={14} className="mr-1" /> : <ArrowUpRight size={14} className="mr-1" />}
                        {trend}
                    </div>
                )}
            </div>
            <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{title}</p>
                <p className="text-2xl font-black text-gray-900 dark:text-white mt-1 tracking-tight">{value}</p>
            </div>
        </motion.div>
    );
}
