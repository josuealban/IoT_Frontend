import { AuthProvider } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthContext } from '@/hooks/useAuthContext';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';

import "../global.css";

import { usePushNotifications } from '@/hooks/usePushNotifications';

function NavigationGuard() {
  const { isAuthenticated, loading } = useAuthContext();
  const segments = useSegments();
  const router = useRouter();

  usePushNotifications(); // <-- Inicializar notificaciones globales

  useEffect(() => {
    if (loading) return;

    const isLogin = !segments[0] || segments[0] === 'login' || segments[0] === 'register';

    if (!isAuthenticated && !isLogin) {
      router.replace('/login');
    } else if (isAuthenticated && isLogin) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, loading, segments]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="login"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="register"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <NavigationGuard />
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}
