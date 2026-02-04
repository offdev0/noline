import { useUser } from '@/context/UserContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface DashboardHeaderProps {
    onMenuPress: () => void;
}

export default function DashboardHeader({ onMenuPress }: DashboardHeaderProps) {
    const router = useRouter();
    const { medal, streak, points } = useUser();

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
                {medal && (
                    <Image
                        source={medal}
                        style={styles.medalImage}
                        resizeMode="contain"
                    />
                )}
                {streak >= 2 && (
                    <View style={styles.streakBadge}>
                        <Ionicons name="flame" size={14} color="#FF6B00" />
                        <Text style={styles.streakText}>{streak}</Text>
                    </View>
                )}
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
        alignItems: 'center',
        position: 'relative',
    },
    medalImage: {
        width: 65,
        height: 65,
        marginBottom: -15, // Overlap streak info slightly
    },
    streakBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    streakText: {
        fontWeight: 'bold',
        fontSize: 12,
        marginLeft: 2,
        color: '#334155',
    },
});
