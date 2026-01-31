import { DeviceSettings } from '@/interfaces/device';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

interface DeviceSettingsModalProps {
    visible: boolean;
    onClose: () => void;
    settings: DeviceSettings | null;
    onSave: (settings: Partial<DeviceSettings>) => Promise<void>;
}

export const DeviceSettingsModal: React.FC<DeviceSettingsModalProps> = ({
    visible,
    onClose,
    settings,
    onSave
}) => {
    const [gasThreshold, setGasThreshold] = useState(settings?.gasThresholdPpm?.toString() || '300');
    const [voltageThreshold, setVoltageThreshold] = useState(settings?.voltageThreshold?.toString() || '1.5');
    const [buzzerEnabled, setBuzzerEnabled] = useState(settings?.buzzerEnabled ?? true);
    const [ledEnabled, setLedEnabled] = useState(settings?.ledEnabled ?? true);
    const [notifyUser, setNotifyUser] = useState(settings?.notifyUser ?? true);
    const [calibrationR0, setCalibrationR0] = useState(settings?.calibrationR0?.toString() || '10.0');
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        const gasThresholdNum = parseFloat(gasThreshold);
        const voltageThresholdNum = parseFloat(voltageThreshold);
        const calibrationR0Num = parseFloat(calibrationR0);

        if (isNaN(gasThresholdNum) || gasThresholdNum <= 0) {
            Alert.alert('Error', 'El umbral de gas debe ser un número positivo');
            return;
        }

        if (isNaN(voltageThresholdNum) || voltageThresholdNum <= 0) {
            Alert.alert('Error', 'El umbral de voltaje debe ser un número positivo');
            return;
        }

        if (isNaN(calibrationR0Num) || calibrationR0Num <= 0) {
            Alert.alert('Error', 'La calibración R0 debe ser un número positivo');
            return;
        }

        setSaving(true);
        try {
            await onSave({
                gasThresholdPpm: gasThresholdNum,
                voltageThreshold: voltageThresholdNum,
                buzzerEnabled,
                ledEnabled,
                notifyUser,
                calibrationR0: calibrationR0Num
            });
            Alert.alert('Éxito', 'Configuración actualizada correctamente');
            onClose();
        } catch (error) {
            Alert.alert('Error', 'No se pudo actualizar la configuración');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-black/50 justify-end">
                <View className="bg-slate-900 rounded-t-3xl max-h-[85%]">
                    {/* Header */}
                    <View className="flex-row items-center justify-between p-6 border-b border-slate-800">
                        <Text className="text-xl font-bold text-slate-50">Configuración</Text>
                        <TouchableOpacity onPress={onClose} className="p-2">
                            <Ionicons name="close" size={24} color="#f8fafc" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView className="px-6 py-4">
                        {/* Gas Threshold */}
                        <View className="mb-6">
                            <Text className="text-slate-300 font-semibold mb-2">Umbral de Gas (PPM)</Text>
                            <TextInput
                                className="bg-slate-800 text-slate-50 px-4 py-3 rounded-lg border border-slate-700"
                                value={gasThreshold}
                                onChangeText={setGasThreshold}
                                keyboardType="numeric"
                                placeholder="300"
                                placeholderTextColor="#64748b"
                            />
                            <Text className="text-slate-500 text-xs mt-1">
                                Alerta cuando el gas supere este valor
                            </Text>
                        </View>

                        {/* Voltage Threshold */}
                        <View className="mb-6">
                            <Text className="text-slate-300 font-semibold mb-2">Umbral de Voltaje (V)</Text>
                            <TextInput
                                className="bg-slate-800 text-slate-50 px-4 py-3 rounded-lg border border-slate-700"
                                value={voltageThreshold}
                                onChangeText={setVoltageThreshold}
                                keyboardType="numeric"
                                placeholder="1.5"
                                placeholderTextColor="#64748b"
                            />
                            <Text className="text-slate-500 text-xs mt-1">
                                Voltaje mínimo de operación
                            </Text>
                        </View>

                        {/* Calibration R0 */}
                        <View className="mb-6">
                            <Text className="text-slate-300 font-semibold mb-2">Calibración R0 (kΩ)</Text>
                            <TextInput
                                className="bg-slate-800 text-slate-50 px-4 py-3 rounded-lg border border-slate-700"
                                value={calibrationR0}
                                onChangeText={setCalibrationR0}
                                keyboardType="numeric"
                                placeholder="10.0"
                                placeholderTextColor="#64748b"
                            />
                            <Text className="text-slate-500 text-xs mt-1">
                                Resistencia de calibración del sensor
                            </Text>
                        </View>

                        {/* Buzzer Toggle */}
                        <View className="flex-row items-center justify-between mb-6 bg-slate-800 p-4 rounded-lg">
                            <View className="flex-1">
                                <Text className="text-slate-300 font-semibold">Buzzer</Text>
                                <Text className="text-slate-500 text-xs mt-1">
                                    Activar alarma sonora
                                </Text>
                            </View>
                            <Switch
                                value={buzzerEnabled}
                                onValueChange={setBuzzerEnabled}
                                trackColor={{ false: '#334155', true: '#475569' }}
                                thumbColor={buzzerEnabled ? '#f8fafc' : '#64748b'}
                            />
                        </View>

                        {/* LED Toggle */}
                        <View className="flex-row items-center justify-between mb-6 bg-slate-800 p-4 rounded-lg">
                            <View className="flex-1">
                                <Text className="text-slate-300 font-semibold">LED</Text>
                                <Text className="text-slate-500 text-xs mt-1">
                                    Activar indicador LED
                                </Text>
                            </View>
                            <Switch
                                value={ledEnabled}
                                onValueChange={setLedEnabled}
                                trackColor={{ false: '#334155', true: '#475569' }}
                                thumbColor={ledEnabled ? '#f8fafc' : '#64748b'}
                            />
                        </View>

                        {/* Notify User Toggle */}
                        <View className="flex-row items-center justify-between mb-6 bg-slate-800 p-4 rounded-lg">
                            <View className="flex-1">
                                <Text className="text-slate-300 font-semibold">Notificaciones</Text>
                                <Text className="text-slate-500 text-xs mt-1">
                                    Recibir notificaciones push
                                </Text>
                            </View>
                            <Switch
                                value={notifyUser}
                                onValueChange={setNotifyUser}
                                trackColor={{ false: '#334155', true: '#475569' }}
                                thumbColor={notifyUser ? '#f8fafc' : '#64748b'}
                            />
                        </View>
                    </ScrollView>

                    {/* Footer */}
                    <View className="p-6 border-t border-slate-800">
                        <TouchableOpacity
                            onPress={handleSave}
                            disabled={saving}
                            className="bg-slate-700 py-4 rounded-lg flex-row items-center justify-center"
                        >
                            {saving ? (
                                <ActivityIndicator color="#f8fafc" />
                            ) : (
                                <>
                                    <Ionicons name="save-outline" size={20} color="#f8fafc" />
                                    <Text className="text-white font-bold ml-2">Guardar Cambios</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};
