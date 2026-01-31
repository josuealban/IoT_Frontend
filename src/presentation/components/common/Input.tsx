// src/presentation/components/common/Input.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    KeyboardTypeOptions,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

interface InputProps {
    label?: string;
    placeholder?: string;
    value: string;
    onChangeText: (text: string) => void;
    icon?: keyof typeof Ionicons.glyphMap;
    isPassword?: boolean;
    keyboardType?: KeyboardTypeOptions;
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    error?: string;
}

export const Input: React.FC<InputProps> = ({
    label,
    placeholder,
    value,
    onChangeText,
    icon,
    isPassword = false,
    keyboardType = 'default',
    autoCapitalize = 'none',
    error
}) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <View className="mb-4">
            {label && (
                <Text className="text-sm font-medium text-gray-700 mb-2">
                    {label}
                </Text>
            )}

            <View className="relative">
                <View className="flex-row items-center bg-white border border-gray-300 rounded-xl px-4 py-3">
                    {icon && (
                        <Ionicons
                            name={icon}
                            size={20}
                            color="#6B7280"
                            style={{ marginRight: 12 }}
                        />
                    )}

                    <TextInput
                        className="flex-1 text-base text-gray-900"
                        placeholder={placeholder}
                        placeholderTextColor="#9CA3AF"
                        value={value}
                        onChangeText={onChangeText}
                        secureTextEntry={isPassword && !showPassword}
                        keyboardType={keyboardType}
                        autoCapitalize={autoCapitalize}
                        autoCorrect={false}
                    />

                    {isPassword && (
                        <TouchableOpacity
                            onPress={() => setShowPassword(!showPassword)}
                            className="ml-2"
                        >
                            <Ionicons
                                name={showPassword ? 'eye-off' : 'eye'}
                                size={20}
                                color="#6B7280"
                            />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {error && (
                <Text className="text-red-500 text-xs mt-1 ml-1">
                    {error}
                </Text>
            )}
        </View>
    );
};
