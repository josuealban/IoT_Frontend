// plugins/withSoundFiles.js
// Copia los archivos de sonido de alertas a android/res/raw/ durante el Prebuild de Expo

const { withDangerousMod } = require('@expo/config-plugins');
const path = require('path');
const fs = require('fs');

/**
 * Config plugin que copia los archivos .mp3 de assets/sounds/
 * a android/app/src/main/res/raw/ para que los canales de
 * notificación de Android puedan usarlos como sonidos personalizados.
 */
const withSoundFiles = (config) => {
    return withDangerousMod(config, [
        'android',
        async (config) => {
            const soundsDir = path.join(config.modRequest.projectRoot, 'assets', 'sounds');
            const rawDir = path.join(
                config.modRequest.platformProjectRoot,
                'app',
                'src',
                'main',
                'res',
                'raw'
            );

            // Crear res/raw si no existe
            if (!fs.existsSync(rawDir)) {
                fs.mkdirSync(rawDir, { recursive: true });
            }

            // Copiar todos los .mp3 de assets/sounds/ a res/raw/
            if (fs.existsSync(soundsDir)) {
                const files = fs.readdirSync(soundsDir).filter((f) => f.endsWith('.mp3'));
                for (const file of files) {
                    const src = path.join(soundsDir, file);
                    const dest = path.join(rawDir, file);
                    fs.copyFileSync(src, dest);
                    console.log(`[withSoundFiles] Copiado: ${file} → android/app/src/main/res/raw/`);
                }
            } else {
                console.warn('[withSoundFiles] ⚠️ No se encontró assets/sounds/');
            }

            return config;
        },
    ]);
};

module.exports = withSoundFiles;
