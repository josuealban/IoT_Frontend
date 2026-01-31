// app/(tabs)/index.tsx - CON TIPOS CORREGIDOS

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import { Device } from '@/interfaces/device';
import deviceService from '@/services/deviceService';
import { DeviceCard } from '@/src/presentation/components/devices/DeviceCard';
import { SafeAreaView } from 'react-native-safe-area-context';

const POLLING_INTERVAL = 5000; // 5 segundos

export default function HomeScreen() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isScreenFocused, setIsScreenFocused] = useState(false);

  // ✅ TIPO CORRECTO para React Native/TypeScript
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isFetchingRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      setIsScreenFocused(true);
      fetchDevices();
      startPolling();

      return () => {
        setIsScreenFocused(false);
        stopPolling();
      };
    }, [])
  );

  const startPolling = () => {
    stopPolling();
    
    pollingIntervalRef.current = setInterval(() => {
      fetchDevices(true);
    }, POLLING_INTERVAL);

    console.log(`🔄 Home polling iniciado cada ${POLLING_INTERVAL / 1000}s`);
  };

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
      console.log('⏹️ Home polling detenido');
    }
  };

  const fetchDevices = async (isPolling: boolean = false) => {
    if (isFetchingRef.current) return;

    try {
      isFetchingRef.current = true;
      const data = await deviceService.getDevices();
      
      if (Array.isArray(data)) {
        if (isPolling) {
          const hasChanges = JSON.stringify(devices) !== JSON.stringify(data);
          if (hasChanges) {
            console.log('📊 Dispositivos actualizados:', {
              total: data.length,
              online: data.filter(d => d.status === 'ONLINE').length,
              timestamp: new Date().toLocaleTimeString()
            });
          }
        }
        setDevices(data);
      } else {
        console.warn('Expected array of devices but got:', data);
        setDevices([]);
      }
    } catch (error) {
      console.error('Error fetching devices:', error);
      if (!isPolling) {
        setDevices([]);
      }
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDevices();
  };

  const renderHeader = () => (
    <View className="mb-6">
      <View className="flex-row justify-between items-center mb-6">
        <View className="flex-1">
          <Text className="text-slate-400 text-sm font-medium">Bienvenido</Text>
          <Text className="text-slate-50 text-2xl font-bold">IoT Monitor</Text>
        </View>
        {isScreenFocused && (
          <View className="flex-row items-center gap-2 bg-slate-800 px-3 py-2 rounded-lg">
            <View className="w-2 h-2 rounded-full bg-green-500" />
            <Text className="text-green-500 text-xs font-medium">
              Actualizando
            </Text>
          </View>
        )}
      </View>

      <View className="flex-row gap-3 mb-2">
        <View className="flex-1 bg-blue-600/20 p-4 rounded-xl border border-blue-600/30">
          <View className="flex-row items-center gap-2 mb-1">
            <Ionicons name="hardware-chip" size={16} color="#3b82f6" />
            <Text className="text-blue-400 text-xs font-bold">TOTAL</Text>
          </View>
          <Text className="text-slate-50 text-2xl font-bold">{devices.length}</Text>
        </View>

        <View className="flex-1 bg-green-600/20 p-4 rounded-xl border border-green-600/30">
          <View className="flex-row items-center gap-2 mb-1">
            <Ionicons name="wifi" size={16} color="#10b981" />
            <Text className="text-green-400 text-xs font-bold">ONLINE</Text>
          </View>
          <Text className="text-slate-50 text-2xl font-bold">
            {devices.filter(d => d.status === 'ONLINE').length}
          </Text>
        </View>

        <View className="flex-1 bg-red-600/20 p-4 rounded-xl border border-red-600/30">
          <View className="flex-row items-center gap-2 mb-1">
            <Ionicons name="warning" size={16} color="#ef4444" />
            <Text className="text-red-400 text-xs font-bold">ALERTAS</Text>
          </View>
          <Text className="text-slate-50 text-2xl font-bold">
            {devices.reduce((acc, d) => acc + (d.alerts?.length || 0), 0)}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-950" edges={['top']}>
      <View className="flex-1 px-4 pt-4">
        {loading && !refreshing ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text className="text-slate-400 mt-4">Cargando dispositivos...</Text>
          </View>
        ) : (
          <FlatList
            data={devices}
            renderItem={({ item }) => <DeviceCard device={item} />}
            keyExtractor={(item) => item.id.toString()}
            ListHeaderComponent={renderHeader}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#3b82f6"
                colors={['#3b82f6']}
              />
            }
            ListEmptyComponent={
              <View className="items-center justify-center py-10">
                <View className="w-16 h-16 rounded-full bg-slate-800 items-center justify-center mb-4">
                  <Ionicons name="cube-outline" size={32} color="#64748b" />
                </View>
                <Text className="text-slate-400 text-center text-lg font-medium mb-2">
                  No tienes dispositivos registrados
                </Text>
                <Text className="text-slate-500 text-center text-sm mb-4">
                  Agrega tu primer dispositivo ESP32 para comenzar
                </Text>
                <TouchableOpacity
                  className="mt-4 bg-blue-600 px-6 py-3 rounded-lg"
                  onPress={() => { }}
                >
                  <Text className="text-white font-medium">Agregar Dispositivo</Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}