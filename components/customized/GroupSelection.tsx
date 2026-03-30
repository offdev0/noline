import { t } from '@/i18n';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

const GROUP_TYPES = [
    { id: 'alone', icon: 'person-outline', label: 'alone', color: '#6366F1' },
    { id: 'couple', icon: 'heart-outline', label: 'couple', color: '#EC4899' },
    { id: 'friends', icon: 'people-outline', label: 'friends', color: '#8B5CF6' },
    { id: 'family', icon: 'home-outline', label: 'family', color: '#F59E0B' },
];

interface GroupSelectionProps {
    onSelect: (groupId: string) => void;
}

export const GroupSelection: React.FC<GroupSelectionProps> = ({ onSelect }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>{t('route.whoAreYouWith')}</Text>
            <View style={styles.grid}>
                {GROUP_TYPES.map(group => (
                    <TouchableOpacity
                        key={group.id}
                        style={styles.card}
                        onPress={() => onSelect(group.id)}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={[group.color + '15', group.color + '25']}
                            style={styles.cardGradient}
                        >
                            <View style={[styles.iconCircle, { backgroundColor: group.color + '20' }]}>
                                <Ionicons name={group.icon as any} size={28} color={group.color} />
                            </View>
                            <Text style={styles.groupLabel}>{t(`route.${group.label}`)}</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {},
    label: {
        fontSize: 22,
        fontWeight: '700',
        color: '#111111ff',
        marginBottom: 26,
        marginTop: 20
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    card: {
        width: (width - 52) / 2,
        backgroundColor: '#fff',
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    cardGradient: {
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    iconCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    groupLabel: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1E293B',
    },
});
