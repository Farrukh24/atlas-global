import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import api from '../services/api';
import { DollarSign, X } from 'lucide-react-native';

interface BidModalProps {
    visible: boolean;
    onClose: () => void;
    loadId: number;
    initialAmount: number;
}

export default function BidModal({ visible, onClose, loadId, initialAmount }: BidModalProps) {
    const [amount, setAmount] = useState(initialAmount.toString());
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await api.post(`/offers`, {
                load_id: loadId,
                offer_amount: Number(amount),
                offer_currency: 'USD'
            });
            Alert.alert('Success', 'Your bid has been submitted!');
            onClose();
        } catch (error) {
            Alert.alert('Error', 'Failed to submit bid. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View className="flex-1 justify-end bg-black/60">
                <View className="bg-surface rounded-t-[40px] p-8 pb-12 border-t border-slate-700">
                    <View className="flex-row justify-between items-center mb-8">
                        <Text className="text-white text-2xl font-bold">Submit Offer</Text>
                        <TouchableOpacity onPress={onClose} className="bg-slate-700 p-2 rounded-full">
                            <X size={20} color="white" />
                        </TouchableOpacity>
                    </View>

                    <Text className="text-slate-400 mb-6 text-center">
                        The shipper's quoted rate is <Text className="text-white font-bold">${initialAmount}</Text>. You can submit your own rate below.
                    </Text>

                    <View className="bg-background rounded-2xl flex-row items-center px-6 py-4 border border-slate-700 mb-8">
                        <DollarSign size={24} color="#3B82F6" />
                        <TextInput
                            value={amount}
                            onChangeText={setAmount}
                            keyboardType="numeric"
                            className="flex-1 ml-3 text-white text-2xl font-bold"
                            autoFocus
                        />
                    </View>

                    <TouchableOpacity
                        className="bg-primary h-16 rounded-2xl items-center justify-center flex-row"
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white font-bold text-lg">Send Counter-Offer</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}
