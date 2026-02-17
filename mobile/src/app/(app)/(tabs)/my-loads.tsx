import React, { useEffect } from 'react';
import { View, FlatList, Text, TouchableOpacity } from 'react-native';
import { useLoadStore } from '@/stores/loadStore';
import LoadCard from '@/components/LoadCard';
import { Load } from '@/types';

export default function MyLoadsScreen() {
    const { myLoads, fetchMyLoads } = useLoadStore();

    useEffect(() => {
        fetchMyLoads();
    }, []);

    return (
        <View className="flex-1 bg-background">
            <View className="px-6 py-6 bg-surface border-b border-slate-800">
                <Text className="text-white text-2xl font-black">My Shipments</Text>
                <View className="flex-row space-x-4 mt-4">
                    <TouchableOpacity className="px-4 py-2 bg-primary rounded-full">
                        <Text className="text-white text-xs font-bold">Active</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="px-4 py-2 bg-slate-800 rounded-full">
                        <Text className="text-slate-400 text-xs font-bold">Completed</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <FlatList
                data={myLoads}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }: { item: Load }) => (
                    <LoadCard load={item} />
                )}
                contentContainerStyle={{ padding: 16 }}
                ListEmptyComponent={
                    <View className="mt-20 items-center">
                        <Text className="text-slate-500 font-bold">No assigned loads yet.</Text>
                    </View>
                }
            />
        </View>
    );
}
