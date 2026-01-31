import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface DashboardHeaderProps {
    onMenuPress: () => void;
    points?: number;
    streak?: number;
}

export default function DashboardHeader({ onMenuPress, points = 0, streak = 0 }: DashboardHeaderProps) {
    const router = useRouter();

    return (
        <View style={styles.header}>
            <TouchableOpacity onPress={onMenuPress}>
                <Ionicons name="menu-outline" size={32} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push({
                    pathname: '/rewards',
                    params: { points, streak }
                })}
                style={styles.pointsBadge}
            >
                <Image source={{ uri: 'https://img.icons8.com/?size=96&id=qhJIQvFRwmYc&format=png' }} style={{ width: 60, height: 60 }} />
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="flame" size={16} color="#FF6B00" />
                    <Text style={styles.pointsText}>{streak}</Text>
                    {/* <Text style={[styles.pointsText, { marginLeft: 12, color: '#4E46E5' }]}>{points}</Text> */}
                </View>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginTop: 10,
        marginBottom: 20,
    },
    pointsBadge: {
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: -50
    },
    pointsText: {
        fontWeight: 'bold',
        fontSize: 16,
        marginLeft: 4,
    },
});
