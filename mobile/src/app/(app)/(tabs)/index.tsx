import React, { useEffect } from 'react';
import { View, FlatList, Text, RefreshControl, ActivityIndicator } from 'react-native';
import { useLoadStore } from '@/stores/loadStore';
import LoadCard from '@/components/LoadCard';
import { Filter } from 'lucide-react-native';
import { Load } from '@/types';

export default function LoadBoard() {
    const { loads, isLoading, fetchLoads } = useLoadStore();

    useEffect(() => {
        fetchLoads();
    }, []);

    return (
        <View className="flex-1 bg-background">
            <View className="px-6 py-6 flex-row items-center justify-between">
                <View>
                    <Text className="text-white text-3xl font-black italic tracking-tighter">ATLAS</Text>
                    <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Global Freight Exchange</Text>
                </View>
                <TouchableOpacity className="p-3 bg-slate-800 rounded-2xl">
                    <Filter size={20} color="#64748B" />
                </TouchableOpacity>
            </View>

            {isLoading && !loads.length ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator color="#3B82F6" />
                </View>
            ) : (
                <FlatList
                    data={loads}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }: { item: Load }) => (
                        <LoadCard load={item} />
                    )}
                    contentContainerStyle={{ padding: 16 }}
                    refreshControl={
                        <RefreshControl
                            refreshing={isLoading}
                            onRefresh={fetchLoads}
                            tintColor="#3B82F6"
                        />
                    }
                />
            )}
        </View>
    );
}

import { TouchableOpacity } from 'react-native';
