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
                console.error('No userId found');
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

            console.log('✅ Datos del usuario cargados:', userData);
        } catch (error: any) {
            console.error('Error loading user data:', error);
            
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
                    console.log('⚠️ Usando datos del SecureStore (fallback)');
                } else {
                    Alert.alert('Error', 'No se pudo cargar la información del usuario');
                }
            } catch (storageError) {
                console.error('Error reading from SecureStore:', storageError);
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
            console.log('✅ Perfil actualizado:', updatedUser);
        } catch (error: any) {
            console.error('Error updating profile:', error);
            
            let errorMessage = 'No se pudo actualizar el perfil';
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }
            
            Alert.alert('Error', errorMessage);
        } finally {
            setUpdating(false);
        }
    };

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert('Error', 'Completa todos los campos de contraseña');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'Las contraseñas no coinciden');
            return;
        }

        if (newPassword.length < 8) {
            Alert.alert('Error', 'La contraseña debe tener al menos 8 caracteres');
            return;
        }

        if (!userData) {
            Alert.alert('Error', 'No se pudo obtener la información del usuario');
            return;
        }

        setUpdating(true);
        try {
            // Llamada al API para cambiar contraseña
            await userServices.changePassword(userData.id, {
                currentPassword,
                newPassword
            });

            Alert.alert('Éxito', 'Contraseña cambiada correctamente');
            
            // Limpiar campos
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            
            console.log('✅ Contraseña cambiada exitosamente');
        } catch (error: any) {
            console.error('Error changing password:', error);
            
            let errorMessage = 'No se pudo cambiar la contraseña';
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

                <ScrollView className="flex-1">
                    <View className="p-4">
                        {/* User Info Card */}
                        <View className="bg-slate-900 rounded-xl p-6 mb-6 border border-slate-800">
                            <View className="items-center mb-4">
                                <View className="w-20 h-20 rounded-full bg-blue-600 items-center justify-center mb-3">
                                    <Text className="text-3xl text-white font-bold">
                                        {username.charAt(0).toUpperCase()}
                                    </Text>
                                </View>
                                <Text className="text-slate-50 text-xl font-bold">
                                    {username}
                                </Text>
                                <Text className="text-slate-400 text-sm mt-1">
                                    {email}
                                </Text>
                                {userData && (
                                    <Text className="text-slate-500 text-xs mt-2">
                                        Miembro desde {new Date(userData.createdAt).toLocaleDateString('es-ES', {
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </Text>
                                )}
                            </View>
                        </View>

                        {/* Editar Perfil */}
                        <Text className="text-slate-400 text-sm font-bold mb-3 uppercase tracking-wider">
                            Editar Perfil
                        </Text>

                        <View className="bg-slate-900 rounded-xl p-4 mb-6 border border-slate-800">
                            <Input
                                label="Nombre de usuario"
                                placeholder="Tu nombre"
                                value={username}
                                onChangeText={setUsername}
                                icon="person"
                            />

                            <Input
                                label="Email"
                                placeholder="tu@email.com"
                                value={email}
                                onChangeText={setEmail}
                                icon="mail"
                                keyboardType="email-address"
                            />

                            <TouchableOpacity
                                onPress={handleUpdateProfile}
                                disabled={updating}
                                className={`bg-blue-600 rounded-xl p-4 items-center ${updating ? 'opacity-60' : ''}`}
                                activeOpacity={0.8}
                            >
                                {updating ? (
                                    <ActivityIndicator color="#FFFFFF" />
                                ) : (
                                    <Text className="text-white text-base font-semibold">
                                        Guardar Cambios
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Cambiar Contraseña */}
                        <Text className="text-slate-400 text-sm font-bold mb-3 uppercase tracking-wider">
                            Cambiar Contraseña
                        </Text>

                        <View className="bg-slate-900 rounded-xl p-4 mb-6 border border-slate-800">
                            <Input
                                label="Contraseña actual"
                                placeholder="••••••••"
                                value={currentPassword}
                                onChangeText={setCurrentPassword}
                                icon="lock-closed"
                                isPassword
                            />

                            <Input
                                label="Nueva contraseña"
                                placeholder="••••••••"
                                value={newPassword}
                                onChangeText={setNewPassword}
                                icon="key"
                                isPassword
                            />

                            <Input
                                label="Confirmar contraseña"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                icon="key"
                                isPassword
                            />

                            <TouchableOpacity
                                onPress={handleChangePassword}
                                disabled={updating}
                                className={`bg-slate-700 rounded-xl p-4 items-center ${updating ? 'opacity-60' : ''}`}
                                activeOpacity={0.8}
                            >
                                {updating ? (
                                    <ActivityIndicator color="#FFFFFF" />
                                ) : (
                                    <Text className="text-white text-base font-semibold">
                                        Cambiar Contraseña
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Logout Button */}
                        <TouchableOpacity
                            onPress={handleLogout}
                            className="bg-red-600 rounded-xl p-4 items-center mb-8"
                            activeOpacity={0.8}
                        >
                            <View className="flex-row items-center gap-2">
                                <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
                                <Text className="text-white text-base font-semibold">
                                    Cerrar Sesión
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}