import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const CategoryIcon = ({ imageUrl, label, bgColor }: { imageUrl: any, label: string, bgColor: string }) => (
    <TouchableOpacity style={styles.categoryItem} activeOpacity={0.7}>
        <View style={[styles.categoryIconBg, { backgroundColor: bgColor }]}>
            <Image
                source={imageUrl}
                style={styles.categoryIconImage}
                contentFit="contain"
            />
            <Text style={styles.categoryLabel}>{label}</Text>

        </View>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    categoryItem: { alignItems: 'center', marginRight: 20 },
    categoryIconBg: {
        width: 70,
        height: 70,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,

    },
    categoryIconImage: { width: 40, height: 40 },
    categoryLabel: { fontSize: 11, fontWeight: '700', color: '#334155' },
});
