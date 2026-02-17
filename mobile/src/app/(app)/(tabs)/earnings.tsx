import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import api from '@/services/api';
import { DollarSign, TrendingUp, Calendar, ArrowUpRight } from 'lucide-react-native';
import { formatCurrency } from '@/utils/format';
import { Invoice } from '@/types';

export default function EarningsScreen() {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [totals, setTotals] = useState({ total_paid: 0, pending_settlement: 0 });

    const fetchEarnings = async () => {
        setLoading(true);
        try {
            const response = await api.get('/invoices/my');
            setInvoices(response.data.data);

            const paid = response.data.data
                .filter((inv: Invoice) => inv.status === 'paid')
                .reduce((sum: number, inv: Invoice) => sum + Number(inv.total_amount), 0);

            const pending = response.data.data
                .filter((inv: Invoice) => inv.status !== 'paid')
                .reduce((sum: number, inv: Invoice) => sum + Number(inv.total_amount), 0);

            setTotals({ total_paid: paid, pending_settlement: pending });
        } catch (error) {
            console.error('Fetch Earnings Error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEarnings();
    }, []);

    return (
        <View className="flex-1 bg-background">
            <ScrollView
                className="flex-1 px-6"
                refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchEarnings} tintColor="#3B82F6" />}
            >
                <View className="py-8">
                    <Text className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-1">Total Balance</Text>
                    <Text className="text-white text-5xl font-black">{formatCurrency(totals.total_paid)}</Text>
                </View>

                <View className="flex-row space-x-4 mb-8">
                    <View className="flex-1 bg-surface p-5 rounded-3xl border border-slate-700/50">
                        <View className="w-10 h-10 bg-accent/20 rounded-full items-center justify-center mb-3">
                            <TrendingUp size={20} color="#10B981" />
                        </View>
                        <Text className="text-slate-400 text-[10px] font-bold uppercase">Net Earned</Text>
                        <Text className="text-white text-lg font-bold">{formatCurrency(totals.total_paid)}</Text>
                    </View>

                    <View className="flex-1 bg-surface p-5 rounded-3xl border border-slate-700/50">
                        <View className="w-10 h-10 bg-primary/20 rounded-full items-center justify-center mb-3">
                            <DollarSign size={20} color="#3B82F6" />
                        </View>
                        <Text className="text-slate-400 text-[10px] font-bold uppercase">Pending</Text>
                        <Text className="text-white text-lg font-bold">{formatCurrency(totals.pending_settlement)}</Text>
                    </View>
                </View>

                <Text className="text-white font-bold text-xl mb-4">Payment History</Text>

                {invoices.length === 0 ? (
                    <View className="bg-surface rounded-2xl p-8 items-center">
                        <Calendar size={32} color="#64748B" />
                        <Text className="text-slate-500 mt-2 font-medium">No settlements found.</Text>
                    </View>
                ) : (
                    invoices.map((inv: Invoice) => (
                        <View key={inv.id} className="bg-surface rounded-2xl p-4 mb-3 border border-slate-800 flex-row items-center justify-between">
                            <View className="flex-row items-center">
                                <View className="w-10 h-10 bg-slate-700/30 rounded-full items-center justify-center">
                                    <ArrowUpRight size={18} color={inv.status === 'paid' ? '#10B981' : '#F59E0B'} />
                                </View>
                                <View className="ml-4">
                                    <Text className="text-white font-bold">{inv.invoice_number}</Text>
                                    <Text className="text-slate-500 text-xs">{new Date(inv.created_at).toLocaleDateString()}</Text>
                                </View>
                            </View>
                            <View className="items-end">
                                <Text className="text-white font-bold">{formatCurrency(inv.total_amount)}</Text>
                                <Text className={`text-[10px] font-bold uppercase ${inv.status === 'paid' ? 'text-accent' : 'text-primary'}`}>
                                    {inv.status}
                                </Text>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>
        </View>
    );
}
