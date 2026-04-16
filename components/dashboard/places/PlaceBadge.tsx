import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface PlaceBadgeProps {
    type: 'hot' | 'nowait' | 'star';
    text: string | number;
    icon?: string;
}

export const PlaceBadge = ({ type, text, icon }: PlaceBadgeProps) => {
    if (type === 'hot') {
        return (
            <View style={[styles.badge, styles.hotBadge]}>
                <Text style={styles.badgeEmoji}>🔥</Text>
                <Text style={styles.badgeTextHot}>{text}</Text>
            </View>
        );
    }
    if (type === 'nowait') {
        return (
            <View style={[styles.badge, styles.noWaitBadge]}>
                <Ionicons name="time-outline" size={12} color="#fff" style={{ marginRight: 2 }} />
                <Text style={styles.badgeTextWhite}>{text}</Text>
            </View>
        );
    }
    return (
        <View style={[styles.badge, styles.ratingBadge]}>
            <Ionicons name="star" size={15} color="#f9e723ff" style={{ marginRight: 2 }} />
            <Text style={styles.badgeTextDark}>{text}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    hotBadge: { backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
    noWaitBadge: { backgroundColor: '#0891B2' },
    ratingBadge: { backgroundColor: '#fff' },
    badgeEmoji: { fontSize: 14, marginRight: 4 },
    badgeTextHot: { color: '#fff', fontWeight: '800', fontSize: 13 },
    badgeTextWhite: { color: '#fff', fontWeight: '700', fontSize: 12 },
    badgeTextDark: { color: '#1E293B', fontWeight: '800', fontSize: 13 },
});
