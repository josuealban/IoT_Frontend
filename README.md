# 📱 IoTFront — Aplicación Móvil de Monitoreo IoT

Sistema de monitoreo de gases en tiempo real para dispositivos ESP32 equipados con sensores MQ (MQ2, MQ3, MQ5, MQ9) y DHT11. Construido con **React Native (Expo)** y diseñado para recibir alertas push, visualizar datos en vivo vía WebSocket, y controlar actuadores de forma remota.

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Arquitectura](#-arquitectura)
- [Stack Tecnológico](#-stack-tecnológico)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
  - [Windows](#windows)
  - [Linux](#linux)
- [Configuración](#-configuración)
- [Ejecución](#-ejecución)
- [Construcción del APK](#-construcción-del-apk)
- [Funcionalidades Detalladas](#-funcionalidades-detalladas)
- [Variables de Entorno](#-variables-de-entorno)
- [Screens y Navegación](#-screens-y-navegación)

---

## ✨ Características

- 🔴 **Monitoreo en tiempo real** de 4 sensores de gas (MQ2, MQ3, MQ5, MQ9) + temperatura y humedad
- 📊 **WebSocket** para datos instantáneos desde ESP32
- 🔔 **Notificaciones push** (FCM) con sonidos personalizados por severidad (low, medium, high, critical)
- 🎛️ **Control manual remoto** de actuadores (ventilador y ventana servo)
- 🔐 **Autenticación JWT** con refresh token automático

---

## 🏗️ Arquitectura

```
┌─────────────┐     WebSocket      ┌──────────────┐     HTTP/WS     ┌──────────┐
│   ESP32 +   │ ──────────────────▶│   Backend    │◀───────────────│  IoTFront │
│  Sensores   │    Sensor Data     │  (NestJS)    │   REST + WS    │  (Expo)  │
│  MQ2-MQ9    │ ──────────────────▶│  PostgreSQL  │───────────────▶│  React   │
│  DHT11      │    HTTP Alertas    │  Firebase    │   Push (FCM)   │  Native  │
└─────────────┘                    └──────────────┘                └──────────┘
```

---

## 🛠️ Stack Tecnológico

| Tecnología | Versión | Uso |
|---|---|---|
| React Native | 0.81.5 | Framework móvil |
| Expo | ~54.0 | Plataforma de desarrollo |
| TypeScript | ~5.9 | Tipado estático |
| NativeWind | 4.x | Estilos (TailwindCSS) |
| Axios | 1.7.x | Cliente HTTP |
| Socket.io Client | 4.8.x | WebSocket en tiempo real |
| Expo Notifications | 0.32.x | Push notifications (FCM) |
| Expo Secure Store | 14.x | Almacenamiento seguro de tokens |
| Expo Router | 6.x | Navegación file-based |

---

## 📂 Estructura del Proyecto

```
IoTFront/
├── app/                          # Pantallas (file-based routing)
│   ├── (tabs)/                   # Tab navigator
│   │   ├── index.tsx             # Home — lista de dispositivos + alertas activas
│   │   ├── notifications.tsx     # Centro de notificaciones
│   │   └── _layout.tsx           # Layout del tab navigator
│   ├── device/
│   │   ├── [id].tsx              # Detalle de dispositivo (sensores en vivo, actuadores)
│   │   └── add.tsx               # Agregar nuevo dispositivo
│   ├── notification/
│   │   └── [id].tsx              # Detalle de notificación
│   ├── settings.tsx              # Configuración de perfil
│   ├── login.tsx                 # Pantalla de login
│   ├── register.tsx              # Pantalla de registro
│   └── _layout.tsx               # Layout raíz + protección de rutas
├── components/                   # Componentes compartidos
│   └── DeviceSettingsModal.tsx   # Modal de configuración de dispositivo
├── config/
│   └── Config.ts                 # Configuración (API_URL desde env)
├── constants/
│   └── endpoints.ts              # Endpoints del API centralizados
├── context/
│   └── AuthContext.tsx            # Contexto de autenticación global
├── hooks/
│   ├── useAuthContext.ts          # Hook de autenticación
│   └── usePushNotifications.ts   # Hook de notificaciones push (FCM)
├── interfaces/                   # TypeScript interfaces
│   ├── alert.ts                  # Tipos de alerta
│   ├── auth.ts                   # Tipos de autenticación
│   ├── device.ts                 # Tipos de dispositivo
│   └── notification.ts           # Tipos de notificación
├── services/                     # Capa de servicios (API)
│   ├── api.ts                    # Instancia Axios + interceptors (refresh token)
│   ├── apiService.ts             # Servicio genérico CRUD
│   ├── authService.ts            # Servicio de autenticación
│   ├── deviceService.ts          # Servicio de dispositivos
│   ├── notificationSensorService.ts  # Servicio de notificaciones
│   ├── notificationServices.ts   # Toast notifications (UI)
│   ├── socketService.ts          # WebSocket con auto-reconexión
│   └── userServices.ts           # Servicio de usuarios
├── src/presentation/
│   ├── components/               # Componentes reutilizables
│   │   ├── common/Input.tsx      # Input estilizado
│   │   ├── devices/DeviceCard.tsx # Tarjeta de dispositivo
│   │   └── notifications/        # Componentes de notificaciones
│   └── screens/                  # Pantallas adicionales
│       ├── auth/RegisterScreen.tsx
│       └── device/AddDeviceScreen.tsx
├── android/app/src/main/res/raw/ # Sonidos de notificación
│   ├── low.mp3
│   ├── medium.mp3
│   ├── high.mp3
│   └── critical.mp3
├── .env                          # Variables de entorno (NO se sube)
├── .env.example                  # Ejemplo de variables de entorno
├── app.json                      # Configuración Expo
├── eas.json                      # Configuración EAS Build
├── package.json                  # Dependencias
└── tailwind.config.js            # Configuración TailwindCSS/NativeWind
```

---

## 📌 Requisitos Previos

- **Node.js** >= 18.x
- **npm** >= 9.x
- **Git**
- **Expo CLI** (se instala con npx, no requiere instalación global)
- **Android Studio** (para emulador) o un **dispositivo Android físico**
- **Backend corriendo** (ver repositorio del backend)

---

## 🚀 Instalación

### Windows

```powershell
# 1. Clonar el repositorio
git clone https://github.com/Guasmo/IoTFront.git
cd IoTFront

# 2. Instalar dependencias
npm install

# 3. Copiar archivo de entorno
copy .env.example .env

# 4. Editar .env con tu configuración
# Usar tu editor preferido (notepad, VS Code, etc.)
notepad .env

# 5. Configurar la variable EXPO_PUBLIC_API_URL:
#    - Emulador Android: http://10.0.2.2:3000
#    - Dispositivo físico: http://TU_IP_LOCAL:3000
#    - Producción: https://tu-dominio.com
```

### Linux

```bash
# 1. Clonar el repositorio
git clone https://github.com/Guasmo/IoTFront.git
cd IoTFront

# 2. Instalar dependencias
npm install

# 3. Copiar archivo de entorno
cp .env.example .env

# 4. Editar .env con tu configuración
nano .env  # o vim .env

# 5. Configurar la variable EXPO_PUBLIC_API_URL:
#    - Emulador Android: http://10.0.2.2:3000
#    - Dispositivo físico: http://TU_IP_LOCAL:3000
#    - Producción: https://tu-dominio.com
```

---

## ⚙️ Configuración

### Variables de Entorno (`.env`)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `EXPO_PUBLIC_API_URL` | URL del backend API | `http://192.168.1.100:3000` |

### Firebase (Push Notifications)

1. Crear proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Agregar app Android con package name: `com.guasmo.IoTFront`
3. Descargar `google-services.json` y colocarlo en la raíz del proyecto
4. El archivo **NO se sube a git** (está en `.gitignore`)

> ⚠️ **Importante**: Sin `google-services.json`, las notificaciones push no funcionarán, pero el resto de la app sí.

---

## ▶️ Ejecución

### Modo desarrollo (con Expo Go o dev client)

```bash
# Iniciar servidor de desarrollo
npx expo start

# O directamente en Android
npx expo start --android

# Para dispositivo físico con QR code
npx expo start --tunnel
```

### Con emulador Android Studio

1. Abrir Android Studio → **Virtual Device Manager**
2. Crear/Iniciar un emulador (API 33+ recomendado)
3. Ejecutar: `npx expo run:android`

### Con dispositivo físico

1. Habilitar **Opciones de desarrollador** → **Depuración USB** en el dispositivo
2. Conectar por USB
3. Ejecutar: `npx expo run:android`

> 📌 **Nota para dispositivo físico**: La variable `EXPO_PUBLIC_API_URL` debe apuntar a la IP local de tu PC (no `localhost`), y ambos deben estar en la misma red WiFi.

---

## 📦 Construcción del APK

### Usando EAS Build (recomendado)

```bash
# Instalar EAS CLI
npm install -g eas-cli

# Iniciar sesión en Expo
eas login

# Build APK de desarrollo
eas build --platform android --profile development

# Build APK de preview (sin dev tools)
eas build --platform android --profile preview

# Build AAB de producción (Google Play)
eas build --platform android --profile production
```

### Build local (sin EAS)

```bash
# Generar proyecto nativo
npx expo prebuild

# Compilar APK
cd android && ./gradlew assembleRelease
```

---

## 🔍 Funcionalidades Detalladas

### 🏠 Home Screen

- Muestra todos los dispositivos del usuario con su estado (Online/Offline)
- Panel de alertas activas con indicadores de severidad
- Acciones rápidas según el tipo de gas detectado
- Polling automático cada 15 segundos

### 📊 Device Detail Screen

- Datos de sensores MQ en tiempo real vía **WebSocket**
- Temperatura y humedad del DHT11
- Control manual de **ventilador** (relé) y **ventana** (servo)
- Historial de alertas con opción de resolver
- Configuración de umbrales personalizados

### 🔔 Notifications Screen

- Centro de notificaciones agrupadas por día (Hoy/Ayer/Anterior)
- Modal de detalle con información completa de la alerta
- Resolver alertas directamente desde la notificación
- Sonidos personalizados por severidad (low, medium, high, critical)

### ⚙️ Settings Screen

- Edición de perfil (nombre, email)
- Información de la cuenta
- Cierre de sesión seguro

### 🔐 Autenticación

- Login con email/contraseña
- Registro de nuevos usuarios
- JWT con refresh token automático (interceptor Axios)
- Autenticación optimista (arranque rápido + validación en background)
- Modo offline (mantiene sesión local si no hay red)

---

## 🗺️ Screens y Navegación

```
/                          → Redirect a /(tabs)
/(tabs)/index              → Home (lista de dispositivos)
/(tabs)/notifications      → Centro de notificaciones
/device/[id]               → Detalle de dispositivo (sensores + actuadores)
/device/add                → Agregar nuevo dispositivo
/notification/[id]         → Detalle de notificación
/settings                  → Configuración de perfil
/login                     → Iniciar sesión
/register                  → Crear cuenta
```

---

## 🤝 Comunicación con el Backend

| Endpoint | Método | Descripción |
|---|---|---|
| `/auth/login` | POST | Iniciar sesión |
| `/auth/register` | POST | Registrar usuario |
| `/auth/refresh` | POST | Refrescar token JWT |
| `/auth/check-status` | GET | Verificar sesión activa |
| `/device` | GET | Listar dispositivos del usuario |
| `/device` | POST | Crear dispositivo |
| `/device/:id` | GET | Obtener dispositivo con sensores y alertas |
| `/device/:id` | PATCH | Actualizar dispositivo |
| `/device/:id/settings` | PATCH | Actualizar configuración |
| `/sensor-data/actuator` | POST | Control manual de actuadores |
| `/sensor-data/alerts/:id/resolve` | PATCH | Resolver alerta |
| `/notifications` | GET | Listar notificaciones |
| `/notifications/register-token` | POST | Registrar token FCM |

### WebSocket Events

| Evento | Dirección | Descripción |
|---|---|---|
| `subscribe` | Client → Server | Suscribirse a un dispositivo |
| `unsubscribe` | Client → Server | Desuscribirse |
| `sensorUpdate` | Server → Client | Datos de sensores en tiempo real |
| `actuatorCommand` | Server → Client | Comando de actuador |

---

## 📄 Licencia

Este proyecto es parte de un trabajo de grado. Uso educativo.
