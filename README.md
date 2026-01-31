# 🌐 IoT Front - Sistema de Monitoreo de Gas

Frontend móvil para el sistema IoT de monitoreo de gas con sensores MQ2 y ESP32.

## 📋 Descripción

Aplicación móvil desarrollada con React Native y Expo Router que permite:
- Monitorear dispositivos IoT en tiempo real
- Visualizar lecturas de sensores de gas
- Recibir alertas cuando se detectan niveles peligrosos
- Gestionar configuraciones de dispositivos
- Ver historial de lecturas y alertas

## 🏗️ Stack Tecnológico

- **Framework**: React Native con Expo 54
- **Navegación**: Expo Router 6
- **Estilos**: NativeWind (Tailwind CSS para React Native)
- **HTTP Client**: Axios
- **Autenticación**: JWT con SecureStore
- **Lenguaje**: TypeScript

## 📁 Estructura del Proyecto

```
IoTFront/
├── app/                          # Rutas de la aplicación (Expo Router)
│   ├── _layout.tsx              # Layout principal con AuthProvider
│   ├── index.tsx                # Redirección inicial
│   ├── login.tsx                # Ruta de login
│   ├── register.tsx             # Ruta de registro
│   └── (tabs)/                  # Rutas protegidas (tabs)
├── config/
│   └── Config.ts                # Configuración de API URL
├── context/
│   └── AuthContext.tsx          # Provider de autenticación
├── hooks/
│   └── useAuthContext.tsx       # Hook para acceder al contexto de auth
├── interfaces/
│   └── auth.ts                  # Interfaces de autenticación
├── services/
│   ├── api.ts                   # Configuración de Axios con interceptors
│   └── authService.ts           # Servicio de autenticación
├── src/
│   └── presentation/
│       ├── components/
│       │   └── common/
│       │       └── Input.tsx    # Componente de input reutilizable
│       └── screens/
│           └── auth/
│               ├── LoginScreen.tsx
│               └── RegisterScreen.tsx
├── .env                         # Variables de entorno
├── global.css                   # Estilos globales de Tailwind
├── tailwind.config.js           # Configuración de Tailwind
└── package.json
```

## 🚀 Instalación

### Prerrequisitos

- Node.js 18+ 
- npm o yarn
- Expo CLI
- Android Studio (para Android) o Xcode (para iOS)

### Pasos

1. **Clonar el repositorio**
```bash
cd IoTFront
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**

Crear archivo `.env` en la raíz:
```env
EXPO_PUBLIC_API_URL=http://localhost:3000
```

> **Nota**: Para desarrollo en dispositivo físico, usa la IP de tu computadora:
> ```env
> EXPO_PUBLIC_API_URL=http://192.168.1.X:3000
> ```

4. **Iniciar el servidor de desarrollo**
```bash
npm start
```

5. **Ejecutar en dispositivo**
- Escanea el código QR con Expo Go (Android/iOS)
- O presiona `a` para Android o `i` para iOS

## 🔐 Autenticación

### Flujo de Autenticación

1. **Login/Register**: Usuario ingresa credenciales
2. **Backend valida** y retorna tokens JWT
3. **Tokens se guardan** en SecureStore (encriptado)
4. **Interceptor de Axios** agrega token automáticamente
5. **Refresh automático** cuando el access token expira
6. **NavigationGuard** protege rutas según estado de auth

### Endpoints de Auth

```typescript
POST /auth/login
Body: { email: string, password: string }
Response: { accessToken, refreshToken, user }

POST /auth/register
Body: { username: string, email: string, password: string }
Response: { accessToken, refreshToken, user }

POST /auth/refresh
Body: { refreshToken: string }
Response: { accessToken }

POST /auth/logout
```

## 🎨 Paleta de Colores

El proyecto usa una paleta de colores específica para el sistema IoT:

```javascript
// Estados de Dispositivo
online: '#10b981'       // Verde
offline: '#6b7280'      // Gris
maintenance: '#f59e0b'  // Amarillo

// Severidad de Alertas
severityLow: '#10b981'      // < 400 PPM
severityMedium: '#f59e0b'   // 400-599 PPM
severityHigh: '#f97316'     // 600-999 PPM
severityCritical: '#ef4444' // >= 1000 PPM

// UI Base (Dark Mode)
background: '#0f172a'
surface: '#1e293b'
textPrimary: '#f8fafc'
```

## 📱 Pantallas Principales

### 1. LoginScreen
- Formulario de email y contraseña
- Validación en tiempo real
- Loading states
- Navegación a registro
- SafeAreaView para dispositivos nativos

### 2. RegisterScreen
- Formulario de registro completo
- Validación de contraseñas coincidentes
- Mínimo 8 caracteres
- Navegación de regreso a login

### 3. Dashboard (Próximamente)
- Resumen de dispositivos
- Alertas activas
- Gráficas de tendencias

### 4. Dispositivos (Próximamente)
- Lista de dispositivos
- Estado en tiempo real
- Configuración de umbrales

### 5. Alertas (Próximamente)
- Historial de alertas
- Filtros por severidad
- Marcar como resueltas

## 🔧 Componentes Reutilizables

### Input Component

```tsx
<Input
  label="Correo electrónico"
  placeholder="Introduce tu correo"
  value={email}
  onChangeText={setEmail}
  icon="mail"
  keyboardType="email-address"
  autoCapitalize="none"
  isPassword={false}
  error="Campo requerido"
/>
```

**Props:**
- `label`: Etiqueta del input
- `placeholder`: Texto placeholder
- `value`: Valor controlado
- `onChangeText`: Callback de cambio
- `icon`: Icono de Ionicons
- `isPassword`: Toggle de visibilidad
- `keyboardType`: Tipo de teclado
- `autoCapitalize`: Capitalización automática
- `error`: Mensaje de error

## 🔄 Gestión de Estado

### AuthContext

```typescript
interface AuthContextType {
  isAuthenticated: boolean;
  userId: number | null;
  accessToken: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean }>;
  register: (username: string, email: string, password: string) => Promise<{ success: boolean }>;
  logout: () => Promise<void>;
}
```

### Uso en componentes

```tsx
import { useAuthContext } from '@/hooks/useAuthContext';

const MyComponent = () => {
  const { isAuthenticated, login, logout } = useAuthContext();
  
  // Tu lógica aquí
};
```

## 🌐 Servicios HTTP

### API Service (Axios)

El servicio de API incluye:
- **Base URL** configurada desde .env
- **Interceptor de Request**: Agrega token automáticamente
- **Interceptor de Response**: Maneja refresh token automático
- **Manejo de errores**: Limpia tokens si refresh falla

```typescript
// Ejemplo de uso
import api from '@/services/api';

const response = await api.get('/device');
const devices = response.data;
```

## 🔒 Seguridad

### SecureStore
- Tokens almacenados de forma encriptada
- No accesibles desde JavaScript
- Protegidos por el sistema operativo

### Tokens JWT
- Access Token: 1 hora de validez
- Refresh Token: 7 días de validez
- Renovación automática

### Rutas Protegidas
- NavigationGuard verifica autenticación
- Redirección automática a login si no autenticado
- Redirección a tabs si ya autenticado

## 📦 Scripts Disponibles

```bash
# Iniciar servidor de desarrollo
npm start

# Ejecutar en Android
npm run android

# Ejecutar en iOS
npm run ios

# Ejecutar en Web
npm run web

# Linting
npm run lint
```

## 🐛 Troubleshooting

### Error: "Cannot find module"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Error: "Metro bundler failed"
```bash
npm start -- --clear
```

### Error: "Unable to resolve module"
```bash
watchman watch-del-all
rm -rf node_modules
npm install
npm start -- --reset-cache
```

### Error de conexión con backend
- Verifica que el backend esté corriendo en `http://localhost:3000`
- Si usas dispositivo físico, cambia a IP local en `.env`
- Verifica que no haya firewall bloqueando

## 🔮 Próximas Características

- [ ] Dashboard con estadísticas
- [ ] Lista de dispositivos con estado en tiempo real
- [ ] Gráficas de lecturas históricas
- [ ] Centro de notificaciones
- [ ] Configuración de dispositivos
- [ ] Filtros avanzados de alertas
- [ ] Modo oscuro/claro
- [ ] Notificaciones push
- [ ] Exportar datos a CSV

## 📚 Recursos

- [Expo Documentation](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [NativeWind](https://www.nativewind.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Axios](https://axios-http.com/)

## 👥 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado y confidencial.

## 📞 Contacto

Para soporte o consultas, contacta al equipo de desarrollo.

---

**Desarrollado con ❤️ para el Sistema IoT de Monitoreo de Gas**
