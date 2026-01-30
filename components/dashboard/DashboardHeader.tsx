import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface DashboardHeaderProps {
    onMenuPress: () => void;
    points?: number;
}

export default function DashboardHeader({ onMenuPress, points = 0 }: DashboardHeaderProps) {
    return (
        <View style={styles.header}>
            <TouchableOpacity onPress={onMenuPress}>
                <Ionicons name="menu-outline" size={32} color="#666" />
            </TouchableOpacity>
            <View style={styles.pointsBadge}>
                <Ionicons name="medal-outline" size={24} color="#888" style={{ marginRight: 4 }} />
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="flame" size={16} color="#FF6B00" />
                    <Text style={styles.pointsText}>{points}</Text>
                </View>
            </View>
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
    },
    pointsText: {
        fontWeight: 'bold',
        fontSize: 14,
        marginLeft: 4,
    },
});
