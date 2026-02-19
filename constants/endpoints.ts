// constants/endpoints.ts - ARCHIVO COMPLETO ACTUALIZADO

// Auth
export const authRegister = '/auth/register';
export const authLogin = '/auth/login';

// Users
export const usersGetAll = '/users';
export const usersGetById = '/users/:id';
export const usersDeactivate = '/users/:id/deactivate';

// Device
export const deviceCreate = '/device';
export const deviceGetAll = '/device';
export const deviceGetById = (id: number | string) => `/device/${id}`;
export const deviceUpdate = (id: number | string) => `/device/${id}`;
export const deviceDeactivate = (id: number | string) => `/device/${id}/deactivate`;
export const deviceSettingsCreate = (id: number | string) => `/device/${id}/settings`;
export const deviceSettingsUpdate = (id: number | string) => `/device/${id}/settings`;
export const deviceSettingsGet = (id: number | string) => `/device/${id}/settings`;

// Sensor Data
export const sensorDataCreate = '/sensor-data';
export const sensorDataCommand = '/sensor-data/command/:deviceKey';
export const sensorDataConfig = '/sensor-data/config/:deviceKey';
export const alertResolve = (id: number | string) => `/sensor-data/alerts/${id}/resolve`;