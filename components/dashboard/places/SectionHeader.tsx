import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { t } from '@/i18n';

export const CARD_MARGIN = 20;

export const SectionHeader = ({ title, showSeeAll = false, onSeeAll }: { title: string, showSeeAll?: boolean, onSeeAll?: () => void }) => (
    <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {showSeeAll && (
            <TouchableOpacity onPress={onSeeAll} style={styles.seeAllButton}>
                <Text style={styles.seeAllText}>{t('placesSection.seeAll')}</Text>
                <Ionicons name="chevron-forward" size={14} color="#6366F1" />
            </TouchableOpacity>
        )}
    </View>
);

const styles = StyleSheet.create({
    sectionHeader: { 
        paddingHorizontal: CARD_MARGIN, 
        marginTop: 20, 
        marginBottom: 12, 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
    },
    sectionTitle: { fontSize: 22, fontWeight: '700', color: '#1E293B', letterSpacing: -0.5 },
    seeAllButton: { flexDirection: 'row', alignItems: 'center' },
    seeAllText: { fontSize: 14, color: '#6366F1', fontWeight: '600', marginRight: 2 },
});
