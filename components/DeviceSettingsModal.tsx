import { DeviceSettings } from '@/interfaces/device';
import deviceService from '@/services/deviceService';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    Platform,
    ScrollView,
    Switch,
    Text,
    TextInput,
    ToastAndroid,
    TouchableOpacity,
    View
} from 'react-native';

interface DeviceSettingsModalProps {
    visible: boolean;
    onClose: () => void;
    device: any; // Add the whole device object to get initial basic info
    settings: DeviceSettings | null;
    onSave: (settings: any) => Promise<void>;
}

// Subcomponentes movidos fuera para evitar que se reconstruyan en cada renderizado (causa cierre de teclado)
const StatusInput = ({ label, value, onChange, icon, placeholder }: any) => (
    <View className="mb-4">
        <Text className="text-slate-400 text-[10px] uppercase font-black mb-1.5 ml-1 tracking-widest">{label}</Text>
        <View className="bg-slate-800/50 rounded-xl flex-row items-center px-4 border border-white/5">
            <Ionicons name={icon} size={18} color="#64748b" style={{ marginRight: 12 }} />
            <TextInput
                className="flex-1 text-slate-50 py-3.5 font-bold"
                value={value}
                onChangeText={onChange}
                placeholder={placeholder}
                placeholderTextColor="#475569"
            />
        </View>
    </View>
);

const ThresholdInput = ({ label, value, onChange }: any) => (
    <View className="mb-4">
        <Text className="text-slate-400 text-[10px] uppercase font-bold mb-1 ml-1">{label}</Text>
        <View className="bg-slate-800 rounded-lg flex-row items-center px-3 border border-slate-700">
            <TextInput
                className="flex-1 text-slate-50 py-3 font-medium"
                value={value}
                onChangeText={onChange}
                keyboardType="numeric"
            />
            <Text className="text-slate-500 text-xs font-bold">PPM</Text>
        </View>
    </View>
);

const R0Input = ({ label, value, onChange }: any) => (
    <View className="mb-4 w-[48%]">
        <Text className="text-slate-400 text-[10px] uppercase font-bold mb-1 ml-1">{label} (R0)</Text>
        <View className="bg-slate-800 rounded-lg flex-row items-center px-3 border border-slate-700">
            <TextInput
                className="flex-1 text-slate-50 py-2 text-xs"
                value={value}
                onChangeText={onChange}
                keyboardType="numeric"
            />
            <Text className="text-slate-500 text-[10px]">kΩ</Text>
        </View>
    </View>
);

export const DeviceSettingsModal: React.FC<DeviceSettingsModalProps> = ({
    visible,
    onClose,
    device,
    settings,
    onSave
}) => {
    // Basic Info States
    const [name, setName] = useState(device?.name || '');
    const [description, setDescription] = useState(device?.description || '');
    const [location, setLocation] = useState(device?.location || '');

    // Estados para Umbrales
    const [mq2Threshold, setMq2Threshold] = useState(settings?.mq2ThresholdPpm?.toString() || '300');
    const [mq3Threshold, setMq3Threshold] = useState(settings?.mq3ThresholdPpm?.toString() || '150');
    const [mq5Threshold, setMq5Threshold] = useState(settings?.mq5ThresholdPpm?.toString() || '200');
    const [mq9Threshold, setMq9Threshold] = useState(settings?.mq9ThresholdPpm?.toString() || '100');

    // Estados para R0 (Calibración)
    const [mq2R0, setMq2R0] = useState(settings?.mq2R0?.toString() || '5.5');
    const [mq3R0, setMq3R0] = useState(settings?.mq3R0?.toString() || '2.0');
    const [mq5R0, setMq5R0] = useState(settings?.mq5R0?.toString() || '20.0');
    const [mq9R0, setMq9R0] = useState(settings?.mq9R0?.toString() || '12.0');

    const [buzzerEnabled, setBuzzerEnabled] = useState(settings?.buzzerEnabled ?? true);
    const [ledEnabled, setLedEnabled] = useState(settings?.ledEnabled ?? true);
    const [notifyUser, setNotifyUser] = useState(settings?.notifyUser ?? true);
    const [saving, setSaving] = useState(false);

    // Sync state ONLY when the modal becomes visible
    // This prevents periodic polling in the background from overwriting what the user is typing
    React.useEffect(() => {
        if (visible) {
            setName(device?.name || '');
            setDescription(device?.description || '');
            setLocation(device?.location || '');
            setMq2Threshold(settings?.mq2ThresholdPpm?.toString() || '300');
            setMq3Threshold(settings?.mq3ThresholdPpm?.toString() || '150');
            setMq5Threshold(settings?.mq5ThresholdPpm?.toString() || '200');
            setMq9Threshold(settings?.mq9ThresholdPpm?.toString() || '100');
            setMq2R0(settings?.mq2R0?.toString() || '5.5');
            setMq3R0(settings?.mq3R0?.toString() || '2.0');
            setMq5R0(settings?.mq5R0?.toString() || '20.0');
            setMq9R0(settings?.mq9R0?.toString() || '12.0');
            setBuzzerEnabled(settings?.buzzerEnabled ?? true);
            setLedEnabled(settings?.ledEnabled ?? true);
            setNotifyUser(settings?.notifyUser ?? true);
        }
    }, [visible]); // Only dependency is 'visible'

    const handleCalibrate = async () => {
        if (!device?.deviceKey) return;

        try {
            setSaving(true);
            await deviceService.calibrateDevice(device.deviceKey);
            if (Platform.OS === 'android') {
                ToastAndroid.show('Orden de calibración enviada', ToastAndroid.SHORT);
            } else {
                Alert.alert('Calibración', 'Orden de calibración enviada al dispositivo.');
            }
        } catch (error) {
            Alert.alert('Error', 'No se pudo enviar la orden de calibración.');
        } finally {
            setSaving(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await onSave({
                // Basic Info
                name,
                description,
                location,
                // Thresholds
                mq2ThresholdPpm: parseFloat(mq2Threshold),
                mq3ThresholdPpm: parseFloat(mq3Threshold),
                mq5ThresholdPpm: parseFloat(mq5Threshold),
                mq9ThresholdPpm: parseFloat(mq9Threshold),
                // R0
                mq2R0: parseFloat(mq2R0),
                mq3R0: parseFloat(mq3R0),
                mq5R0: parseFloat(mq5R0),
                mq9R0: parseFloat(mq9R0),
                // Toggles
                buzzerEnabled,
                ledEnabled,
                notifyUser
            });
            Alert.alert('Éxito', 'Configuración actualizada correctamente');
            onClose();
        } catch (error) {
            Alert.alert('Error', 'No se pudo actualizar la configuración. Verifica que los valores sean correctos.');
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
            <View className="flex-1 bg-black/80 justify-end">

                <View className="bg-slate-950 rounded-t-[40px] max-h-[92%] border-t border-white/10">
                    {/* Header */}
                    <View className="pt-6 pb-6 border-b border-white/5 px-6">
                        <View className="flex-row justify-between items-center">
                            <View>
                                <Text className="text-xl font-black text-slate-50 tracking-tighter">Configuración</Text>
                                <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Ajustes técnicos del dispositivo</Text>
                            </View>
                            <TouchableOpacity
                                onPress={onClose}
                                className="w-10 h-10 rounded-full bg-slate-900 border border-white/10 items-center justify-center"
                            >
                                <Ionicons name="close" size={24} color="#94a3b8" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <ScrollView className="px-6 pt-6" showsVerticalScrollIndicator={false}>
                        {/* Basic Info Section */}
                        <View className="flex-row items-center gap-2 mb-5">
                            <Ionicons name="information-circle-outline" size={16} color="#0ea5e9" />
                            <Text className="text-sky-500 text-xs font-black uppercase tracking-widest">Información Básica</Text>
                        </View>

                        <StatusInput
                            label="Nombre del Sensor"
                            value={name}
                            onChange={setName}
                            icon="pricetag-outline"
                            placeholder="Ej: Cocina MQ2"
                        />
                        <StatusInput
                            label="Ubicación"
                            value={location}
                            onChange={setLocation}
                            icon="location-outline"
                            placeholder="Ej: Planta Baja / Pasillo"
                        />
                        <StatusInput
                            label="Descripción"
                            value={description}
                            onChange={setDescription}
                            icon="document-text-outline"
                            placeholder="Opcional: Detalles adicionales..."
                        />

                        {/* Thresholds Section */}
                        <View className="flex-row items-center gap-2 mb-5 mt-4">
                            <Ionicons name="notifications-outline" size={16} color="#6366f1" />
                            <Text className="text-indigo-400 text-xs font-black uppercase tracking-widest">Umbrales de Alerta</Text>
                        </View>

                        <View className="flex-row flex-wrap justify-between">
                            <View className="w-[48%]">
                                <ThresholdInput label="MQ2 (LPG/Humo)" value={mq2Threshold} onChange={setMq2Threshold} />
                            </View>
                            <View className="w-[48%]">
                                <ThresholdInput label="MQ3 (Alcohol)" value={mq3Threshold} onChange={setMq3Threshold} />
                            </View>
                            <View className="w-[48%]">
                                <ThresholdInput label="MQ5 (Metano)" value={mq5Threshold} onChange={setMq5Threshold} />
                            </View>
                            <View className="w-[48%]">
                                <ThresholdInput label="MQ9 (CO)" value={mq9Threshold} onChange={setMq9Threshold} />
                            </View>
                        </View>

                        {/* Calibration Section */}
                        <View className="flex-row items-center gap-2 mb-4 mt-4">
                            <Ionicons name="options-outline" size={16} color="#10b981" />
                            <Text className="text-emerald-400 text-xs font-black uppercase tracking-widest">Calibración R0</Text>
                        </View>
                        <View className="flex-row flex-wrap justify-between bg-slate-900/50 p-4 rounded-2xl border border-white/5 mb-6">
                            <R0Input label="MQ2" value={mq2R0} onChange={setMq2R0} />
                            <R0Input label="MQ3" value={mq3R0} onChange={setMq3R0} />
                            <R0Input label="MQ5" value={mq5R0} onChange={setMq5R0} />
                            <R0Input label="MQ9" value={mq9R0} onChange={setMq9R0} />

                            <TouchableOpacity
                                onPress={handleCalibrate}
                                disabled={saving}
                                className="w-full bg-emerald-600/20 border border-emerald-500/30 py-3 rounded-xl flex-row items-center justify-center mt-2 mb-3"
                            >
                                <Ionicons name="refresh-circle-outline" size={20} color="#10b981" />
                                <Text className="text-emerald-400 font-bold ml-2 uppercase text-[10px] tracking-widest">Recalibrar Sensores Ahora</Text>
                            </TouchableOpacity>

                            <Text className="text-slate-500 text-[10px] font-medium leading-4 mt-1 italic">
                                ⚠️ Importante: Calibre solo cuando los sensores hayan estado encendidos al menos 3 minutos y se encuentre en un ambiente con aire limpio.
                            </Text>
                        </View>

                        {/* Actuators & Preferences */}
                        <View className="flex-row items-center gap-2 mb-4">
                            <Ionicons name="hardware-chip-outline" size={16} color="#f59e0b" />
                            <Text className="text-amber-400 text-xs font-black uppercase tracking-widest">Hardware y Alertas</Text>
                        </View>

                        <View className="bg-slate-900/50 rounded-2xl overflow-hidden border border-white/5 mb-10">
                            <View className="flex-row items-center justify-between p-4 border-b border-white/5">
                                <View className="flex-row items-center">
                                    <View className="w-8 h-8 rounded-full bg-amber-500/10 items-center justify-center mr-3">
                                        <Ionicons name="volume-high-outline" size={18} color="#f59e0b" />
                                    </View>
                                    <Text className="text-slate-300 font-bold">Buzzer Sonoro</Text>
                                </View>
                                <Switch
                                    value={buzzerEnabled}
                                    onValueChange={setBuzzerEnabled}
                                    trackColor={{ false: '#334155', true: '#f59e0b50' }}
                                    thumbColor={buzzerEnabled ? '#f59e0b' : '#64748b'}
                                />
                            </View>
                            <View className="flex-row items-center justify-between p-4 border-b border-white/5">
                                <View className="flex-row items-center">
                                    <View className="w-8 h-8 rounded-full bg-sky-500/10 items-center justify-center mr-3">
                                        <Ionicons name="sunny-outline" size={18} color="#0ea5e9" />
                                    </View>
                                    <Text className="text-slate-300 font-bold">LED de Estado</Text>
                                </View>
                                <Switch
                                    value={ledEnabled}
                                    onValueChange={setLedEnabled}
                                    trackColor={{ false: '#334155', true: '#0ea5e950' }}
                                    thumbColor={ledEnabled ? '#0ea5e9' : '#64748b'}
                                />
                            </View>
                            <View className="flex-row items-center justify-between p-4">
                                <View className="flex-row items-center">
                                    <View className="w-8 h-8 rounded-full bg-indigo-500/10 items-center justify-center mr-3">
                                        <Ionicons name="phone-portrait-outline" size={18} color="#6366f1" />
                                    </View>
                                    <Text className="text-slate-300 font-bold">Push Notifications</Text>
                                </View>
                                <Switch
                                    value={notifyUser}
                                    onValueChange={setNotifyUser}
                                    trackColor={{ false: '#334155', true: '#6366f150' }}
                                    thumbColor={notifyUser ? '#6366f1' : '#64748b'}
                                />
                            </View>
                        </View>
                    </ScrollView>

                    {/* Footer */}
                    <View className="p-6 border-t border-slate-800 bg-slate-900/80">
                        <TouchableOpacity
                            onPress={handleSave}
                            disabled={saving}
                            className="bg-indigo-600 py-4 rounded-xl flex-row items-center justify-center shadow-lg shadow-indigo-500/20"
                            activeOpacity={0.8}
                        >
                            {saving ? (
                                <ActivityIndicator color="#f8fafc" />
                            ) : (
                                <>
                                    <Ionicons name="checkmark-circle-outline" size={20} color="#f8fafc" />
                                    <Text className="text-white font-bold ml-2 text-lg">Guardar Configuración</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

