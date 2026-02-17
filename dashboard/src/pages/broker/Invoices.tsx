import { useState, useEffect } from 'react';
import api from '@/services/api';
import {
    FileText,
    Download,
    ExternalLink,
    Filter,
    ArrowUpRight,
    ArrowDownLeft
} from 'lucide-react';
import { format } from 'date-fns';

export default function Invoices() {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            const resp = await api.get('/invoices');
            setInvoices(resp.data.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-panel p-8 rounded-[32px] bg-primary-600 text-white shadow-xl shadow-primary-500/20">
                    <p className="text-primary-200 text-xs font-black uppercase tracking-widest mb-1">Total Outstanding</p>
                    <p className="text-4xl font-black tracking-tighter">$42,850.00</p>
                    <div className="mt-6 flex items-center text-primary-200 text-xs font-bold">
                        <ArrowUpRight size={14} className="mr-1" />
                        +12% from last month
                    </div>
                </div>
                <div className="glass-panel p-8 rounded-[32px] border border-slate-200 dark:border-slate-800">
                    <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Paid this Period</p>
                    <p className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white">$128,400.00</p>
                    <div className="mt-6 flex items-center text-emerald-500 text-xs font-bold">
                        <Download size={14} className="mr-2" />
                        Download Statement
                    </div>
                </div>
                <div className="glass-panel p-8 rounded-[32px] border border-slate-200 dark:border-slate-800">
                    <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Average Pay Cycle</p>
                    <p className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white">12 Days</p>
                    <div className="mt-6 flex items-center text-primary-500 text-xs font-bold">
                        <Filter size={14} className="mr-2" />
                        View Analytics
                    </div>
                </div>
            </div>

            <div className="glass-panel rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
                <div className="p-8 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">Billing History</h3>
                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                        <Filter size={20} />
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800/50">
                            <tr>
                                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-500">Invoice</th>
                                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-500">Date</th>
                                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-500">Amount</th>
                                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-500">Status</th>
                                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                            {loading ? (
                                <tr><td colSpan={5} className="px-8 py-10 text-center font-bold text-slate-500">Fetching financial records...</td></tr>
                            ) : (
                                invoices.map((inv) => (
                                    <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center">
                                                <FileText size={18} className="text-slate-400 mr-3" />
                                                <span className="font-black text-slate-900 dark:text-white tracking-tight">{inv.invoice_number}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-sm font-medium text-slate-600 dark:text-slate-400">
                                            {format(new Date(inv.created_at), 'MMM d, yyyy')}
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="font-black text-slate-900 dark:text-white">${inv.total_amount}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={twMerge(
                                                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                                inv.status === 'paid' ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/10" : "bg-amber-50 text-amber-600 dark:bg-amber-900/10"
                                            )}>
                                                {inv.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center space-x-4">
                                                <button className="text-primary-500 hover:text-primary-600 transition-colors">
                                                    <Download size={18} />
                                                </button>
                                                <button className="text-slate-400 hover:text-slate-600 transition-colors">
                                                    <ExternalLink size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

import { twMerge } from 'tailwind-merge';
