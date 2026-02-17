import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import api from '../../../services/api';
import { ArrowLeft, MapPin, Package, Clock, ShieldCheck, ChevronRight } from 'lucide-react-native';
import { formatCurrency, formatDate } from '../../../utils/format';
import BidModal from '../../../components/BidModal';

export default function LoadDetailScreen() {
    const { id } = useLocalSearchParams();
    const [load, setLoad] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [bidVisible, setBidVisible] = useState(false);
    const router = useRouter();

    useEffect(() => {
        fetchLoad();
    }, [id]);

    const fetchLoad = async () => {
        try {
            const response = await api.get(`/loads/${id}`);
            setLoad(response.data.data);
        } catch (error) {
            console.error('Fetch Load Error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <View className="flex-1 bg-background justify-center items-center">
            <ActivityIndicator color="#3B82F6" />
        </View>
    );

    return (
        <View className="flex-1 bg-background">
            <ScrollView className="flex-1">
                {/* Header Map Pseudo-Background */}
                <View className="h-64 bg-slate-800 items-center justify-center">
                    <Text className="text-slate-500 font-bold uppercase tracking-widest text-xs">Route Map Integration Ready</Text>
                </View>

                <View className="px-6 -mt-10">
                    <View className="bg-surface rounded-3xl p-6 border border-slate-700 shadow-2xl">
                        <View className="flex-row justify-between items-start mb-6">
                            <View>
                                <Text className="text-slate-400 text-xs font-bold uppercase tracking-widest">Load Number</Text>
                                <Text className="text-white text-lg font-bold">#{load.id}</Text>
                            </View>
                            <View className="items-end">
                                <Text className="text-primary text-2xl font-black">{formatCurrency(load.quoted_rate_amount)}</Text>
                                <Text className="text-slate-500 text-[10px] font-bold uppercase">Estimated Payout</Text>
                            </View>
                        </View>

                        <View className="space-y-6">
                            <View className="flex-row">
                                <View className="w-10 items-center">
                                    <View className="w-3 h-3 rounded-full bg-accent mt-1" />
                                    <View className="w-[2px] flex-1 bg-slate-700 my-2" />
                                </View>
                                <View className="flex-1 pb-4">
                                    <Text className="text-slate-400 text-xs font-medium uppercase mb-1">Pickup</Text>
                                    <Text className="text-white font-bold text-base">{load.origin_city}, {load.origin_country}</Text>
                                    <Text className="text-slate-500 text-xs mt-1">{formatDate(load.pickup_earliest)}</Text>
                                </View>
                            </View>

                            <View className="flex-row">
                                <View className="w-10 items-center">
                                    <MapPin size={22} color="#3B82F6" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-slate-400 text-xs font-medium uppercase mb-1">Delivery</Text>
                                    <Text className="text-white font-bold text-base">{load.destination_city}, {load.destination_country}</Text>
                                    <Text className="text-slate-500 text-xs mt-1">{formatDate(load.delivery_earliest)}</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    <View className="mt-6 space-y-4">
                        <Text className="text-white font-bold text-lg mb-2">Shipment Details</Text>

                        <View className="bg-surface rounded-2xl p-4 flex-row items-center border border-slate-800">
                            <View className="w-10 h-10 bg-slate-700/30 rounded-full items-center justify-center">
                                <Package size={20} color="#64748B" />
                            </View>
                            <View className="ml-4">
                                <Text className="text-slate-400 text-[10px] font-bold uppercase">Commodity</Text>
                                <Text className="text-white font-medium">{load.commodity_description || 'General Freight'}</Text>
                            </View>
                        </View>

                        <View className="bg-surface rounded-2xl p-4 flex-row items-center border border-slate-800">
                            <View className="w-10 h-10 bg-slate-700/30 rounded-full items-center justify-center">
                                <ShieldCheck size={20} color="#10B981" />
                            </View>
                            <View className="ml-4">
                                <Text className="text-slate-400 text-[10px] font-bold uppercase">Equipment</Text>
                                <Text className="text-white font-medium">{load.equipment_code} Required</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View className="h-32" />
            </ScrollView>

            {/* Floating Action Button */}
            <View className="absolute bottom-10 left-6 right-6 flex-row space-x-4">
                <TouchableOpacity
                    className="bg-primary flex-1 h-16 rounded-2xl items-center justify-center shadow-lg flex-row"
                    onPress={() => setBidVisible(true)}
                >
                    <Text className="text-white font-bold text-lg mr-2">Submit Offer</Text>
                    <ChevronRight size={20} color="white" />
                </TouchableOpacity>
            </View>

            <BidModal
                visible={bidVisible}
                onClose={() => setBidVisible(false)}
                loadId={Number(id)}
                initialAmount={load.quoted_rate_amount}
            />
        </View>
    );
}
