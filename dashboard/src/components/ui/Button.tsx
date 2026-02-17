import React from 'react';
import { twMerge } from 'tailwind-merge';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    isLoading?: boolean;
}

export default function Button({
    children,
    variant = 'primary',
    size = 'md',
    isLoading,
    className,
    disabled,
    ...props
}: ButtonProps) {
    const variants = {
        primary: 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-500/20',
        secondary: 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white',
        outline: 'bg-transparent border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300',
        danger: 'bg-red-500 hover:bg-red-600 text-white',
        ghost: 'bg-transparent hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-xs font-bold rounded-lg',
        md: 'px-5 py-2.5 text-sm font-bold rounded-xl',
        lg: 'px-8 py-4 text-base font-bold rounded-2xl',
        xl: 'px-10 py-5 text-lg font-black rounded-[24px]',
    };

    return (
        <button
            disabled={isLoading || disabled}
            className={twMerge(
                'inline-flex items-center justify-center transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        >
            {isLoading ? <Loader2 className="mr-2 animate-spin" size={18} /> : null}
            {children}
        </button>
    );
}
