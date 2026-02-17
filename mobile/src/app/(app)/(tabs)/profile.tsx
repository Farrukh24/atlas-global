import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useAuthStore } from '../../../stores/authStore';
import { LogOut, ChevronRight, User, Shield, Phone, Mail } from 'lucide-react-native';

export default function ProfileScreen() {
    const { user, logout } = useAuthStore();

    return (
        <ScrollView className="flex-1 bg-background">
            <View className="items-center py-10">
                <View className="w-24 h-24 bg-surface rounded-full border-4 border-slate-800 items-center justify-center overflow-hidden mb-4">
                    <User size={48} color="#64748B" />
                </View>
                <Text className="text-white text-2xl font-bold">{user?.legal_name || 'Carrier Partner'}</Text>
                <Text className="text-primary font-medium tracking-widest uppercase text-xs mt-1">
                    {user?.party_type || 'CARRIER'} • Verified
                </Text>
            </View>

            <View className="px-6 space-y-3">
                <View className="bg-surface rounded-2xl border border-slate-800 overflow-hidden">
                    <SectionItem icon={<Mail size={20} color="#3B82F6" />} label="Email" value={user?.primary_email || 'N/A'} />
                    <SectionItem icon={<Phone size={20} color="#3B82F6" />} label="Phone" value={user?.primary_phone || 'N/A'} isLast />
                </View>

                <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest ml-1 mt-4 mb-2">Network Status</Text>
                <View className="bg-surface rounded-2xl border border-slate-800 overflow-hidden">
                    <SectionItem icon={<Shield size={20} color="#10B981" />} label="Compliance" value="Fully Authorized" />
                    <SectionItem icon={<User size={20} color="#3B82F6" />} label="Active Equipment" value="3 Assets" isLast />
                </View>

                <TouchableOpacity
                    className="bg-slate-800/50 mt-10 h-16 rounded-2xl flex-row items-center justify-center border border-red-500/20 mb-20"
                    onPress={logout}
                >
                    <LogOut size={20} color="#EF4444" />
                    <Text className="text-danger font-bold text-lg ml-3">Log Out</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

function SectionItem({ icon, label, value, isLast }: { icon: any, label: string, value: string, isLast?: boolean }) {
    return (
        <View className={`flex-row items-center px-5 py-4 ${!isLast ? 'border-b border-slate-800/50' : ''}`}>
            <View className="w-10 h-10 bg-slate-700/20 rounded-xl items-center justify-center">{icon}</View>
            <View className="ml-4 flex-1">
                <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-tighter">{label}</Text>
                <Text className="text-white font-medium">{value}</Text>
            </View>
            <ChevronRight size={18} color="#334155" />
        </View>
    );
}
