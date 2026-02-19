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

const RegisterScreen = () => {
    const { register, loading: authLoading } = useAuthContext();

    const [username, setUsername] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');

    const handleRegister = async (): Promise<void> => {

        if (!username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
            Alert.alert('Campos vacíos', 'Por favor completa todos los campos');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Las contraseñas no coinciden');
            return;
        }

        if (password.length < 8) {
            Alert.alert('Error', 'La contraseña debe tener al menos 8 caracteres');
            return;
        }

        try {
            const result = await register(username.trim(), email.trim(), password);

            if (result.success) {
                router.replace('/(tabs)');
            }
        } catch (error) {
            Alert.alert('Error', 'No se pudo completar el registro');
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
                            Crear Cuenta
                        </Text>
                        <Text className="text-base text-slate-400 text-center mb-12">
                            Únete al sistema de monitoreo IoT
                        </Text>

                        {/* Form */}
                        <View className="mt-6">
                            <Input
                                label="Nombre de usuario"
                                placeholder="Introduce tu nombre de usuario"
                                value={username}
                                onChangeText={setUsername}
                                icon="person"
                                autoCapitalize="none"
                            />

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
                                placeholder="Mínimo 8 caracteres"
                                value={password}
                                onChangeText={setPassword}
                                icon="lock-closed"
                                isPassword
                            />

                            <Input
                                label="Confirmar contraseña"
                                placeholder="Repite tu contraseña"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                icon="lock-closed"
                                isPassword
                            />

                            {/* Register Button */}
                            <TouchableOpacity
                                className={`bg-blue-600 rounded-xl p-4 items-center mb-4 shadow-lg mt-4 ${authLoading ? 'opacity-60' : ''}`}
                                onPress={handleRegister}
                                activeOpacity={0.8}
                                disabled={authLoading}
                            >
                                {authLoading ? (
                                    <ActivityIndicator color="#FFFFFF" />
                                ) : (
                                    <Text className="text-white text-lg font-semibold">
                                        Registrarse
                                    </Text>
                                )}
                            </TouchableOpacity>

                            {/* Login Link */}
                            <View className="flex-row justify-center items-center mt-6">
                                <Text className="text-slate-400 text-sm">
                                    ¿Ya tienes cuenta? {' '}
                                </Text>
                                <TouchableOpacity onPress={() => router.back()}>
                                    <Text className="text-blue-500 text-sm font-semibold">
                                        Inicia sesión
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

export default RegisterScreen;
