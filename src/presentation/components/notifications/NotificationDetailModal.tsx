// src/presentation/components/notifications/NotificationDetailModal.tsx
import { Notification, NotificationType } from '@/interfaces/notification';
import notificationService from '@/services/notificationSensorService';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Modal,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface NotificationDetailModalProps {
    notification: Notification | null;
    visible: boolean;
    onClose: () => void;
}

export const NotificationDetailModal: React.FC<NotificationDetailModalProps> = ({
    notification,
    visible,
    onClose
}) => {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [resolving, setResolving] = React.useState(false);
    const [isResolvedLocally, setIsResolvedLocally] = React.useState(false);


    React.useEffect(() => {
        if (visible) {
            setIsResolvedLocally(notification?.alert?.resolved || false);
        }
    }, [notification, visible]);

    if (!notification) return null;

    const alert = notification.alert;
    const getRealSeverity = () => {
        const title = notification.title.toUpperCase();
        if (title.includes('CRÍTICO') || title.includes('CRITICAL')) return 'CRITICAL';
        if (title.includes('ALTO') || title.includes('HIGH')) return 'HIGH';
        if (title.includes('MEDIO') || title.includes('MEDIUM')) return 'MEDIUM';
        if (title.includes('BAJO') || title.includes('LOW')) return 'LOW';
        return alert?.severity || (notification.type === NotificationType.ALERT ? 'MEDIUM' : 'INFO');
    };

    const severity = getRealSeverity();

    const getIcon = () => {
        if (isResolvedLocally) return 'checkmark-circle';
        switch (severity) {
            case 'CRITICAL': return 'skull';
            case 'HIGH': return 'warning';
            case 'MEDIUM': return 'alert-circle';
            case 'LOW': return 'notifications';
            default: return 'notifications-outline';
        }
    };

    const getColors = () => {
        if (isResolvedLocally) {
            return { bg: 'bg-emerald-500/10', icon: '#10b981', text: 'text-emerald-500', badge: 'RESUELTA' };
        }
        switch (severity) {
            case 'CRITICAL': return { bg: 'bg-red-500/10', icon: '#ef4444', text: 'text-red-500', badge: 'CRÍTICO' };
            case 'HIGH': return { bg: 'bg-orange-500/10', icon: '#f97316', text: 'text-orange-500', badge: 'ALTO' };
            case 'MEDIUM': return { bg: 'bg-yellow-500/10', icon: '#f59e0b', text: 'text-yellow-500', badge: 'MEDIO' };
            case 'LOW': return { bg: 'bg-blue-500/10', icon: '#3b82f6', text: 'text-blue-500', badge: 'BAJO' };
            default: return { bg: 'bg-slate-500/10', icon: '#64748b', text: 'text-slate-500', badge: 'AVISO' };
        }
    };

    const colors = getColors();
    const formattedDate = new Date(notification.createdAt).toLocaleString('es-ES', {
        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
    });

    const handleGoToDevice = () => {
        if (alert?.deviceId) {
            onClose();
            router.push(`/device/${alert.deviceId}`);
        }
    };

    const handleResolveAlert = async () => {
        const idToResolve = alert?.id || notification.alertId;
        if (!idToResolve) return;
        try {
            setResolving(true);
            await notificationService.resolveAlert(idToResolve);
            setIsResolvedLocally(true);
            if (notification.alert) notification.alert.resolved = true;
        } catch (error) {
            Alert.alert('Error', 'No se pudo resolver la alerta.');
        } finally {
            setResolving(false);
        }
    };

    // ==========================================
    // ACCIONES SUGERIDAS POR TIPO DE GAS Y SEVERIDAD
    // ==========================================
    const getSuggestedActions = (): { icon: string; text: string; priority: 'urgent' | 'important' | 'info' }[] => {
        const gasType = alert?.gasType || '';
        const actions: { icon: string; text: string; priority: 'urgent' | 'important' | 'info' }[] = [];

        // Acciones por severidad (aplica a todos)
        if (severity === 'CRITICAL') {
            actions.push({ icon: 'exit-outline', text: 'Evacúe el área inmediatamente', priority: 'urgent' });
            actions.push({ icon: 'call-outline', text: 'Contacte a emergencias (911)', priority: 'urgent' });
            actions.push({ icon: 'flash-off-outline', text: 'No encienda interruptores eléctricos', priority: 'urgent' });
        } else if (severity === 'HIGH') {
            actions.push({ icon: 'exit-outline', text: 'Considere evacuar el área', priority: 'urgent' });
            actions.push({ icon: 'people-outline', text: 'Alerte a las personas cercanas', priority: 'important' });
        }

        // Acciones específicas por tipo de gas
        switch (gasType) {
            case 'LPG':
                actions.push({ icon: 'flame-outline', text: 'No use llamas abiertas ni fósforos', priority: 'urgent' });
                actions.push({ icon: 'water-outline', text: 'Verifique conexiones de la bombona de gas', priority: 'important' });
                if (severity !== 'LOW') {
                    actions.push({ icon: 'cellular-outline', text: 'Abra ventanas para ventilar el espacio', priority: 'important' });
                }
                actions.push({ icon: 'construct-outline', text: 'Revise mangueras y reguladores de LPG', priority: 'info' });
                break;
            case 'CO':
                actions.push({ icon: 'medical-outline', text: 'Busque aire fresco, el CO es inodoro y letal', priority: 'urgent' });
                actions.push({ icon: 'flame-outline', text: 'Apague calefactores, estufas o motores', priority: 'urgent' });
                if (severity === 'HIGH' || severity === 'CRITICAL') {
                    actions.push({ icon: 'fitness-outline', text: 'Si hay mareo o náuseas, busque atención médica', priority: 'urgent' });
                }
                actions.push({ icon: 'aperture-outline', text: 'Ventile el área abriendo puertas y ventanas', priority: 'important' });
                break;
            case 'SMOKE':
                actions.push({ icon: 'eye-outline', text: 'Identifique el origen del humo', priority: 'urgent' });
                actions.push({ icon: 'bonfire-outline', text: 'Verifique si hay incendio activo', priority: 'urgent' });
                if (severity !== 'LOW') {
                    actions.push({ icon: 'hand-left-outline', text: 'Si hay fuego, no use ascensores', priority: 'important' });
                }
                actions.push({ icon: 'body-outline', text: 'Agáchese, el humo sube', priority: 'info' });
                break;
            case 'ALCOHOL':
                actions.push({ icon: 'beaker-outline', text: 'Verifique si hay derrame de sustancias volátiles', priority: 'important' });
                actions.push({ icon: 'aperture-outline', text: 'Ventile el área para disipar vapores', priority: 'important' });
                actions.push({ icon: 'flame-outline', text: 'Evite chispas o llamas cerca del área', priority: 'info' });
                break;
            case 'METHANE':
                actions.push({ icon: 'flame-outline', text: 'No encienda ninguna fuente de ignición', priority: 'urgent' });
                actions.push({ icon: 'aperture-outline', text: 'Ventile abriendo puertas y ventanas', priority: 'important' });
                actions.push({ icon: 'build-outline', text: 'Revise tuberías de gas natural', priority: 'important' });
                if (severity === 'HIGH' || severity === 'CRITICAL') {
                    actions.push({ icon: 'power-outline', text: 'Corte el suministro de gas si es posible', priority: 'urgent' });
                }
                break;
            default:
                actions.push({ icon: 'aperture-outline', text: 'Ventile el área como precaución', priority: 'info' });
                actions.push({ icon: 'search-outline', text: 'Investigue la fuente de la detección', priority: 'info' });
        }

        // Acciones generales por severidad
        if (severity === 'LOW') {
            actions.push({ icon: 'analytics-outline', text: 'Monitoree la evolución de las lecturas', priority: 'info' });
        }
        if (severity === 'MEDIUM') {
            actions.push({ icon: 'timer-outline', text: 'Mantenga vigilancia durante los próximos minutos', priority: 'info' });
        }

        return actions;
    };

    const suggestedActions = getSuggestedActions();

    const getPriorityStyles = (priority: 'urgent' | 'important' | 'info') => {
        switch (priority) {
            case 'urgent': return { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', iconColor: '#f87171' };
            case 'important': return { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', iconColor: '#fbbf24' };
            case 'info': return { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', iconColor: '#60a5fa' };
        }
    };

    return (
        <Modal visible={visible} animationType="fade" transparent={true} statusBarTranslucent>
            <View className="flex-1 bg-black/60 justify-end">
                <View
                    className="bg-slate-950 rounded-t-[50px] border-t border-white/10 w-full"
                    style={{
                        paddingBottom: insets.bottom + 20,
                        maxHeight: '92%',
                    }}
                >
                    <View className="flex-row justify-end px-8 pt-6">
                        <TouchableOpacity
                            onPress={onClose}
                            className="w-10 h-10 rounded-full bg-slate-900 border border-white/10 items-center justify-center"
                        >
                            <Ionicons name="close" size={24} color="#94a3b8" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView className="px-8" showsVerticalScrollIndicator={false}>
                        <View className="items-center mb-8">
                            <View className={`w-24 h-24 rounded-full items-center justify-center mb-6 ${colors.bg} border border-white/5`}>
                                <Ionicons name={getIcon() as any} size={48} color={colors.icon} />
                            </View>

                            <Text className={`text-[10px] font-black uppercase tracking-[5px] ${colors.text} mb-3`}>
                                {colors.badge}
                            </Text>

                            <Text className="text-white text-2xl font-black text-center tracking-tighter leading-8">
                                {notification.title}
                            </Text>
                        </View>

                        {/* Gas Value Card (Smaller) */}
                        {(alert?.gasValuePpm || notification.message.includes('PPM')) && (
                            <View className="bg-slate-900/50 rounded-[32px] p-6 mb-8 border border-white/5 items-center">
                                <Text className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-1">Lectura del Sensor</Text>
                                <View className="flex-row items-baseline">
                                    <Text className={`text-5xl font-black tracking-tighter ${isResolvedLocally ? 'text-slate-100' : colors.text}`}>
                                        {alert?.gasValuePpm ? alert.gasValuePpm.toFixed(1) : (notification.message.match(/(\d+\.?\d*)\s*PPM/)?.[1] || '0.0')}
                                    </Text>
                                    <Text className="text-slate-600 text-lg font-black ml-2 uppercase">ppm</Text>
                                </View>
                            </View>
                        )}

                        <View className="mb-8">
                            <View className="flex-row items-center mb-3 ml-2">
                                <Ionicons name="document-text-outline" size={14} color="#475569" />
                                <Text className="text-slate-500 text-[10px] font-black uppercase tracking-widest ml-2">Detalles del Evento</Text>
                            </View>
                            <View className="bg-slate-900/30 rounded-3xl p-6 border border-white/5">
                                <Text className="text-slate-300 text-sm leading-6 font-bold">
                                    {notification.message}
                                </Text>
                            </View>
                        </View>

                        {/* Metadata Grid */}
                        <View className="flex-row gap-3 mb-8">
                            <View className="flex-1 bg-slate-900/40 rounded-3xl p-4 border border-white/5 items-center">
                                <Ionicons name="time-outline" size={20} color="#6366f1" />
                                <Text className="text-slate-100 text-[11px] font-black mt-2 uppercase tracking-tighter">{formattedDate.split(',')[1]}</Text>
                                <Text className="text-slate-600 text-[7px] font-black uppercase tracking-widest mt-1">Hora</Text>
                            </View>
                            <View className="flex-1 bg-slate-900/40 rounded-3xl p-4 border border-white/5 items-center">
                                <Ionicons name="calendar-outline" size={20} color="#6366f1" />
                                <Text className="text-slate-100 text-[11px] font-black mt-2 uppercase tracking-tighter">{formattedDate.split(',')[0]}</Text>
                                <Text className="text-slate-600 text-[7px] font-black uppercase tracking-widest mt-1">Fecha</Text>
                            </View>
                            <View className="flex-1 bg-slate-900/40 rounded-3xl p-4 border border-white/5 items-center">
                                <View className={`w-2.5 h-2.5 rounded-full mb-1 ${isResolvedLocally ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-red-500 shadow-[0_0_10px_#ef4444]'}`} />
                                <Text className={`text-[10px] font-black mt-1 ${isResolvedLocally ? 'text-emerald-500' : 'text-red-500'}`}>
                                    {isResolvedLocally ? 'LISTO' : 'ACTIVA'}
                                </Text>
                                <Text className="text-slate-600 text-[7px] font-black uppercase tracking-widest">Estado</Text>
                            </View>
                        </View>

                        {/* Suggested Actions */}
                        {suggestedActions.length > 0 && (
                            <View className="mb-8">
                                <View className="flex-row items-center mb-3 ml-2">
                                    <Ionicons name="shield-outline" size={14} color="#475569" />
                                    <Text className="text-slate-500 text-[10px] font-black uppercase tracking-widest ml-2">Acciones Sugeridas</Text>
                                </View>
                                <View className="bg-slate-900/30 rounded-3xl border border-white/5 overflow-hidden">
                                    {suggestedActions.map((action, index) => {
                                        const styles = getPriorityStyles(action.priority);
                                        return (
                                            <View
                                                key={index}
                                                className={`flex-row items-center px-5 py-3.5 ${index !== suggestedActions.length - 1 ? 'border-b border-white/5' : ''}`}
                                            >
                                                <View className={`w-8 h-8 rounded-xl items-center justify-center mr-3 ${styles.bg} border ${styles.border}`}>
                                                    <Ionicons name={action.icon as any} size={16} color={styles.iconColor} />
                                                </View>
                                                <Text className={`flex-1 text-[13px] font-semibold ${styles.text}`}>
                                                    {action.text}
                                                </Text>
                                            </View>
                                        );
                                    })}
                                </View>
                            </View>
                        )}

                        {/* Actions Container */}
                        <View className="gap-3 mb-8">
                            {(alert || notification.alertId) && !isResolvedLocally && (
                                <TouchableOpacity
                                    onPress={handleResolveAlert}
                                    disabled={resolving}
                                    className="bg-green-600 h-16 rounded-3xl flex-row items-center justify-center shadow-2xl shadow-green-900/40 border border-green-500/20"
                                    activeOpacity={0.8}
                                >
                                    {resolving ? <ActivityIndicator color="#FFF" /> : (
                                        <>
                                            <Ionicons name="checkmark-circle" size={26} color="#FFF" />
                                            <Text className="text-white text-lg font-black uppercase tracking-tighter ml-3">Resolver Incidencia</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            )}

                            {alert?.deviceId && (
                                <TouchableOpacity
                                    onPress={handleGoToDevice}
                                    className="bg-slate-950 h-14 rounded-2xl flex-row items-center justify-center border border-white/5"
                                    activeOpacity={0.7}
                                >
                                    <Ionicons name="speedometer-outline" size={18} color="#94a3b8" />
                                    <Text className="text-slate-400 text-xs font-black uppercase tracking-widest ml-2">Ver Panel del Sensor</Text>
                                </TouchableOpacity>
                            )}

                            {isResolvedLocally && (
                                <View className="h-14 rounded-2xl flex-row items-center justify-center bg-emerald-500/10 border border-emerald-500/20">
                                    <Ionicons name="shield-checkmark" size={22} color="#10b981" />
                                    <Text className="text-emerald-500 text-base font-black uppercase tracking-tighter ml-2">Alerta Solucionada</Text>
                                </View>
                            )}
                        </View>

                        <TouchableOpacity onPress={onClose} className="py-4 rounded-xl items-center border border-white/5 mb-8">
                            <Text className="text-slate-600 text-[10px] font-black uppercase tracking-[3px]">Cerrar Detalle</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};