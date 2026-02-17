import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useAuthStore } from '../../stores/authStore';
import api from '../../services/api';
import { useRouter } from 'expo-router';
import { Lock, Mail } from 'lucide-react-native';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const setAuth = useAuthStore((state) => state.setAuth);
    const router = useRouter();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter your credentials');
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/auth/login', { email, password });
            const { token, user } = response.data.data;
            await setAuth(token, user);
            router.replace('/(app)/(tabs)');
        } catch (error: any) {
            const message = error.response?.data?.message || 'Login failed';
            Alert.alert('Login Error', message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-background px-6 justify-center">
            <View className="mb-10 items-center">
                <Text className="text-white text-4xl font-bold tracking-tight">ATLAS</Text>
                <Text className="text-primary text-sm font-medium uppercase tracking-widest mt-1">Carrier Network</Text>
            </View>

            <View className="space-y-4">
                <View className="bg-surface rounded-2xl flex-row items-center px-4 py-3 border border-slate-700">
                    <Mail size={20} color="#64748B" />
                    <TextInput
                        placeholder="Email Address"
                        placeholderTextColor="#64748B"
                        className="flex-1 ml-3 text-white h-10"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                    />
                </View>

                <View className="bg-surface rounded-2xl flex-row items-center px-4 py-3 border border-slate-700">
                    <Lock size={20} color="#64748B" />
                    <TextInput
                        placeholder="Password"
                        placeholderTextColor="#64748B"
                        className="flex-1 ml-3 text-white h-10"
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                    />
                </View>

                <TouchableOpacity
                    className="bg-primary h-14 rounded-2xl items-center justify-center mt-4"
                    onPress={handleLogin}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-bold text-lg">Sign In</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    className="items-center py-2"
                    onPress={() => router.push('/(auth)/register')}
                >
                    <Text className="text-slate-400">
                        Don't have an account? <Text className="text-primary font-bold">Sign Up</Text>
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
