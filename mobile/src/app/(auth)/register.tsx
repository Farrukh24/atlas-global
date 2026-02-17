import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../../services/api';
import { User, Mail, Lock, Building, Phone } from 'lucide-react-native';

export default function RegisterScreen() {
    const [formData, setFormData] = useState({
        legal_name: '',
        primary_email: '',
        password: '',
        primary_phone: '',
        party_type: 'carrier'
    });
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleRegister = async () => {
        setLoading(true);
        try {
            await api.post('/auth/register', formData);
            Alert.alert('Success', 'Account created! Please log in.', [
                { text: 'OK', onPress: () => router.replace('/(auth)/login') }
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView className="flex-1 bg-background px-6">
            <View className="mt-20 mb-10">
                <Text className="text-white text-3xl font-bold">Join the Network</Text>
                <Text className="text-slate-400 mt-2">Become a verified Atlas carrier partner.</Text>
            </View>

            <View className="space-y-4">
                <InputItem
                    icon={<Building size={20} color="#64748B" />}
                    placeholder="Company Legal Name"
                    value={formData.legal_name}
                    onChange={(text: string) => setFormData({ ...formData, legal_name: text })}
                />
                <InputItem
                    icon={<Mail size={20} color="#64748B" />}
                    placeholder="Email Address"
                    value={formData.primary_email}
                    onChange={(text: string) => setFormData({ ...formData, primary_email: text })}
                    keyboard="email-address"
                />
                <InputItem
                    icon={<Phone size={20} color="#64748B" />}
                    placeholder="Phone Number"
                    value={formData.primary_phone}
                    onChange={(text: string) => setFormData({ ...formData, primary_phone: text })}
                    keyboard="phone-pad"
                />
                <InputItem
                    icon={<Lock size={20} color="#64748B" />}
                    placeholder="Password"
                    value={formData.password}
                    onChange={(text: string) => setFormData({ ...formData, password: text })}
                    secure
                />

                <TouchableOpacity
                    className="bg-primary h-14 rounded-2xl items-center justify-center mt-6 shadow-lg"
                    onPress={handleRegister}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">Create Account</Text>}
                </TouchableOpacity>

                <TouchableOpacity className="items-center py-4" onPress={() => router.back()}>
                    <Text className="text-slate-400">Already have an account? <Text className="text-primary font-bold">Sign In</Text></Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

function InputItem({ icon, placeholder, value, onChange, secure, keyboard }: any) {
    return (
        <View className="bg-surface rounded-2xl flex-row items-center px-4 py-3 border border-slate-700">
            {icon}
            <TextInput
                placeholder={placeholder}
                placeholderTextColor="#64748B"
                className="flex-1 ml-3 text-white h-10"
                value={value}
                onChangeText={onChange}
                secureTextEntry={secure}
                keyboardType={keyboard || 'default'}
                autoCapitalize="none"
            />
        </View>
    );
}
