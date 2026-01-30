import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function PlacesSection() {
    return (
        <View style={styles.sectionContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <Text style={styles.sectionTitle}>Places with a special atmosphere</Text>
                <Text style={{ fontSize: 16 }}> ✨</Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cardsScroll}>
                <View style={styles.placeCard}>
                    <LinearGradient
                        colors={['#a8c0ff', '#3f2b96']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.cardImagePlaceholder}
                    />
                    <Text style={styles.cardTitle}>Uniqlo</Text>
                </View>

                <View style={styles.placeCard}>
                    <LinearGradient
                        colors={['#fbc2eb', '#a6c1ee']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.cardImagePlaceholder}
                    />
                    <Text style={styles.cardTitle}>H&M</Text>
                </View>

                <View style={styles.placeCard}>
                    <LinearGradient
                        colors={['#84fab0', '#8fd3f4']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.cardImagePlaceholder}
                    />
                    <Text style={styles.cardTitle}>Zara</Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    sectionContainer: {
        paddingLeft: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#666',
    },
    cardsScroll: {
        paddingBottom: 20,
    },
    placeCard: {
        marginRight: 16,
        width: 140,
    },
    cardImagePlaceholder: {
        width: 140,
        height: 100,
        borderRadius: 12,
        marginBottom: 8,
    },
    cardTitle: {
        fontWeight: 'bold',
        fontSize: 16,
        marginLeft: 4,
    },
});
