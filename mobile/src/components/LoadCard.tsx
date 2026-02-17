import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin, Truck, Calendar } from 'lucide-react-native';
import { formatCurrency } from '../utils/format';

interface LoadCardProps {
    load: any;
}

export default function LoadCard({ load }: LoadCardProps) {
    const router = useRouter();

    return (
        <TouchableOpacity
            className="bg-surface rounded-3xl p-5 mb-4 border border-slate-700 active:bg-slate-800"
            onPress={() => router.push(`/load/${load.id}`)}
        >
            <View className="flex-row justify-between items-start mb-4">
                <View className="bg-slate-700/50 px-3 py-1 rounded-full">
                    <Text className="text-primary text-[10px] font-bold uppercase tracking-wider">
                        {load.equipment_code || 'Van'}
                    </Text>
                </View>
                <Text className="text-white text-xl font-bold">
                    {formatCurrency(load.quoted_rate_amount || 0)}
                </Text>
            </View>

            <View className="space-y-4">
                <View className="flex-row items-center">
                    <View className="w-8 items-center">
                        <View className="w-2 h-2 rounded-full bg-accent" />
                        <View className="w-[1px] h-4 bg-slate-700 my-1" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-slate-400 text-[10px] font-medium uppercase tracking-tighter">Origin</Text>
                        <Text className="text-white font-bold" numberOfLines={1}>{load.origin_city}, {load.origin_country}</Text>
                    </View>
                </View>

                <View className="flex-row items-center">
                    <View className="w-8 items-center">
                        <MapPin size={16} color="#64748B" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-slate-400 text-[10px] font-medium uppercase tracking-tighter">Destination</Text>
                        <Text className="text-white font-bold" numberOfLines={1}>{load.destination_city}, {load.destination_country}</Text>
                    </View>
                </View>
            </View>

            <View className="mt-5 pt-4 border-t border-slate-700/50 flex-row justify-between">
                <View className="flex-row items-center">
                    <Calendar size={14} color="#64748B" />
                    <Text className="text-slate-400 text-xs ml-1 font-medium">
                        {new Date(load.pickup_earliest).toLocaleDateString()}
                    </Text>
                </View>
                <View className="flex-row items-center">
                    <Truck size={14} color="#64748B" />
                    <Text className="text-slate-400 text-xs ml-1 font-medium">
                        {load.weight_kg ? `${Math.round(load.weight_kg / 1000)}t` : 'Weight?'}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}
