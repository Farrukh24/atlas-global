import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-md z-10">
                <Outlet />
            </div>
            <footer className="mt-12 text-slate-400 dark:text-slate-600 text-sm font-medium z-10">
                &copy; 2026 Atlas Global Logistics. All rights reserved.
            </footer>
        </div>
    );
}
