import deviceService from '@/services/deviceService';
import notificationService from '@/services/notificationServices';
import { Input } from '@/src/presentation/components/common/Input';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const AddDeviceScreen = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAddDevice = async () => {
        if (!name.trim()) {
            notificationService.error('Campo requerido', 'El nombre del dispositivo es obligatorio');
            return;
        }

        try {
            setLoading(true);
            const result = await deviceService.createDevice({
                name: name.trim(),
                description: description.trim(),
                location: location.trim(),
            });

            notificationService.success('Éxito', 'Dispositivo agregado correctamente');
            router.back();
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'No se pudo agregar el dispositivo';
            notificationService.error('Error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-950">
            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <View className="flex-row items-center px-4 py-4">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="p-2 bg-slate-800 rounded-full"
                    >
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-slate-50 ml-4">Nuevo Dispositivo</Text>
                </View>

                <ScrollView
                    className="flex-grow"
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{ flexGrow: 1 }}
                >
                    <View className="flex-1 px-6 pt-4 pb-8">
                        <View className="items-center mb-8">
                            <View className="w-20 h-20 rounded-3xl bg-blue-600/20 items-center justify-center border border-blue-600/30">
                                <Ionicons name="hardware-chip" size={40} color="#3b82f6" />
                            </View>
                            <Text className="text-slate-400 text-center mt-4">
                                Configura tu nuevo nodo de monitoreo ESP32 para comenzar a recibir datos en tiempo real.
                            </Text>
                        </View>

                        <View className="space-y-4">
                            <Input
                                label="Nombre del Dispositivo"
                                placeholder="Ej: Sensor Cocina"
                                value={name}
                                onChangeText={setName}
                                icon="pricetag-outline"
                            />

                            <Input
                                label="Ubicación"
                                placeholder="Ej: Planta 1, Sector A"
                                value={location}
                                onChangeText={setLocation}
                                icon="location-outline"
                            />

                            <Input
                                label="Descripción (Opcional)"
                                placeholder="Ej: Control de fugas de gas LP"
                                value={description}
                                onChangeText={setDescription}
                                icon="document-text-outline"
                            />
                        </View>

                        <View className="mt-8">
                            <TouchableOpacity
                                className={`bg-blue-600 rounded-xl p-4 items-center shadow-lg ${loading ? 'opacity-60' : ''}`}
                                onPress={handleAddDevice}
                                activeOpacity={0.8}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#FFFFFF" />
                                ) : (
                                    <View className="flex-row items-center">
                                        <Ionicons name="add-circle-outline" size={20} color="white" style={{ marginRight: 8 }} />
                                        <Text className="text-white text-lg font-semibold">
                                            Vincular Dispositivo
                                        </Text>
                                    </View>
                                )}
                            </TouchableOpacity>

                            <Text className="text-slate-500 text-xs text-center mt-4 px-4">
                                Al vincular el dispositivo, se generará una clave única (Device Key) que deberás configurar en tu código de ESP32.
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default AddDeviceScreen;
