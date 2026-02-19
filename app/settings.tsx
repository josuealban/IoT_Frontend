// app/settings.tsx
import { useAuthContext } from '@/hooks/useAuthContext';
import userServices from '@/services/userServices';
import { Input } from '@/src/presentation/components/common/Input';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
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

interface UserData {
    id: number;
    username: string;
    email: string;
    isActive: boolean;
    createdAt: string;
}

export default function SettingsScreen() {
    const { logout, userId } = useAuthContext();
    const router = useRouter();

    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    // Estados para edición
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            setLoading(true);

            if (!userId) {

                Alert.alert('Error', 'No se pudo obtener la información del usuario');
                return;
            }

            // Obtener datos del usuario desde el API
            const userData = await userServices.getUserById(userId);

            setUserData(userData);
            setUsername(userData.username);
            setEmail(userData.email);

            // Actualizar SecureStore con los datos más recientes
            await SecureStore.setItemAsync('username', userData.username);
            await SecureStore.setItemAsync('email', userData.email);


        } catch (error: any) {


            // Si falla el API, intentar cargar desde SecureStore
            try {
                const storedUsername = await SecureStore.getItemAsync('username');
                const storedEmail = await SecureStore.getItemAsync('email');
                const storedUserId = await SecureStore.getItemAsync('userId');

                if (storedUsername && storedEmail && storedUserId) {
                    const fallbackData: UserData = {
                        id: Number(storedUserId),
                        username: storedUsername,
                        email: storedEmail,
                        isActive: true,
                        createdAt: new Date().toISOString()
                    };
                    setUserData(fallbackData);
                    setUsername(storedUsername);
                    setEmail(storedEmail);

                } else {
                    Alert.alert('Error', 'No se pudo cargar la información del usuario');
                }
            } catch (storageError) {

                Alert.alert('Error', 'No se pudo cargar la información del usuario');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async () => {
        if (!username.trim() || !email.trim()) {
            Alert.alert('Error', 'Nombre y email son requeridos');
            return;
        }

        if (!userData) {
            Alert.alert('Error', 'No se pudo obtener la información del usuario');
            return;
        }

        setUpdating(true);
        try {
            // Llamada al API para actualizar el perfil
            const updatedUser = await userServices.updateProfile(userData.id, {
                username: username.trim(),
                email: email.trim()
            });

            // Actualizar SecureStore
            await SecureStore.setItemAsync('username', updatedUser.username);
            await SecureStore.setItemAsync('email', updatedUser.email);

            // Actualizar estado local
            setUserData(updatedUser);
            setUsername(updatedUser.username);
            setEmail(updatedUser.email);

            Alert.alert('Éxito', 'Perfil actualizado correctamente');

        } catch (error: any) {


            let errorMessage = 'No se pudo actualizar el perfil';
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }

            Alert.alert('Error', errorMessage);
        } finally {
            setUpdating(false);
        }
    };


    const handleLogout = () => {
        Alert.alert(
            'Cerrar Sesión',
            '¿Estás seguro que deseas cerrar sesión?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Cerrar Sesión',
                    style: 'destructive',
                    onPress: async () => {
                        await logout();
                        router.replace('/login');
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-slate-950 justify-center items-center">
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text className="text-slate-400 mt-4">Cargando información...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-slate-950" edges={['top']}>
            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                {/* Header */}
                <View className="flex-row items-center justify-between px-4 py-3 border-b border-slate-800">
                    <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
                        <Ionicons name="arrow-back" size={24} color="#f8fafc" />
                    </TouchableOpacity>
                    <Text className="text-lg font-bold text-slate-50">Configuración</Text>
                    <View className="w-10" />
                </View>

                <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                    <View className="p-5">
                        {/* User Info Card */}
                        <View className="bg-slate-900 rounded-2xl p-6 mb-8 border border-slate-800 items-center">
                            <View className="mb-4">
                                <View className="w-24 h-24 rounded-full bg-blue-600 items-center justify-center border-4 border-slate-800 shadow-xl">
                                    <Text className="text-4xl text-white font-bold">
                                        {username.charAt(0).toUpperCase()}
                                    </Text>
                                </View>
                                <View className="absolute bottom-0 right-0 w-8 h-8 bg-green-500 rounded-full border-4 border-slate-900" />
                            </View>

                            <Text className="text-slate-50 text-2xl font-bold">
                                {username}
                            </Text>
                            <Text className="text-slate-400 text-sm mt-1">
                                {email}
                            </Text>

                            <View className="flex-row mt-6 pt-6 border-t border-slate-800 w-full justify-around">
                                <View className="items-center">
                                    <Text className="text-slate-50 font-bold">Activo</Text>
                                    <Text className="text-slate-500 text-[10px] uppercase">Estado</Text>
                                </View>
                                <View className="items-center">
                                    <Text className="text-slate-50 font-bold">
                                        {new Date(userData?.createdAt || '').toLocaleDateString('es-ES', { year: 'numeric' })}
                                    </Text>
                                    <Text className="text-slate-500 text-[10px] uppercase">Desde</Text>
                                </View>
                            </View>
                        </View>

                        {/* Editar Perfil */}
                        <View className="mb-8">
                            <Text className="text-slate-500 text-[10px] font-bold mb-3 uppercase tracking-[2px] ml-1">
                                Información de la Cuenta
                            </Text>
                            <View className="bg-slate-900 rounded-2xl p-5 border border-slate-800">
                                <Input
                                    label="Nombre de usuario"
                                    placeholder="Tu nombre"
                                    value={username}
                                    onChangeText={setUsername}
                                    icon="person-outline"
                                />

                                <Input
                                    label="Correo Electrónico"
                                    placeholder="tu@email.com"
                                    value={email}
                                    onChangeText={setEmail}
                                    icon="mail-outline"
                                    keyboardType="email-address"
                                />

                                <TouchableOpacity
                                    onPress={handleUpdateProfile}
                                    disabled={updating}
                                    className={`bg-blue-600 rounded-xl py-4 items-center mt-2 shadow-lg shadow-blue-500/20 ${updating ? 'opacity-60' : ''}`}
                                    activeOpacity={0.8}
                                >
                                    {updating ? (
                                        <ActivityIndicator color="#FFFFFF" />
                                    ) : (
                                        <Text className="text-white text-base font-bold">
                                            Actualizar Perfil
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Seguridad (Placeholder for future) */}
                        <View className="mb-10">
                            <Text className="text-slate-500 text-[10px] font-bold mb-3 uppercase tracking-[2px] ml-1">
                                Sesión y Seguridad
                            </Text>
                            <View className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800">
                                <TouchableOpacity
                                    onPress={handleLogout}
                                    className="flex-row items-center justify-between p-5 bg-red-500/5"
                                    activeOpacity={0.6}
                                >
                                    <View className="flex-row items-center gap-3">
                                        <View className="w-10 h-10 rounded-full bg-red-500/10 items-center justify-center">
                                            <Ionicons name="log-out-outline" size={20} color="#ef4444" />
                                        </View>
                                        <View>
                                            <Text className="text-red-500 font-bold">Cerrar Sesión</Text>
                                            <Text className="text-red-900/40 text-[10px]">Salir de tu cuenta en este dispositivo</Text>
                                        </View>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color="#ef4444" opacity={0.5} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <Text className="text-center text-slate-700 text-[10px] uppercase font-bold tracking-widest mb-10">
                            Guasmo IoT • Versión 1.2.0
                        </Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}