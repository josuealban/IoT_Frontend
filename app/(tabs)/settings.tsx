import { useAuthContext } from '@/hooks/useAuthContext';
import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
    const { logout } = useAuthContext();

    return (
        <SafeAreaView className="flex-1 bg-slate-950 justify-center items-center">
            <Text className="text-slate-50 text-xl font-bold mb-8">Settings</Text>

            <TouchableOpacity
                onPress={logout}
                className="bg-red-600 px-6 py-3 rounded-xl"
            >
                <Text className="text-white font-bold">Cerrar Sesión</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}
