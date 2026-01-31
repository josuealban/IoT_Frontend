// src/presentation/screens/auth/LoginScreen.tsx
import { useAuthContext } from '@/hooks/useAuthContext';
import { Input } from '@/src/presentation/components/common/Input';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const LoginScreen = () => {
    const { login, loading: authLoading } = useAuthContext();

    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    const handleLogin = async (): Promise<void> => {
        if (!email.trim() || !password.trim()) {
            Alert.alert('Campos vacíos', 'Por favor completa todos los campos');
            return;
        }

        try {
            const result = await login(email.trim(), password);

            if (result.success) {
                router.replace('/(tabs)');
            }

        } catch (error) {
            Alert.alert('Error', 'No se pudo iniciar sesión');
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-950">
            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView
                    className="flex-grow"
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{ flexGrow: 1 }}
                >
                    <View className="flex-1 px-6 pt-12 pb-8">
                        {/* Logo */}
                        <View className="items-center mb-8">
                            <View className="w-24 h-24 rounded-3xl bg-blue-600 items-center justify-center shadow-lg">
                                <Text className="text-5xl">💨</Text>
                            </View>
                        </View>

                        {/* Title */}
                        <Text className="text-4xl font-bold text-slate-50 text-center mb-2">
                            IoT Monitor
                        </Text>
                        <Text className="text-base text-slate-400 text-center mb-12">
                            Sistema de Monitoreo de Gas en Tiempo Real
                        </Text>

                        {/* Form */}
                        <View className="mt-6">
                            <Input
                                label="Correo electrónico"
                                placeholder="Introduce tu correo"
                                value={email}
                                onChangeText={setEmail}
                                icon="mail"
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />

                            <Input
                                label="Contraseña"
                                placeholder="Introduce tu contraseña"
                                value={password}
                                onChangeText={setPassword}
                                icon="lock-closed"
                                isPassword
                            />

                            <TouchableOpacity className="self-end mb-6">
                                <Text className="text-blue-500 text-sm">
                                    ¿Olvidaste tu contraseña?
                                </Text>
                            </TouchableOpacity>

                            {/* Login Button */}
                            <TouchableOpacity
                                className={`bg-blue-600 rounded-xl p-4 items-center mb-4 shadow-lg ${authLoading ? 'opacity-60' : ''}`}
                                onPress={handleLogin}
                                activeOpacity={0.8}
                                disabled={authLoading}
                            >
                                {authLoading ? (
                                    <ActivityIndicator color="#FFFFFF" />
                                ) : (
                                    <Text className="text-white text-lg font-semibold">
                                        Iniciar Sesión
                                    </Text>
                                )}
                            </TouchableOpacity>

                            {/* Register Link */}
                            <View className="flex-row justify-center items-center mt-6">
                                <Text className="text-slate-400 text-sm">
                                    ¿No tienes cuenta? {' '}
                                </Text>
                                <TouchableOpacity onPress={() => router.push('/register')}>
                                    <Text className="text-blue-500 text-sm font-semibold">
                                        Regístrate aquí
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default LoginScreen;
